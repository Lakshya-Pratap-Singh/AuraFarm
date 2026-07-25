// Profile — user showcase page: who they are, their level progress,
// lifetime stats, a preview of their relics, and a preview of their
// achievements (both pulled from the same relic catalog/unlock engine
// Relics.jsx uses, so the numbers always agree with the Relics page).

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useXP } from "../context/XPContext.jsx";
import { useBanner, getHeroBackgroundStyle } from "../context/BannerContext.jsx";
import { getLast90Days, computeStreaks, recordSnapshot } from "../components/ActivityGrid.jsx";
import { RELIC_CATALOG, useRelicUnlockState } from "./Relics.jsx";
import { getRelicImage } from "../data/relicAssets.js";
import RelicCard from "../components/RelicCard.jsx";
import RelicModal from "../components/RelicModal.jsx";
import GlowTrace from "../components/GlowTrace.jsx";
import "../styles/profile-aura.css";

// ── Icons ─────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="16" rx="2" /><line x1="16" y1="3" x2="16" y2="7" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="3" y1="9" x2="21" y2="9" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" />
  </svg>
);
const BadgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="9" r="6" /><path d="M9 14.5L7 22l5-3 5 3-2-7.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const CheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" /></svg>
);
const GemIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h12l4 6-10 12L2 9Z" strokeLinejoin="round" /></svg>
);

// The app doesn't have a formal rank system yet — this is a light,
// self-contained tier lookup purely for display, same spirit as the
// "Elite Cultivator" flavor label already used as a fallback elsewhere.
function getRankTitle(level) {
  if (level >= 25) return "Aura Master";
  if (level >= 18) return "Grandmaster Cultivator";
  if (level >= 11) return "Elite Cultivator";
  if (level >= 6)  return "Adept Cultivator";
  return "Novice Cultivator";
}

function Profile({ missions = [], objectives = [], onNavigate }) {
  const { user } = useAuth();
  const { totalXP, xpIntoLevel, xpNeededForNextLevel, level } = useXP();
  const { bannerUrl } = useBanner();
  const [selectedRelic, setSelectedRelic] = useState(null);

  // Keep the shared activity log fresh, same as Dashboard, so streak
  // data here is accurate even if this is the first page visited today.
  useEffect(() => {
    recordSnapshot(missions);
  }, [missions]);

  const currentStreak = useMemo(() => {
    try {
      const raw = localStorage.getItem("dailywise_activity_log");
      const log = raw ? JSON.parse(raw) : {};
      const days = getLast90Days(log);
      const { current } = computeStreaks(days);
      return current;
    } catch {
      return 0;
    }
  }, [missions]);

  const missionsCompleted = missions.filter((m) => m.completed).length;
  const objectivesAchieved = objectives.filter((o) => o.completed).length;

  const relicUnlockState = useRelicUnlockState();
  const enrichedRelics = useMemo(
    () => RELIC_CATALOG.map((relic) => ({
      ...relic,
      icon: getRelicImage(relic.id),
      unlocked: relicUnlockState[relic.id]?.unlocked ?? false,
      progress: relicUnlockState[relic.id]?.progress ?? 0,
      current:  relicUnlockState[relic.id]?.current  ?? 0,
    })),
    [relicUnlockState]
  );
  const relicsCollected = enrichedRelics.filter((r) => r.unlocked).length;
  const totalRelics = RELIC_CATALOG.length;

  // Preview grid: unlocked relics first, then fill with locked ones.
  const relicsPreview = useMemo(() => {
    const unlocked = enrichedRelics.filter((r) => r.unlocked);
    const locked = enrichedRelics.filter((r) => !r.unlocked);
    return [...unlocked, ...locked].slice(0, 5);
  }, [enrichedRelics]);

  // Achievement preview: a couple of unlocked relics plus the one
  // closest to unlocking, so there's always something "in progress"
  // to show even for a brand-new account.
  const achievementPreview = useMemo(() => {
    const unlocked = enrichedRelics.filter((r) => r.unlocked);
    const inProgress = enrichedRelics
      .filter((r) => !r.unlocked)
      .sort((a, b) => b.progress - a.progress);
    return [...unlocked.slice(0, 2), ...inProgress.slice(0, 1)].slice(0, 3);
  }, [enrichedRelics]);

  const xpPct = xpNeededForNextLevel > 0 ? xpIntoLevel / xpNeededForNextLevel : 0;
  const xpToNext = xpNeededForNextLevel - xpIntoLevel;
  const rankTitle = getRankTitle(level);

  const memberSince = user?.createdAt ? new Date(user.createdAt) : null;
  const memberSinceLabel = memberSince
    ? memberSince.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "—";
  const daysActive = memberSince
    ? Math.max(1, Math.floor((Date.now() - memberSince.getTime()) / 86400000))
    : null;

  return (
    <div className="profile-page">
      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="profile-hero" style={getHeroBackgroundStyle(bannerUrl)}>
        <h1 className="profile-hero-heading">Profile</h1>
        <p className="profile-hero-sub">Track your journey. Showcase your legacy.</p>
      </div>

      <div className="profile-body">
        {/* ── Bio + Level Progress ───────────────────────────── */}
        <div className="profile-top-row">
          <div className="profile-bio-card glow">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {user?.photoURL
                  ? <img src={user.photoURL} alt={user.displayName || "Cultivator"} referrerPolicy="no-referrer" />
                  : <UserIcon />
                }
              </div>
              <span className="profile-avatar-level">{level}</span>
            </div>
            <div className="profile-bio-main">
              <div className="profile-bio-name-row">
                <span className="profile-bio-name">{user?.displayName || "Shadow"}</span>
                <span className="profile-rank-pill">{rankTitle}</span>
              </div>
              <p className="profile-bio-tagline">Discipline is my weapon. Consistency is my power.</p>
              <div className="profile-meta-grid">
                <div className="profile-meta-row">
                  <CalendarIcon />
                  <span className="profile-meta-label">Member Since</span>
                  <span className="profile-meta-value">{memberSinceLabel}</span>
                </div>
                <div className="profile-meta-row">
                  <ClockIcon />
                  <span className="profile-meta-label">Time Active</span>
                  <span className="profile-meta-value">{daysActive != null ? `${daysActive} Days` : "—"}</span>
                </div>
                <div className="profile-meta-row">
                  <BadgeIcon />
                  <span className="profile-meta-label">Role</span>
                  <span className="profile-meta-value">Cultivator</span>
                </div>
                <div className="profile-meta-row">
                  <UserIcon />
                  <span className="profile-meta-label">Rank</span>
                  <span className="profile-meta-value">{rankTitle}</span>
                </div>
              </div>
            </div>
            <GlowTrace />
          </div>

          <div className="profile-level-card glow">
            <span className="profile-level-label">Level Progress</span>
            <div className="profile-level-row">
              <div>
                <div className="profile-level-number">{level}</div>
                <div className="profile-level-rank">{rankTitle}</div>
              </div>
              <svg className="profile-level-badge" viewBox="0 0 48 48" aria-hidden="true">
                <defs>
                  <radialGradient id="profile-badge-bg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(139,92,246,0.4)" />
                    <stop offset="100%" stopColor="rgba(80,20,160,0.1)" />
                  </radialGradient>
                </defs>
                <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" fill="url(#profile-badge-bg)" stroke="#a855f7" strokeWidth="1.5" />
                <polygon points="24,10 38,18 38,30 24,38 10,30 10,18" fill="rgba(139,92,246,0.15)" stroke="rgba(168,85,247,0.4)" strokeWidth="1" />
              </svg>
            </div>
            <div className="profile-xp-bar-wrap">
              <div className="profile-xp-bar" style={{ width: `${xpPct * 100}%` }} />
            </div>
            <div className="profile-xp-text">{xpIntoLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()} XP</div>
            <div className="profile-xp-sub">+{xpToNext.toLocaleString()} XP to next level</div>
            <GlowTrace />
          </div>
        </div>

        {/* ── 5 stat tiles ────────────────────────────────────── */}
        <div className="profile-stats">
          <div className="profile-stat-card glow">
            <span className="profile-stat-icon"><CheckCircle /></span>
            <span className="profile-stat-text">
              <div className="profile-stat-value">{missionsCompleted}</div>
              <div className="profile-stat-label">Missions Completed</div>
            </span>
            <GlowTrace />
          </div>
          <div className="profile-stat-card glow">
            <span className="profile-stat-icon">🔥</span>
            <span className="profile-stat-text">
              <div className="profile-stat-value">{totalXP.toLocaleString()}</div>
              <div className="profile-stat-label">Total XP Earned</div>
            </span>
            <GlowTrace />
          </div>
          <div className="profile-stat-card glow">
            <span className="profile-stat-icon">🔥</span>
            <span className="profile-stat-text">
              <div className="profile-stat-value">{currentStreak} Days</div>
              <div className="profile-stat-label">Current Streak</div>
            </span>
            <GlowTrace />
          </div>
          <div className="profile-stat-card glow">
            <span className="profile-stat-icon"><BadgeIcon /></span>
            <span className="profile-stat-text">
              <div className="profile-stat-value">{objectivesAchieved}</div>
              <div className="profile-stat-label">Objectives Achieved</div>
            </span>
            <GlowTrace />
          </div>
          <div className="profile-stat-card glow">
            <span className="profile-stat-icon"><GemIcon /></span>
            <span className="profile-stat-text">
              <div className="profile-stat-value">{relicsCollected}</div>
              <div className="profile-stat-label">Relics Collected</div>
            </span>
            <GlowTrace />
          </div>
        </div>

        {/* ── Relics preview ──────────────────────────────────── */}
        <div className="profile-section glow">
          <div className="profile-section-head">
            <div>
              <div className="profile-section-title">Relics</div>
              <p className="profile-section-sub">Artifacts of discipline. Symbols of your journey.</p>
            </div>
            <button className="profile-section-link" onClick={() => onNavigate?.("Relics")}>
              View All Relics <ArrowRight />
            </button>
          </div>
          <div className="relics-grid">
            {relicsPreview.map((relic) => (
              <RelicCard key={relic.id} relic={relic} onClick={setSelectedRelic} />
            ))}
          </div>
          <GlowTrace />
        </div>

        {/* ── Achievements preview ────────────────────────────── */}
        <div className="profile-section glow">
          <div className="profile-section-head">
            <div>
              <div className="profile-section-title">Achievements</div>
              <p className="profile-section-sub">Milestones earned along the way.</p>
            </div>
            <button className="profile-section-link" onClick={() => onNavigate?.("Relics")}>
              View All <ArrowRight />
            </button>
          </div>
          <div className="profile-achievement-list">
            {achievementPreview.map((relic) => (
              <div className="profile-achievement-row" key={relic.id}>
                <div className="profile-achievement-icon">
                  <img
                    src={relic.icon}
                    alt={relic.name}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
                <div className="profile-achievement-main">
                  <div className="profile-achievement-name">{relic.name}</div>
                  <div className="profile-achievement-desc">{relic.unlockCondition}</div>
                  {!relic.unlocked && (
                    <div className="profile-achievement-progress-track">
                      <div className="profile-achievement-progress-fill" style={{ width: `${relic.progress}%` }} />
                    </div>
                  )}
                </div>
                {relic.unlocked ? (
                  <span className="profile-achievement-status"><CheckIcon /> Completed</span>
                ) : (
                  <span className="profile-achievement-status profile-achievement-status--progress">
                    {relic.current}/{relic.target ?? relic.conditionValue}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Quote footer ────────────────────────────────────── */}
        <div className="profile-quote">
          <div className="profile-quote-mark">"</div>
          <p className="profile-quote-text">
            Your aura is what you leave behind long after you're gone.<br />
            Build it wisely. Protect it fiercely.
          </p>
        </div>

        <p className="profile-version">AURAFARM v2.0 · BUILD. DISCIPLINE. BECOME.</p>
      </div>

      {selectedRelic && (
        <RelicModal relic={selectedRelic} onClose={() => setSelectedRelic(null)} />
      )}
    </div>
  );
}

export default Profile;