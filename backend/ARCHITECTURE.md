# DailyWise Backend Architecture

## 1. Folder Structure
backend/
  README.md
  ARCHITECTURE.md
  package.json
  .env.example
  prisma/
    schema.prisma
  src/
    app.js
    server.js
    routes/
      index.js
      users.js
      objectives.js
      missions.js
      xp.js
      analytics.js
      activity.js
    controllers/
      userController.js
      objectiveController.js
      missionController.js
      xpController.js
      analyticsController.js
      activityController.js
    middleware/
      auth.js
      errorHandler.js
      notFound.js
    services/
      (future business logic / analytics services)

## 2. Database Schema
Core entities:
- User
- Objective
- Mission
- XPEvent
- ActivityEvent

Key relationships:
- User has many Objectives, Missions, XPEvents, ActivityEvents.
- Objective has many Missions.
- Mission belongs to one Objective optionally.
- XPEvent belongs to a user and optional mission.
- ActivityEvent belongs to a user and optional mission/objective.

## 3. API Routes
- POST /api/v1/users/register
- POST /api/v1/users/login
- GET /api/v1/users/me
- GET /api/v1/objectives
- POST /api/v1/objectives
- PUT /api/v1/objectives/:id
- DELETE /api/v1/objectives/:id
- GET /api/v1/missions
- POST /api/v1/missions
- PUT /api/v1/missions/:id
- DELETE /api/v1/missions/:id
- PATCH /api/v1/missions/:id/toggle-complete
- GET /api/v1/xp/summary
- POST /api/v1/xp/award
- GET /api/v1/analytics/dashboard
- GET /api/v1/activity/feed

## 4. Controllers
- userController: auth, profile
- objectiveController: CRUD + activity logging
- missionController: CRUD, completion toggle, XP updates
- xpController: XP summary and manual award logic
- analyticsController: dashboard aggregates
- activityController: feed retrieval

## 5. Models / Prisma Entities
- User
- Objective
- Mission
- XPEvent
- ActivityEvent

## 6. Best Practices
- Use Prisma for DB access and migrations.
- Keep controllers thin; move complex logic into services later.
- Protect routes with JWT middleware.
- Normalize mission/objective defaults for backward compatibility.
- Use transactions for XP updates.
- Log activity events for analytics and future history views.
- Keep env variables in `.env` and never commit secrets.
- Use `app.js` + `server.js` separation for clean startup and testability.
