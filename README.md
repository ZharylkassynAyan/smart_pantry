# Smart Pantry Manager

A simple, full-stack web application to manage your household pantry. Track items, get expiry alerts, and receive recipe suggestions.

---

## Project Structure

```
smart-pantry/
├── backend/
│   ├── middleware/
│   │   └── auth.js           # JWT auth middleware
│   ├── models/
│   │   ├── User.js           # User schema (Mongoose)
│   │   └── PantryItem.js     # Pantry item schema
│   ├── routes/
│   │   ├── auth.js           # /api/auth - register, login, me
│   │   ├── profile.js        # /api/profile - get/update profile
│   │   ├── pantry.js         # /api/pantry - CRUD for items
│   │   └── ai.js             # /api/ai - recipe and use-first suggestions
│   ├── server.js             # Express entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js    # Global auth state
        ├── components/
        │   └── Navbar.js
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   ├── Pantry.js
        │   ├── Profile.js
        │   └── AIAssistant.js
        ├── services/
        │   └── api.js            # All API calls in one file
        ├── App.js
        ├── index.js
        └── index.css
```

---

## Prerequisites

- Node.js v18 or later
- MongoDB (local install or a free MongoDB Atlas cluster)
- npm

---

## Setup Instructions

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your values:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-pantry
JWT_SECRET=pick_a_long_random_string_here
```

Start the backend:

```bash
# Development (auto-restarts on file change)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`.

---

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

The React app will open at `http://localhost:3000`.
The `"proxy": "http://localhost:5000"` in `frontend/package.json` forwards all `/api/*` requests to the backend automatically during development.

---

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Create new account |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/profile | Yes | Get profile |
| PUT | /api/profile | Yes | Update profile |
| GET | /api/pantry | Yes | List all items (sorted by expiry) |
| POST | /api/pantry | Yes | Add new item |
| PUT | /api/pantry/:id | Yes | Update an item |
| DELETE | /api/pantry/:id | Yes | Delete an item |
| GET | /api/pantry/expiring | Yes | Items expiring within 7 days |
| GET | /api/ai/use-first | Yes | Items to use first with urgency |
| POST | /api/ai/recipes | Yes | Recipe suggestions from pantry |

"Auth" = requires `Authorization: Bearer <token>` header.

---

## Features

- JWT authentication (register, login, logout)
- Add, view, and delete pantry items with expiry dates
- Dashboard with summary stats
- Items sorted by expiry date
- Urgency badges (expired, critical, high, medium, low)
- "Use first" recommendations based on expiry proximity
- Rule-based recipe suggestions from current pantry items
- User profile with household settings and notification preferences

---

## Notes

- Passwords are hashed with bcryptjs before being stored
- JWT tokens expire after 7 days
- The recipe engine is rule-based (no external AI API required)
- All API errors return a JSON `{ message: "..." }` object
