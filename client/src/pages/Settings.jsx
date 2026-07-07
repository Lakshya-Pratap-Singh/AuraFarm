// Settings — AuraFarm styled. No new backend calls; logout stays wired to
// AuthContext, toggles are local UI state only (aesthetic preferences can
// be persisted to localStorage if you want persistence later).

import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useXP } from "../context/XPContext.jsx";
import "../styles/settings-aura.css";

function ChevronRight() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>;
}
function UserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round"/></svg>;
}
function BellIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round"/></svg>;
}
function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5v-6l8-3z" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function MoonIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ZapIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function InfoIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" strokeLinecap="round"/></svg>;
}
function LogOutIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>;
}
function GlobeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeLinecap="round"/></svg>;
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function Toggle({ on, onToggle }) {
  return (
    <label className="settings-toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={on} onChange={onToggle} />
      <span className="settings-toggle-track" />
    </label>
  );
}

function SettingsRow({ icon, title, sub, right, onClick, danger }) {
  return (
    <div className={`settings-row${danger ? " settings-row--danger" : ""}`} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="settings-row-icon">{icon}</div>
      <div className="settings-row-content">
        <span className="settings-row-title">{title}</span>
        {sub && <span className="settings-row-sub">{sub}</span>}
      </div>
      <div className="settings-row-right">{right ?? <ChevronRight />}</div>
    </div>
  );
}

function Settings() {
  const { user, logout } = useAuth();
  const { level, totalXP } = useXP();

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [animations, setAnimations] = useState(true);

  const handleLogout = () => {
    if (window.confirm("End your session? Your progress is saved.")) logout();
  };

  const handleClearData = () => {
    if (window.confirm("This will reset ALL your missions and objectives. This cannot be undone.")) {
      localStorage.removeItem("missions");
      localStorage.removeItem("objectives");
      localStorage.removeItem("dailywise_xp");
      localStorage.removeItem("dailywise_activity_log");
      window.location.reload();
    }
  };

  return (
    <div className="settings-page">
      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="settings-hero">
        <h1 className="settings-hero-heading">Settings</h1>
        <p className="settings-hero-sub">Customize your AuraFarm experience.</p>
      </div>

      {/* ── Profile card ────────────────────────────────────── */}
      <div className="settings-profile-card">
        <div className="settings-avatar">
          {user?.photoURL
            ? <img src={user.photoURL} alt={user.displayName || "Cultivator"} referrerPolicy="no-referrer"/>
            : <UserIcon />
          }
        </div>
        <div className="settings-profile-info">
          <span className="settings-profile-name">{user?.displayName || "Shadow"}</span>
          <span className="settings-profile-email">{user?.email || "cultivator@aurafarm.com"}</span>
          <span className="settings-profile-level">
            <ZapIcon />
            Aura Level {level} · {totalXP?.toLocaleString() ?? 0} XP
          </span>
        </div>
      </div>

      <div className="settings-body">
        {/* ── Account ─────────────────────────────────────────── */}
        <div>
          <p className="settings-group-label">Account</p>
          <div className="settings-group">
            <SettingsRow icon={<UserIcon />} title="Edit Profile" sub="Change your name and avatar" />
            <SettingsRow icon={<ShieldIcon />} title="Privacy & Security" sub="Manage your account security" />
          </div>
        </div>

        {/* ── Preferences ─────────────────────────────────────── */}
        <div>
          <p className="settings-group-label">Preferences</p>
          <div className="settings-group">
            <SettingsRow
              icon={<BellIcon />}
              title="Push Notifications"
              sub="Daily mission reminders"
              right={<Toggle on={notifications} onToggle={() => setNotifications((v) => !v)} />}
            />
            <SettingsRow
              icon={<ZapIcon />}
              title="Sound Effects"
              sub="XP gain and completion sounds"
              right={<Toggle on={sounds} onToggle={() => setSounds((v) => !v)} />}
            />
            <SettingsRow
              icon={<MoonIcon />}
              title="Animations"
              sub="Glow effects and transitions"
              right={<Toggle on={animations} onToggle={() => setAnimations((v) => !v)} />}
            />
            <SettingsRow icon={<GlobeIcon />} title="Language" sub="English (EN)" />
          </div>
        </div>

        {/* ── Data ────────────────────────────────────────────── */}
        <div>
          <p className="settings-group-label">Data</p>
          <div className="settings-group">
            <SettingsRow icon={<InfoIcon />} title="About AuraFarm" sub="Version 2.0 · Build. Discipline. Become." />
            <SettingsRow
              icon={<TrashIcon />}
              title="Reset All Data"
              sub="Permanently delete all missions and progress"
              onClick={handleClearData}
              danger
            />
            <SettingsRow
              icon={<LogOutIcon />}
              title="Sign Out"
              sub="End your current session"
              onClick={handleLogout}
              danger
            />
          </div>
        </div>
      </div>

      <p className="settings-version">AURAFARM v2.0 · BUILD. DISCIPLINE. BECOME.</p>
    </div>
  );
}

export default Settings;