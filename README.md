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
medical-stroke-application/
├── backend/
│   ├── app.py              # Flask backend server
│   ├── requirements.txt    # Python dependencies
│   └── db/                 # SQLite database
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── stores/            # Zustand state management
│   └── utils/             # Utility functions
├── public/                # Static assets
└── package.json          # Node.js dependencies
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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Medical professionals who provided domain expertise
- Open-source community for various tools and libraries
- Contributors and testers