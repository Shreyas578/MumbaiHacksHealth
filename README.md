# Health Fact Guardian

An AI-powered health crisis agent that verifies medical rumors using trusted sources like WHO, ICMR, and peer-reviewed research.

## Project Structure

```
health-fact-guardian/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Configuration
│   │   ├── models/   # Database models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── requirements.txt
│
└── frontend/         # React frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── api/
    └── package.json
```

## Quick Start

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn app.main:app --reload
```

Backend will run at: http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: http://localhost:5173

## Features

- ✅ **Instant Verification** - AI-powered fact-checking of health claims
- 🔍 **Trusted Sources** - Backed by WHO, ICMR, PubMed, and peer-reviewed research
- 📊 **Dashboard** - Track and analyze verified claims
- 💬 **Chat Interface** - Easy-to-use conversational UI
- 🎯 **Truth Cards** - Clear, visual presentation of verdicts

## Tech Stack

**Backend:**
- FastAPI
- PostgreSQL
- OpenAI/LLM Integration
- PubMed API

**Frontend:**
- React
- Material-UI
- Axios
- Vite

## Development Status

This is a hackathon MVP. Current phase: **Phase 1 - Project Skeleton** ✅

## License

MIT

## Disclaimer

⚠️ This information is for awareness only and does not replace professional medical advice. Always consult healthcare professionals for medical decisions.
