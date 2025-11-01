# SlotSwapper

A full-stack web application that enables users to swap calendar slots with each other through a secure, transactional marketplace system.

## Overview

SlotSwapper allows users to create calendar events, mark them as swappable, browse available slots from other users, and exchange slots through an atomic transaction system. The application ensures data integrity through MongoDB transactions and provides real-time state updates across the UI.

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite
- React Router v6
- Axios
- Tailwind CSS
- React Toastify

**Backend:**
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

**Security:**
- Helmet
- CORS
- Rate Limiting
- Express Validator
- MongoDB Sanitization

## Features

- User authentication with JWT
- Create, update, and delete calendar events
- Mark events as swappable
- Browse marketplace of available slots
- Request slot swaps with other users
- Accept or reject incoming swap requests
- Atomic slot exchange using MongoDB transactions
- Real-time UI updates across all views
- Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/bhoomi-narang/slotswapper.git
cd slotswapper
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Configure environment variables

Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/...
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_SALT_ROUNDS=10
```

Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

5. Start the backend server
```bash
cd server
npm run dev
```

6. Start the frontend application
```bash
cd client
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

## Project Structure

```
slotswapper/
├── client/                   # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   └── types/            # TypeScript type definitions
│   └── package.json
│
├── server/                   # Backend Express application
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   └── validators/       # Input validation
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - User login

### Events (Protected)
- `POST /api/v1/events` - Create event
- `GET /api/v1/events` - Get user's events
- `PUT /api/v1/events/:id` - Update event
- `DELETE /api/v1/events/:id` - Delete event
- `GET /api/v1/events/swappable-slots` - Get marketplace slots

### Swap Requests (Protected)
- `POST /api/v1/swap-request` - Create swap request
- `GET /api/v1/swap-request/requests` - Get user's swap requests
- `POST /api/v1/swap-request/response/:id` - Accept/reject swap

## Usage

1. Create an account at `/signup`
2. Log in at `/login`
3. Create events on the dashboard
4. Mark events as "SWAPPABLE" to list them in the marketplace
5. Browse available slots in the marketplace
6. Request a swap by selecting one of your swappable slots
7. View incoming requests in the "Requests" page
8. Accept or reject swap requests
9. Upon acceptance, slot owners are exchanged atomically

## Development

### Backend Development
```bash
cd server
npm run dev        # Start development server
npm run build      # Build TypeScript
npm test           # Run tests
npm run lint       # Run ESLint
```

### Frontend Development
```bash
cd client
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Environment Variables

### Server
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `PORT` | Server port | No |
| `CORS_ORIGIN` | Allowed CORS origin | No |

### Client
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API URL | Yes |

## Security

The application implements several security measures:
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- MongoDB injection prevention
- CORS configuration
- Rate limiting
- Security headers with Helmet

## Deployment

### Backend
Deploy to Railway, Render, or Heroku. Set environment variables and ensure MongoDB Atlas is configured with appropriate IP whitelisting.

### Frontend
Deploy to Vercel or Netlify. Build the application and set the `VITE_API_BASE_URL` to the production API URL.

## License

ISC

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## Author

Bhoomi Narang - [GitHub](https://github.com/bhoomi-narang)