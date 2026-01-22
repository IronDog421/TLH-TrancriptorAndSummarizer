import os
import subprocess
import tempfile
import uuid
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, BitsAndBytesConfig
import whisper
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LLM CONFIGURATION ---
# Using a powerful 14B parameter model with 4-bit quantization
model_name = "Qwen/Qwen1.5-14B-Chat"

# 4-bit quantization configuration
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

print(f"Loading {model_name} with 4-bit quantization...")

# Load Model and Tokenizer
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Create Text Generation Pipeline
llm_pipeline = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=1000,
    do_sample=True,
    temperature=0.7,
    top_p=0.95,
    # Stop generation at the end of the assistant's message
    eos_token_id=tokenizer.eos_token_id
)

# Load Whisper
print("Loading Whisper...")
transcriber = whisper.load_model("base")

@app.post("/api/process-media")
async def process_media(file: UploadFile = File(...)):
    if not file.content_type.startswith(("video/", "audio/")):
        raise HTTPException(status_code=400, detail="Invalid file type.")

    with tempfile.TemporaryDirectory() as temp_dir:
        file_extension = os.path.splitext(file.filename)[1]
        temp_file_path = os.path.join(temp_dir, f"{uuid.uuid4()}{file_extension}")

        with open(temp_file_path, "wb") as buffer:
            buffer.write(await file.read())

        # Audio Extraction
        audio_file_path = temp_file_path
        if file.content_type.startswith("video/"):
            audio_file_path = os.path.join(temp_dir, "audio.mp3")
            try:
                subprocess.run(
                    ["ffmpeg", "-i", temp_file_path, "-vn", "-acodec", "libmp3lame", "-ab", "192k", "-ar", "16000", "-ac", "1", audio_file_path],
                    check=True, capture_output=True, text=True
                )
            except subprocess.CalledProcessError as e:
                raise HTTPException(status_code=500, detail=f"FFmpeg error: {e.stderr}")
            except FileNotFoundError:
                raise HTTPException(status_code=500, detail="FFmpeg not found.")

        # 1. Transcribe
        try:
            transcription_result = transcriber.transcribe(audio_file_path)
            transcription = transcription_result["text"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

        # 2. Summarize (with Local LLM)
        try:
            # Create a prompt using the ChatML format for Hermes models
            # Note: The tokenizer should add the bos token automatically.
            prompt = f"""<|im_start|>system
Tu tarea es actuar como un experto en resúmenes. Resume el siguiente texto en español.
**Reglas Importantes:**
1. El resumen debe estar escrito **exclusivamente en español**.
2. No mezcles español con inglés ni con ningún otro idioma.
3. Proporciona un resumen claro y conciso que capture los puntos principales.
4. Intenta que el resumen no exceda las 5 frases.<|im_end|>
<|im_start|>user
Texto a resumir:
"{transcription}"<|im_end|>
<|im_start|>assistant
"""
            
            # Generate the summary
            result = llm_pipeline(prompt)
            # The output is a list containing a dictionary. 
            generated_text = result[0]['generated_text']
            # Extract only the assistant's response
            summary = generated_text.split("<|im_start|>assistant")[1].strip()
            # The EOS token might be included, so we remove it.
            summary = summary.replace(tokenizer.eos_token, "").strip()


        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

        return JSONResponse(content={
            "status": "success",
            "transcription": transcription,
            "summary": summary
        })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
