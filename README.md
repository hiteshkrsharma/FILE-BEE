# FileBee - File Sharing Web App

A free file sharing app like FileTransfer.io. Upload files, get a secure link, and share—no login needed.

## Features
- Upload files (max 100MB)
- Shareable download link
- Auto-expiry after 24h
- No login required
- Clean, responsive UI with animation and logo
- Copy link to clipboard
- Expiry countdown on download page

## Folder Structure
```
/client   # React frontend
/server   # Node.js backend
/.env     # Environment config
```

## Getting Started (Local Development)
1. **Clone the repo:**
   ```bash
   git clone https://github.com/hiteshkrsharma/FILE-BEE.git
   cd FILE-BEE
   ```
2. **Set up environment:**
   - Copy `.env.example` to `.env` and fill in values (see below).
3. **Install dependencies:**
   - Backend:
     ```bash
     cd server
     npm install
     ```
   - Frontend:
     ```bash
     cd ../client
     npm install
     ```
4. **Run the app:**
   - Start backend:
     ```bash
     cd ../server
     npm start
     ```
   - Start frontend:
     ```bash
     cd ../client
     npm start
     ```
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## .env Example
```
PORT=5000
BASE_URL=http://localhost:5000
UPLOAD_FOLDER=uploads
```

## Deployment (Render/Railway)
1. Deploy `/server` as a Node.js service (set env vars as above)
2. Deploy `/client` as a static site (build with `npm run build`)
3. Set `REACT_APP_API` in `/client/.env` to your backend URL

## Screenshots
_Add your screenshots here_

## Developer
**Hitesh Krishan Sharma**

- Email: hiteshkrsharma@gmail.com
- Instagram: [@hiteshkrsharma](https://instagram.com/hiteshkrsharma)

---
Feel free to contact for any queries or suggestions!
