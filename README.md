# StrokeConnect - Medical Stroke Management Platform

StrokeConnect is a comprehensive web application designed to streamline stroke patient management in medical facilities. It provides role-based access for neurologists, technicians, and patients, offering specialized tools and interfaces for each user type.

## Features

### For Neurologists
- Patient assessment and monitoring
- NIHSS score tracking
- tPA treatment decision support
- Appointment scheduling and management
- Real-time notifications for critical cases
- Comprehensive patient history view

### For Technicians
- Patient data entry and management
- Vital signs monitoring
- NIHSS score calculation
- Patient status updates
- Medical imaging results tracking

### For Patients
- Personal medical record access
- Treatment status tracking
- Appointment viewing
- Medical history access

## Technology Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide React (icons)
  - React Router DOM
  - Zustand (state management)

- **Backend:**
  - Python
  - Flask
  - SQLite
  - Flask-CORS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd medical-stroke-application
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
pip install -r backend/requirements.txt
```

### Running the Application

1. Start the backend server:
```bash
npm run server
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Access the application at `http://localhost:5173`

### Running with Docker

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. From the project root, run:
```bash
docker-compose up --build
```
3. Open http://localhost:80

### Development (no Docker)

1. Backend: `npm run server` (or `python backend/run.py`)
2. Frontend: `npm run dev`
3. Open http://localhost:5173

## Deployment

### Vercel (recommended)

The application is configured for Vercel deployment. The Vite frontend is built and served as static files; the Flask API runs as a serverless function.

1. Connect your repository to [Vercel](https://vercel.com)
2. Set environment variables in Project Settings:
   - `FLASK_ENV` = `production`
   - `SECRET_KEY` = a strong random key (e.g. `openssl rand -hex 32`)
   - `DB_PATH` = `/tmp/stroke_app.db` (Vercel's only writable directory)
3. Deploy. Vercel will run `npm run build` and deploy the API from `api/index.py`.

**Database note:** On Vercel, the filesystem is ephemeral. SQLite data in `/tmp` is lost between cold starts. For persistent data, use an external database (e.g. Vercel Postgres, Turso, or Supabase).

### Other PaaS (Heroku, Railway, Render)

The application can also be deployed as a monolithic app (Flask serves both frontend and API).

**Build for deployment:**
```bash
npm run build:deploy
```

**Required environment variables:**

| Variable | Required | Description |
|----------|----------|-------------|
| FLASK_ENV | Yes | Set to `production` |
| SECRET_KEY | Yes | Strong random key |
| PORT | No | PaaS sets automatically |
| DB_PATH | No | Override SQLite location |

**Heroku:** Add Node.js + Python buildpacks; set `FLASK_ENV`, `SECRET_KEY`; `heroku-postbuild` runs `npm run build:deploy`.

**Railway / Render (Docker):** Use the root `Dockerfile`; set `FLASK_ENV`, `SECRET_KEY`.

### Default Login Credentials

For testing purposes, use these credentials:

- **Neurologist:**
  - Username: Dr. Sarah Johnson
  - Password: password

- **Technician:**
  - Username: Alex Rodriguez
  - Password: password

- **Patient:**
  - Username: Jamie Smith
  - Password: password

## Project Structure

```
Stroke-connect/
├── backend/
│   ├── app/               # Modular Flask application
│   │   ├── api/           # Blueprint routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helpers (auth, casing)
│   ├── run.py             # Entry point
│   ├── requirements.txt   # Python dependencies
│   └── db/                # SQLite database
├── src/
│   ├── api/               # API client layer
│   ├── components/        # Reusable React components
│   ├── pages/             # Page components
│   ├── stores/            # Zustand state management
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── docker/                # Docker configs
├── docker-compose.yml     # Container orchestration
├── public/                 # Static assets
└── package.json           # Node.js dependencies
```

## Key Features Implementation

### Patient Management
- Complete patient information tracking
- Medical history recording
- Vital signs monitoring
- Treatment status updates

### NIHSS Score Calculator
- Comprehensive stroke scale assessment
- Automatic score calculation
- Historical score tracking
- Severity classification

### tPA Decision Support
- Eligibility assessment
- Treatment approval workflow
- Decision documentation
- Automatic status updates

### Appointment Scheduling
- Calendar integration
- Multiple appointment types
- Status tracking
- Automatic notifications

### Real-time Notifications
- Critical patient alerts
- Treatment status updates
- Appointment reminders
- System notifications

## Security Features

- Role-based access control
- Secure password hashing
- Protected API endpoints
- Session management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Classmate contribution
- Open-source community for various tools and libraries
- Contributors and testers
