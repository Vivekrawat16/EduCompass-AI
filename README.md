# EduCompass AI

An intelligent AI-powered counsellor application to help students navigate their study abroad journey.

## Features

- **Authentication**: JWT-based signup/login with Google OAuth support
- **Stage Management**: Guided user journey (Auth → Onboarding → Dashboard → AI Chat → Discovery → Application)
- **Onboarding**: Mandatory profile creation with preferences
- **AI Counsellor**: Gemini AI-powered chat interface for personalized guidance
- **University Discovery**: Browse and shortlist universities (Dream/Target/Safe categories)
- **University Locking**: Final selection mechanism for applications
- **Application Dashboard**: Task tracking for your locked universities

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Vivekrawat16/EduCompass-AI.git
   cd EduCompass-AI
   ```

2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database named `ai_counsellor`
   - Run the schema: `psql -d ai_counsellor -f database/schema.sql`

4. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your credentials (database, JWT secret, Google OAuth, Gemini API key)

5. Run the application:
   ```bash
   npm run dev
   ```

   This starts both backend (port 5000) and frontend (port 5174) concurrently.

### Running Separately

- **Backend**: `cd backend && npm run dev`
- **Frontend**: `cd frontend && npm run dev`

## Deployment

### Railway Deployment (Recommended)

This project is configured for easy deployment on [Railway](https://railway.app/).

1.  **Fork/Clone** this repository to your GitHub.
2.  **Create a New Project** on Railway.
3.  **Deploy from GitHub Repo**.
4.  **Add a Database**: Add a PostgreSQL plugin to your Railway project.
    - Railway automatically sets `DATABASE_URL`.
5.  **Configure Environment Variables** in Railway service settings:
    - `JWT_SECRET`: (Your secret key)
    - `GOOGLE_CLIENT_ID`: (Your Google OAuth Client ID)
    - `GOOGLE_CLIENT_SECRET`: (Your Google OAuth Secret)
    - `GOOGLE_CALLBACK_URL`: (Your Production URL + `/api/auth/google/callback`)
        - Example: `https://your-app-name.up.railway.app/api/auth/google/callback`
    - `FRONTEND_URL`: (Your Production URL) for CORS.
        - Example: `https://your-app-name.up.railway.app`
    - `GEMINI_API_KEY`: (Your Gemini API Key)
6.  **Build & Start**:
    - Railway should automatically detect `npm run build` and `npm run start`.
    - `npm run build` installs backend/frontend deps and builds the React app.
    - `npm run start` runs the backend, which serves the built frontend.

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── ai/              # AI counsellor engine
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic & external APIs
│   ├── config/              # Database & passport config
│   └── server.js            # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Auth context
│   │   └── pages/           # Page components
│   └── index.html
└── database/
    └── schema.sql           # Database schema
```

## License

MIT