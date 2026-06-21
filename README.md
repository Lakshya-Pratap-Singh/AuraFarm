# DailyWise Deployment Guide

## Overview
- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

## 1. Environment Variables

### Frontend (Vercel)
Set in Vercel dashboard:
- `VITE_API_URL=https://your-backend.onrender.com`
- `VITE_APP_NAME=DailyWise`

### Backend (Render)
Set in Render dashboard:
- `NODE_ENV=production`
- `PORT=10000` (Render injects this automatically)
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=<strong-random-secret>`
- `CORS_ORIGIN=https://your-frontend-domain.vercel.app`

## 2. Build Optimization
- Frontend uses Vite production build.
- Backend should run `prisma migrate deploy` during deployment.
- Keep build output small by avoiding large dependencies and enabling sourcemap-free production builds.

## 3. Error Handling
- Use centralized error middleware.
- Return safe error messages to clients.
- Log server errors with structured logs.

## 4. Security Headers
- `helmet()` is enabled for Express.
- `cors()` is restricted to trusted frontend origins.
- Use secure, HTTP-only cookies for auth.
- Enforce HTTPS in production.

## 5. Deployment Steps

### Frontend (Vercel)
1. Connect GitHub repo.
2. Set root directory to `client`.
3. Use build command: `npm run build`.
4. Set output directory: `dist`.
5. Add environment variables.
6. Deploy.

### Backend (Render)
1. Create a new Web Service.
2. Set root directory to `backend`.
3. Use build command: `npm install && npm run prisma:generate`.
4. Use start command: `npm run start`.
5. Add environment variables.
6. Add a post-deploy command: `npm run prisma:deploy`.

### Database (Neon)
1. Create a Neon project.
2. Copy the pooled connection string.
3. Add it to Render as `DATABASE_URL`.
4. Ensure SSL is enabled for Prisma.

## 6. CI/CD Recommendations
- Use GitHub Actions to run:
  - `npm run build` for client
  - `npm run prisma:generate` for backend
  - optional lint/tests on pull requests
- Protect main branch with required reviews.

## 7. Monitoring Recommendations
- Render logs for API failures.
- Vercel analytics for frontend performance.
- Neon metrics for DB usage and connection count.
- Add Sentry or similar for error tracking.

## 8. Recommended Production Checklist
- Confirm HTTPS is enforced.
- Verify cookie auth works cross-origin.
- Confirm `CORS_ORIGIN` matches deployed frontend URL.
- Check DB migrations run on deploy.
- Test login/register/logout flow in production.
