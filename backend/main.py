import os
import subprocess
import tempfile
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import whisper
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
transcriber = whisper.load_model("base")

@app.post("/api/process-media")
async def process_media(file: UploadFile = File(...)):
    """
    This endpoint processes a media file (video or audio) to extract audio,
    transcribe it, and generate a summary.
    """
    if not file.content_type.startswith("video/") and not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a video or audio file.")

    # Create a temporary directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        file_extension = os.path.splitext(file.filename)[1]
        temp_file_path = os.path.join(temp_dir, f"{uuid.uuid4()}{file_extension}")

        # Save the uploaded file
        with open(temp_file_path, "wb") as buffer:
            buffer.write(await file.read())

        # Extract audio if it's a video file
        audio_file_path = temp_file_path
        if file.content_type.startswith("video/"):
            audio_file_path = os.path.join(temp_dir, "audio.mp3")
            try:
                subprocess.run(
                    ["ffmpeg", "-i", temp_file_path, "-vn", "-acodec", "libmp3lame", "-ab", "192k", "-ar", "16000", "-ac", "1", audio_file_path],
                    check=True,
                    capture_output=True,
                    text=True
                )
            except subprocess.CalledProcessError as e:
                raise HTTPException(status_code=500, detail=f"Failed to extract audio: {e.stderr}")
            except FileNotFoundError:
                raise HTTPException(status_code=500, detail="ffmpeg not found. Please ensure ffmpeg is installed and in your PATH.")


        # Transcribe the audio
        try:
            transcription_result = transcriber.transcribe(audio_file_path)
            transcription = transcription_result["text"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {str(e)}")

        # Summarize the transcription
        try:
            summary = summarizer(transcription, max_length=150, min_length=40, do_sample=False)[0]['summary_text']
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

        return JSONResponse(content={
            "status": "success",
            "transcription": transcription,
            "summary": summary
        })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
