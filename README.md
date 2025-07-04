# Collaborative Whiteboard Application

This is a real-time collaborative whiteboard application built with React, Node.js, Socket.IO, and Firebase. It allows multiple users to draw, chat, and interact on a shared canvas in real-time.

## Features

*   **Real-time Drawing:** Collaborative drawing with various tools (pen, eraser) and colors.
*   **User Authentication:** Secure user authentication powered by Firebase.
*   **Room Management:** Create or join unique whiteboard rooms.
*   **Live Cursor Tracking:** See where other users are drawing.
*   **Chat Functionality:** Real-time chat within each room.
*   **Undo/Redo:** Ability to undo and redo drawing actions.
*   **Canvas Export:** Export whiteboard content as PNG or PDF.
*   **Responsive Design:** Optimized for various screen sizes.

## Technologies Used

### Frontend

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool for modern web projects.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
*   **Socket.IO Client:** For real-time, bidirectional communication.
*   **Firebase (Authentication & Firestore Client):** User authentication and client-side database interactions.
*   **html2canvas & jsPDF:** For exporting canvas content.

### Backend

*   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
*   **Socket.IO:** For real-time, bidirectional communication.
*   **Firebase Admin SDK:** For server-side authentication verification and Firestore database management.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (v18 or higher)
*   npm (v8 or higher)
*   Firebase Project: You'll need a Firebase project set up with Authentication (Email/Password or Google Sign-in enabled) and Firestore Database.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/collaborative-whiteboard.git
cd collaborative-whiteboard
```

### 2. Firebase Configuration

#### Frontend (Client-side)

Create a Firebase web app in your Firebase project and get your configuration. Create a file named `.env` in the root of the `collaborative-whiteboard` directory (where `package.json` is located) and add your Firebase configuration:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

#### Backend (Server-side)

Generate a new private key for your Firebase Admin SDK. Go to your Firebase project settings -> Service accounts -> Generate new private key. This will download a JSON file.

For local development, you can set this as an environment variable. Create a file named `.env` in the `server/` directory and add:

```
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "...", "private_key_id": "...", "private_key": "...", "client_email": "...", "client_id": "...", "auth_uri": "...", "token_uri": "...", "auth_provider_x509_cert_url": "...", "client_x509_cert_url": "...", "universe_domain": "..."}'
```

**Important:** Replace the entire JSON string with the content of your downloaded Firebase service account key file. Ensure it's a single line and properly escaped if necessary for your shell/environment.

### 3. Install Dependencies

Install dependencies for both the frontend and backend:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 4. Run the Application Locally

#### Start the Backend Server

```bash
cd server
npm start
# The server will run on http://localhost:3001
cd ..
```

#### Start the Frontend Development Server

Open a new terminal and run:

```bash
npm run dev
# The frontend will run on http://localhost:5173 (or another available port)
```

Your collaborative whiteboard application should now be running locally.

## Deployment

### Frontend (Vercel)

1.  **Connect Repository:** Connect your GitHub/GitLab/Bitbucket repository to Vercel.
2.  **Build Command:** Vercel should automatically detect Vite. Ensure the build command is `npm run build`.
3.  **Environment Variables:** Add the Firebase client-side environment variables (e.g., `VITE_FIREBASE_API_KEY`) to your Vercel project settings.
4.  **Backend URL:** Set the `VITE_BACKEND_URL` environment variable in Vercel to your deployed Render backend URL (e.g., `https://your-render-backend.onrender.com`).

### Backend (Render)

1.  **Connect Repository:** Connect your GitHub/GitLab/Bitbucket repository to Render.
2.  **New Web Service:** Create a new Web Service.
3.  **Build Command:** `npm install`
4.  **Start Command:** `npm start`
5.  **Environment Variables:** Add the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable to your Render service settings. Paste the entire JSON string of your Firebase service account key as the value.
6.  **Port:** Ensure the port is set to `3001` (or whatever `process.env.PORT` resolves to).

## Usage

1.  **Access the Application:** Open your browser and navigate to the local development URL (e.g., `http://localhost:5173`) or your deployed Vercel URL.
2.  **Authenticate:** Sign up or log in using your Firebase credentials.
3.  **Select/Create Room:** Choose an existing room ID to join or leave the input blank to create a new unique room.
4.  **Collaborate:** Start drawing on the canvas, use the toolbar to change tools, colors, and stroke width. Chat with other users in the room.
5.  **Export:** Use the save button to export the canvas as a PNG or PDF.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details. (You may need to create a `LICENSE` file if you don't have one.)
