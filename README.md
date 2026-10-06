# ReserveEase — Full-Stack Appointment Booking System

ReserveEase is a production-grade, full-stack appointment booking and reservation system built with React, Node.js/Express, MongoDB with Mongoose, and JWT-based authentication with bcrypt password encryption.

It features real-time slot availability computation, strict database-level double-booking prevention, user dashboards for managing upcoming appointments, an administrative console for overseeing all bookings, and is fully configured to deploy as a serverless application on **Vercel** connected to **MongoDB Atlas**.

---

## Tech Stack

- **Frontend**:
  - React 19 (Vite)
  - React Router DOM v7
  - Axios (with automatic Bearer JWT interceptors)
  - Tailwind CSS v4 (Emerald single-color architecture)
  - Ambient background motion graphics and frosted blur glassmorphism
  - Lucide React icons
- **Backend & Serverless**:
  - Node.js + Express
  - Vercel Serverless Functions (`/api/index.ts`)
  - MongoDB with Mongoose (with connection pooling across warm invocations)
  - Stateless JWT (JSON Web Tokens) for authentication
  - bcryptjs for password hashing
  - Zero-config MongoMemoryServer fallback for local testing
- **Database Concurrency Guarantee**:
  - Unique compound partial index on `{ service: 1, date: 1, timeSlot: 1 }` where `status: "confirmed"`.
  - Atomic database validation preventing concurrent double-booking race conditions.

---

## Project Structure

```
├── /api/                     # Vercel Serverless Functions
│   └── index.ts              # Serverless entrypoint connecting to Atlas & Express
├── /client/                  # Client documentation and standalone config
│   ├── .env.example          # Client environment variables
│   ├── package.json          # Client standalone package manifest
│   └── README.md             # Client architecture guide
├── /server/                  # Express backend
│   ├── config/               # Database connection (Atlas pooling + serverless cache)
│   ├── controllers/          # Business logic (auth, services, bookings)
│   ├── middleware/           # JWT auth and centralized error handlers
│   ├── models/               # Mongoose schemas (User, Service, Booking)
│   ├── routes/               # Express API routes
│   ├── utils/                # Database seeder (admin, demo user, services)
│   ├── app.ts                # Express application setup (dual /api & / routing)
│   ├── index.ts              # Standalone backend server entrypoint
│   └── .env.example          # Server environment variables
├── /src/                     # React application source code
│   ├── api/                  # Axios HTTP client with auth interceptors
│   ├── components/           # BackgroundMotion, Navbar, Footer, ProtectedRoute
│   ├── context/              # AuthContext (JWT & user state)
│   ├── pages/                # Home, Services, Book, Dashboard, Admin, Login, Register
│   ├── types/                # TypeScript data interfaces
│   ├── App.tsx               # Route setup & provider tree
│   └── main.tsx              # React DOM entry point
├── server.ts                 # Unified local dev server (Express + Vite middleware)
├── vercel.json               # Vercel routing configuration for SPA + Serverless API
├── .env.example              # Root environment template
├── package.json              # Project dependencies & scripts
└── README.md                 # Complete documentation & Vercel deployment guide
```

---

## Deploying to Vercel (Step-by-Step)

### Step 1: Push Repository to GitHub
Ensure the latest code is pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: adapt backend for Vercel serverless deployment"
git push -u origin main
```

### Step 2: Set Up MongoDB Atlas (Free Cluster)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in or create an account.
2. Create a free shared cluster (e.g. `M0 Sandbox`).
3. Under **Security > Database Access**:
   - Add a new database user (e.g., username: `reserve_admin`, generate a secure password).
   - Set privileges to **Read and write to any database**.
4. Under **Security > Network Access**:
   - Click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) so Vercel's serverless IP addresses can connect.
5. In **Database Deployments**, click **Connect > Drivers > Node.js**:
   - Copy your connection string:
     ```
     mongodb+srv://reserve_admin:<password>@cluster0.xxxxx.mongodb.net/reserveease?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and specify the database name (e.g., `reserveease`).

### Step 3: Import Project into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... > Project**.
2. Select **Import Git Repository** and choose your repository: `gregjnr/Reservation-site`.
3. Configure Project Settings:
   - **Framework Preset**: Vite (detected automatically).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 4: Configure Environment Variables in Vercel
Expand the **Environment Variables** section in the Vercel project configuration and add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://admin:secret@cluster0.mongodb.net/reserveease?retryWrites=true&w=majority` | Your MongoDB Atlas connection string *(Required in Production)* |
| `JWT_SECRET` | `your-secure-random-32-character-secret-key-2026` | Secret key for signing authentication tokens *(Required)* |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration (default: `7d`) |
| `NODE_ENV` | `production` | Set to production |

4. Click **Deploy**.
5. Once deployment completes, Vercel gives you your production URL (e.g., `https://reservation-site.vercel.app`).

### Automatic Database Initialization
When deployed to Vercel and MongoDB Atlas for the first time, the serverless handler automatically seeds:
- Default Admin Account: `admin@reserveease.com` / `AdminPassword123!`
- Demo Customer Account: `john.doe@example.com` / `Password123!`
- 5 Bookable Services with operating hours and pricing.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run unified full-stack dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In development mode, `MongoMemoryServer` runs automatically if no `MONGODB_URI` is provided.

---

## API Endpoints List

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Log in with email & password, returns JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |

### Services (`/api/services`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/services` | Public | Get all active services (`?all=true` for admin) |
| `GET` | `/api/services/:id` | Public | Get single service details |
| `POST` | `/api/services` | Admin | Create a new service |
| `PUT` | `/api/services/:id` | Admin | Update service details |
| `DELETE`| `/api/services/:id` | Admin | Delete a service |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bookings/available-slots` | Public | Dynamic slot calculation excluding booked & past hours |
| `POST` | `/api/bookings` | Private | Reserve slot (database-level unique constraint prevents double booking) |
| `GET` | `/api/bookings/my-bookings` | Private | Retrieve logged-in user's appointments |
| `GET` | `/api/bookings` | Admin | Retrieve all customer bookings (with search & filters) |
| `PATCH`| `/api/bookings/:id/cancel` | Private | Cancel booking (immediately frees time slot) |
| `PATCH`| `/api/bookings/:id/status` | Admin | Update status (`confirmed`, `completed`, `cancelled`) |

### Health Check (`/api/health`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Health check verifying API & database status |

---

## License
MIT
