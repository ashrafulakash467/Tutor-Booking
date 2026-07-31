# MediQueue - Tutor Booking Platform

MediQueue is a modern, full-stack tutor booking web application that connects students with qualified tutors across various subjects. The platform streamlines the entire tutoring process - from finding the perfect tutor to booking sessions and managing scheduled classes.

## Live Site URL

🌐 **Live Demo:** [https://mediqueue-tutor-booking.vercel.app](https://mediqueue-tutor-booking.vercel.app)

## 🚀 Key Features

- **🔐 Secure Authentication System** - Email/password registration with strict password validation (uppercase, lowercase, minimum 6 characters) plus Google social login. JWT tokens are generated and stored on the client side for secure private route access.

- **📚 Smart Tutor Marketplace** - Browse expert tutors across 20+ subjects (Mathematics, Physics, Programming, and more) in a responsive 3-column grid layout. Advanced search and filtering by tutor name, subject, and registration date range.

- **📅 Real-Time Slot Management** - Each tutor has customizable total slots with automatic slot decrement on booking. The system prevents overbooking with "No available slots left" and "Booking is not available yet" warnings based on session date restrictions.

- **🎫 Digital Session Tokens** - Every successful booking generates a unique session reference token that students can copy and save for future use.

- **👨‍🏫 Complete Tutor Dashboard** - Logged-in users can add tutor profiles with comprehensive fields including available days, time slots, session start dates, hourly fees, teaching modes (Online/Offline/Both), and locations. Full CRUD operations with edit/delete confirmation modals.

- **📊 Personal Booking Management** - Track all booked sessions in a dedicated dashboard with real-time status updates (confirmed/cancelled). One-click cancellation with slot restoration.

- **🌗 Dark/Light Theme** - Seamless dark/light mode toggle with smooth transitions across the entire application.

- **⚡ Dynamic & Responsive** - Dynamic page titles for every route, smooth animations, loading spinners, toast notifications, and mobile-first responsive design for all devices.

## 🛠️ Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS 4 with shadcn/ui components
- Axios for API calls
- Hash-based routing (SPA)

### Backend
- Node.js + Express 5
- MongoDB with in-memory data store for development
- JWT Authentication
- RESTful API architecture

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components (BookSessionModal, ConfirmationModal)
│   │   ├── pages/         # Page components (Home, FindTutors, Auth, etc.)
│   │   ├── lib/           # Utility functions
│   │   └── ui/            # shadcn/ui components
│   └── public/            # Static assets
└── server/                # Node.js backend
    ├── config/           # Database configuration
    ├── middleware/       # Auth middleware
    └── routes/           # API routes (users, tutors, bookings)
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/ashrafulakash467/Tutor-Booking.git
```

2. Install server dependencies
```bash
cd server
npm install
npm start
```

3. Install client dependencies
```bash
cd ../client
npm install
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Demo Account
- **Email:** admin@example.com
- **Password:** password123

## 🧪 Testing
- Client build: `cd client && npm run build`
- Server start: `cd server && npm start`

## 📞 Contact
- **Email:** hello@mediqueue.com
- **Location:** 123 Education St, NY

© 2026 MediQueue. All rights reserved. | Empowering students through quality tutoring.