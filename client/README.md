# ReserveEase Frontend Client

Modern React client built with Vite, React Router, Axios, and Tailwind CSS.

## Architecture

- **`src/api/client.ts`**: Axios instance configured with automatic JWT Bearer token injection and global 401 handling.
- **`src/context/AuthContext.tsx`**: React context managing user authentication state, role permissions, and token persistence in localStorage.
- **`src/components/ProtectedRoute.tsx`**: Route guard protecting authenticated customer routes and restricting admin consoles.
- **`src/pages/`**:
  - `HomePage.tsx`: Landing view with 3-step scheduling mechanism and featured services.
  - `ServicesPage.tsx`: Catalog with category filtering, durations, prices, and operating hours.
  - `BookingPage.tsx`: Live time slot availability picker with instant double-booking prevention.
  - `UserDashboardPage.tsx`: Customer bookings management, status filter, and slot-releasing cancellation.
  - `AdminDashboardPage.tsx`: Admin oversight table of all bookings and full service CRUD management.
  - `LoginPage.tsx` / `RegisterPage.tsx`: Authentication with quick-fill demo buttons.

## Environment Variables

Copy `.env.example` to `.env`:
```bash
VITE_API_URL=/api
```
