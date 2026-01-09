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
- Tailwind CSS + shadcn/ui components
- Plus Jakarta Sans typography

**Backend:**
- Node.js with Express
- MongoDB/SQLite database
- AI/ML integration for complaint analysis

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vedant517/smart-complaint-system.git
   cd smart-complaint-system
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Run the application:
   ```bash
   # Frontend (from root)
   npm run dev
   
   # Backend (from backend directory)
   cd backend
   npm start
   ```

## Project Structure

```
smart-complaint-system/
├── src/              # React TypeScript frontend
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components
│   └── App.tsx       # Main application
├── backend/          # Backend API
│   ├── server.js     # Main server file
│   └── routes/       # API routes
├── public/           # Static assets
└── package.json      # Frontend dependencies
```

## User Roles

- **User**: Register and track complaints
- **Officer**: View assigned complaints, update status, resolve issues
- **Admin**: Manage all complaints, view analytics, monitor officer performance

## Deployment

This project is configured for deployment on Vercel (frontend) and can be deployed to any Node.js hosting service (backend).

## License

MIT License

