# Tutor-Booking

Tutor-Booking is a full-stack tutor discovery and session-booking application. Students can browse and filter tutors, view tutor details, book available sessions, and manage their own bookings. Administrators can create, update, and delete tutor profiles through protected interfaces and APIs.

## Live URLs

- Frontend: `https://<frontend-project>.vercel.app`
- Backend API: `https://<backend-project>.vercel.app`

Replace these placeholders after the two Vercel projects are deployed.

## Features

- Email/password signup and login with server-issued JWT authentication.
- Public tutor listing, tutor details, search, subject filtering, and date filtering.
- Home page displays a maximum of six tutors.
- Authenticated users can book available tutor sessions and view their own bookings.
- Booking creation decreases available slots; cancellation restores one slot.
- Admin-only tutor creation, update, deletion, and tutor-management dashboard.
- Responsive layout with dark/light themes, loading states, feedback messages, dynamic titles, and a 404 page.
- MongoDB Atlas persistence using the `tutor-booking` database and `users`, `tutors`, and `bookings` collections.

## Technologies

### Client

- React 19 and Vite
- Tailwind CSS
- Radix UI/shadcn-style components
- Axios
- Lucide, Gravity UI, and HeroUI packages

### Server

- Node.js and Express 5
- MongoDB Atlas and the MongoDB Node.js driver
- JSON Web Tokens (JWT)
- bcrypt password hashing
- CORS

## Project Structure

```text
Tutor-booking/
├── client/   # Vite frontend; deploy as one Vercel project
└── server/   # Express API; deploy as a separate Vercel project
```

## Local Installation

Prerequisite: Node.js 20 or newer.

```bash
git clone <repository-url>
cd Tutor-booking/server
npm install
```

Copy `server/.env.example` to `server/.env`, then provide the required values:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=tutor-booking
JWT_SECRET=your-long-random-secret
CLIENT_URL=http://localhost:5173
PORT=5101
```

Start the API:

```bash
npm start
```

In another terminal:

```bash
cd client
npm install
```

Copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5101
```

Start the frontend:

```bash
npm run dev
```

## Vercel Environment Variables

### Backend project (`server` root directory)

- `MONGODB_URI`
- `MONGODB_DB=tutor-booking`
- `JWT_SECRET`
- `CLIENT_URL=https://<frontend-project>.vercel.app`

### Frontend project (`client` root directory)

- `VITE_API_URL=https://<backend-project>.vercel.app`

Environment changes require a new deployment. Do not commit `.env` files or real secrets.

## Authentication Notes

- New signups receive the `user` role and are logged in immediately.
- Password rules are intentionally simple for the current assignment version.
- Strong-password validation, email verification, and forgot-password flows are intentionally not enabled.
- Google/Firebase sign-in is not configured yet; the current working authentication method is email/password plus JWT.

## Verification Commands

```bash
cd client
npm run lint
npm run build

cd ../server
npm start
```
