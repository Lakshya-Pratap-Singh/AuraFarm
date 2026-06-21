# DailyWise Backend

## Overview
This backend is designed for a scalable DailyWise application using:
- Node.js
- Express
- PostgreSQL
- Prisma ORM

## Core Modules
- Users
- Objectives
- Missions
- XP system
- Activity history
- Analytics

## Suggested Flow
1. Users register/login
2. Objectives are created and linked to missions
3. Missions store priority, difficulty, category, and createdAt metadata
4. Completing missions awards XP and logs activity events
5. Analytics endpoints aggregate mission/objective progress for dashboards

## Local Setup
1. Install dependencies
2. Configure `.env` from `.env.example`
3. Run Prisma migrations
4. Start the API server
