# Health Fact Guardian - Backend

FastAPI backend for the Health Fact Guardian AI health crisis agent.

## Setup

1. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Run the development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## Project Structure

```
backend/
├── app/
│   ├── api/          # API route handlers
│   ├── core/         # Configuration and settings
│   ├── models/       # Database models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic services
│   └── main.py       # FastAPI application entry point
├── requirements.txt  # Python dependencies
└── .env.example      # Environment variables template
```
