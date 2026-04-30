🔐 DocShield

Secure. Share. Control.

DocShield is a document intelligence and secure sharing platform that gives users control over how files are accessed after they are shared.

Instead of sending sensitive documents over unsafe channels like WhatsApp, DocShield enables temporary, permission-based access with tracking, expiry, and controlled usage.

🚨 Problem

Sensitive documents (Aadhaar, PAN, resumes, contracts) are commonly shared via chat apps or email, leading to:

permanent uncontrolled copies
data leakage through shared devices
no visibility after sharing
zero access control or expiry
💡 Solution

DocShield replaces traditional file sharing with controlled access delivery:

Upload → Secure Link / QR → Controlled Access → Tracked Usage → Auto Expiry

Users don’t just share files — they control their lifecycle.

🎯 Core Use Case (MVP Focus)
🖨️ Print Shops & Cyber Cafés (India-first)
Upload document securely
Generate QR / link
Shop scans and prints
No download access
Auto-expiry after use
✨ Key Features
🔐 JWT-based authentication
☁️ Secure cloud upload (Cloudinary)
🔗 Temporary share links
📱 QR-based sharing
👁️ View-only / 🖨️ Print-only / ⬇️ Controlled download
⏳ Smart expiry rules
📊 Access tracking (views, prints, downloads)
💧 Watermark-ready previews
📈 Analytics dashboard
🧑‍💻 Admin + print shop panel
🧠 Product Philosophy

We don’t store files. We control what happens after they’re shared.

DocShield acts as a permission layer for documents, not just a storage system.

🏗️ Tech Stack
Frontend
React
Vite
Tailwind CSS
Redux Toolkit
React Router
Backend
Node.js
Express
MongoDB + Mongoose
JWT Authentication
Multer
Cloudinary
🧩 Architecture
client/
  src/
    pages/
    redux/
    config/

server/
  src/
    controllers/
    models/
    routes/
    middlewares/
    config/
    db/
⚙️ How It Works
User uploads file
File stored via Cloudinary
Metadata stored in MongoDB
Secure link / QR generated
Access controlled via backend policies
Activity tracked and logged
File expires automatically
🔄 Cloudinary + MongoDB Workflow
Files stored securely on Cloudinary
Metadata handled via MongoDB

This separation enables:

scalable file delivery
flexible access policies
analytics tracking
🧪 Local Setup
1. Install Dependencies
cd client
npm install

cd ../server
npm install
2. Environment Variables

Create server/.env:

MONGODB_URL=your_mongodb_uri
PORT=6600
CLIENT_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAIL_USER=your_email
MAIL_PASS=your_password

BASE_URL=http://localhost:5173

Optional client/.env:

VITE_API_BASE_URL=http://localhost:6600/api
3. Run the App
cd server
npm start

cd ../client
npm run dev
🔗 Important Routes
Frontend
/ – Landing page
/login – Sign in
/signup – Register
/dashboard – User vault
/pricing – SaaS plans
/share/:shortCode – Secure access
Backend
POST /api/users/register
POST /api/users/login
POST /api/files/upload
GET  /api/files/user/:userId/dashboard
GET  /api/files/share/resolve/:code
POST /api/files/share/access/:shortCode
🚀 Deployment
Frontend → Vercel / Netlify
Backend → Render / Railway / EC2
Database → MongoDB Atlas
Storage → Cloudinary
💰 Monetization (Planned)
Freemium model
Subscription plans
Pay-per-secure-share
Print-shop partnerships
Future: API access
🧠 Future Scope

DocShield can evolve into:

B2B document control platform
HR document tracking system
secure enterprise file workflows
API-based document intelligence layer
💼 Recruiter Summary

Built a secure document sharing SaaS MVP that replaces unsafe file transfer workflows with temporary links, QR-based access, permission control, and real-time usage tracking using a MERN stack architecture.
