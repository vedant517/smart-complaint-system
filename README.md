# Smart Complaint Management System

An intelligent complaint management system with AI-powered prioritization, real-time SLA tracking, and role-based dashboards.

## Features

- 🎯 **AI-powered complaint prioritization** - Automatically categorizes and prioritizes complaints
- ⏱️ **Real-time SLA countdown timers** - Track complaint resolution deadlines with color-coded alerts
- 👥 **Role-based dashboards** - Separate interfaces for Users, Officers, and Admins
- 📊 **Officer performance tracking** - Monitor department-wise officer statistics and strike rates
- 🔍 **Public complaint tracking** - Track complaints by ID without authentication
- 📱 **Responsive modern UI** - Clean, premium design with glassmorphism effects

## Tech Stack

**Frontend:**
- React with TypeScript
- Vite
- Modern CSS with custom design system
- Plus Jakarta Sans typography

**Backend:**
- Python Flask
- SQLite database
- AI/ML integration for complaint analysis

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-complaint-system.git
   cd smart-complaint-system
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. Run the application:
   - Backend: `python app.py`
   - Frontend: `npm run dev`

## Project Structure

```
smart-complaint-system/
├── frontend/           # React TypeScript frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   └── App.tsx     # Main application
│   └── package.json
├── backend/            # Flask backend
│   ├── app.py          # Main Flask application
│   └── requirements.txt
└── README.md
```

## User Roles

- **User**: Register and track complaints
- **Officer**: View assigned complaints, update status, resolve issues
- **Admin**: Manage all complaints, view analytics, monitor officer performance

## License

MIT License
