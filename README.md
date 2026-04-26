# DocShield

**Secure. Share. Print. Protect.**

DocShield is a premium startup-style SaaS MVP for secure document sharing in India's print-shop and cyber cafe workflow. Instead of sending Aadhaar, PAN, resumes, certificates, contracts, and confidential PDFs over WhatsApp, users upload files into a controlled vault and share temporary links or QR codes with view-only or print-only access.

This is not positioned as a college upload app. It is designed to read like a founder-led product: clear problem framing, premium UX, secure access logic, monetization surfaces, and a backend architecture that looks ready for real iteration.

## Why DocShield Exists

Sensitive documents are routinely forwarded to print shops through chat apps. That creates permanent uncontrolled copies on:

- shop owner devices
- WhatsApp chat histories
- shared desktops
- temporary gallery folders
- reused print systems

DocShield replaces that behavior with controlled document delivery.

## Product Promise

DocShield gives users:

- secure cloud upload through Cloudinary
- temporary short links
- QR-based document handoff
- view-only mode
- print-only mode
- controlled download policy
- auto-expiry
- access tracking
- watermark-ready previews

## Core Features

- JWT authentication with persistent sessions
- secure file upload for PDFs, images, and common office documents
- Cloudinary-backed file delivery for fast MVP setup
- temporary share links with configurable expiry windows
- QR sharing for mobile-first print workflows
- view-only, print-only, and download-enabled access rules
- activity logging for views, prints, downloads, and password verification
- watermark overlays during protected preview flows
- analytics dashboard for uploaded files and access history
- print shop access panel for quick print mode
- admin overview for active users, documents, and total activity
- pricing, FAQ, enterprise trust, and monetization placeholders

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- React Dropzone
- React Toastify
- React QR Code

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Multer
- Cloudinary
- Nodemailer
- ShortID
- QRCode

## Architecture

```text
client/
  src/
    pages/                 landing, auth, dashboard, pricing, secure-access
    config/                API client configuration
    redux/                 auth state and session persistence

server/
  src/
    controllers/           upload, share, access-control, analytics handlers
    models/                user, secure file, guest file metadata
    routes/                auth, file, admin, dashboard, public share APIs
    middlewares/           upload and auth middleware
    config/                Cloudinary configuration
    db/                    MongoDB connection bootstrap
```

## Cloudinary + MongoDB Workflow

1. User uploads files through a drag-and-drop dashboard flow.
2. Multer receives the file in the API layer.
3. Cloudinary stores the document asset and returns a secure delivery URL and public ID.
4. MongoDB stores DocShield metadata:
   - access mode
   - expiry
   - category
   - share link
   - view count
   - print count
   - access logs
   - watermark policy
5. Public secure links resolve metadata through MongoDB and render controlled access flows through the frontend.

This keeps binary storage concerns separated from product analytics and access policy.

## Technical Decisions

- **Cloudinary for MVP speed**  
  Cloudinary reduces setup friction, gives immediate secure delivery URLs, and keeps the prototype easier to run and demo.

- **MongoDB for policy and analytics state**  
  The document file itself lives in Cloudinary, while MongoDB tracks user ownership, access rules, counts, history, and expiry.

- **Route-driven protected access**  
  Public share URLs resolve through backend policy first, instead of exposing a generic file endpoint.

- **Premium frontend shell**  
  Landing, dashboard, pricing, and secure-access views are designed to feel like a real SaaS product, not an internal admin utility.

## Product Screens To Capture

Add screenshots after local runtime is configured:

- `docs/screenshots/landing.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/secure-access.png`
- `docs/screenshots/pricing.png`

## Local Setup

### 1. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Environment variables

Create `server/.env`:

```bash
MONGODB_URL=your_mongodb_uri
PORT=6600
CLIENT_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=your_secret_jwt_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

MAIL_USER=your_email@gmail.com
MAIL_PASS=your_email_password

BASE_URL=http://localhost:5173
```

Optional `client/.env`:

```bash
VITE_API_BASE_URL=http://localhost:6600/api
```

### 3. Run the app

```bash
cd server
npm start

cd ../client
npm run dev
```

## Important Routes

### Frontend

- `/` - investor-style landing page
- `/login` - sign in
- `/signup` - account creation
- `/dashboard` - secure vault and analytics
- `/pricing` - SaaS pricing surface
- `/share/:shortCode` - public secure document access

### Backend

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/files/upload`
- `GET /api/files/user/:userId/dashboard`
- `GET /api/files/user/:userId/list`
- `GET /api/files/admin/overview`
- `GET /api/files/share/resolve/:code`
- `POST /api/files/share/access/:shortCode`
- `POST /api/files/share/email`

## Deployment Notes

- Host frontend on Vercel or Netlify
- Host backend on Render, Railway, or EC2
- Use MongoDB Atlas for persistent data
- Use Cloudinary for file delivery and previews
- Move transactional email to SES, Resend, or Postmark for production
- Layer Razorpay on top of the pricing surface for monetization
- Add stricter preview proxying if you need stronger anti-download guarantees later

## Recruiter-Friendly Summary

Position this project as:

> Built a secure document sharing SaaS MVP for India's print-shop workflow, replacing WhatsApp-based confidential file transfer with temporary links, QR-driven print handoff, view-only and print-only access rules, audit tracking, and Cloudinary-backed document delivery.

That frames the work as product thinking, system design, and execution quality rather than generic CRUD development.

## Startup Vision

DocShield can grow into:

- subscription SaaS for students and professionals
- B2B document handoff for offices and HR teams
- enterprise-secure print workflows
- neighborhood print-shop partnerships
- API-driven secure document delivery infrastructure

The point of this repo is not just to upload a file. It is to demonstrate that the builder understands how to turn a local workflow problem into a credible software business.
