/**
 * AuraFarm — Role-based access middleware
 * ------------------------------------------------
 * NEW file, additive only. Does not modify middleware/auth.js — `protect`
 * keeps working exactly as it does today for every existing route.
 * `requireRole` is meant to be chained AFTER `protect` (which attaches
 * req.user), only on the new admin moderation routes.
 *
 * Depends on the new, defaulted `User.role` field added in
 * schema.additions.prisma (`@default(USER)`), so every existing user row
 * is simply USER after migration and is correctly denied access to admin
 * routes with no manual backfill needed.
 */

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Missing auth token" });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};
