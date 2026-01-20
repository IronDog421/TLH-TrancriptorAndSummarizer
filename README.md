# Media Summarizer

This project is a web application that allows users to upload media files (video or audio) and receive a transcription and summary of the content. The entire process runs locally, without relying on external APIs.

## Project Structure

The project is divided into two main parts:

- `backend`: A Python/FastAPI application that handles file processing, transcription, and summarization.
- `frontend`: A React/TypeScript application that provides the user interface.

## Prerequisites

- Python 3.7+
- Node.js 14+
- `ffmpeg`

**Note:** The first time you run the application, the models will be downloaded. This may take a while depending on your internet connection.

## Setup and Running

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment:
    ```bash
    python -m venv venv
    ```

3.  Activate the virtual environment:
    -   On macOS and Linux:
        ```bash
        source venv/bin/activate
        ```
    -   On Windows:
        ```bash
        venv\Scripts\activate
        ```

4.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

5.  Run the backend server:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will be running on `http://localhost:8000`.

### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install the required npm packages:
    ```bash
    npm install
    ```

3.  Run the frontend development server:
    ```bash
    npm start
    ```
    The frontend will be running on `http://localhost:3000`.

## Usage

1.  Open your browser and navigate to `http://localhost:3000`.
2.  Drag and drop a media file (or click to select one) into the designated area.
3.  The application will show the progress of the operation (uploading, processing, transcribing, summarizing).
4.  Once completed, the summary and transcription will be displayed on the screen.
