# Tiragu — Smart Itinerary Planner

Tiragu is a full-stack travel planning app that helps users discover places, generate smart itineraries, and share their travel stories.

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Clerk (authentication)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Cloudinary (image uploads)
- Hugging Face API (AI-powered itinerary generation)
- Google API

## Project Structure

```
Tiragu/
├── backend/
│   ├── server.js
│   ├── util/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── placeService.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── data/
│   │   └── App.jsx
│   └── package.json
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Accounts/API keys for: Clerk, Cloudinary, Hugging Face, Google API

### 1. Clone the repo
```bash
git clone https://github.com/ganga-m43/tiragu-smart-itinerary.git
cd tiragu-smart-itinerary
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `backend/.env` file with the following variables:
```
PORT=3000
HF_TOKEN=your_huggingface_token
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
GOOGLE_API_KEY=your_google_api_key
```

> ⚠️ Never commit your `.env` file. It's already excluded via `.gitignore`.

Run the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `frontend/.env` file with:
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Run the frontend:
```bash
npm run dev
```

## Features
- 🔐 User authentication via Clerk
- 🗺️ AI-generated travel itineraries
- 📸 Image uploads via Cloudinary
- 🌦️ Seasonal place recommendations
- 📝 Travel stories / posts from users

## Contributing
This is a collaborative project. Pull requests are welcome — please don't commit any `.env` files or credentials.

## License
This project is for educational purposes.
