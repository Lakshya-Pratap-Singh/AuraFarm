// NotificationSettings.jsx — controlled settings panel. Owns no fetch/save
// logic itself (that lives in NotificationPreferencesPage) so it can also
// be dropped into a smaller "quick settings" surface later if needed.

function Toggle({ on, onToggle }) {
  return (
    <label className="settings-toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={!!on} onChange={onToggle} />
      <span className="settings-toggle-track" />
    </label>
  );
}

function Row({ title, sub, on, onToggle }) {
  return (
    <div className="notif-prefs-row">
      <div>
        <div className="notif-prefs-row-title">{title}</div>
        {sub && <div className="notif-prefs-row-sub">{sub}</div>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

function NotificationSettings({ preferences, onChange }) {
  const set = (field) => (e) => onChange({ ...preferences, [field]: e.target.checked });
  const setValue = (field) => (e) => onChange({ ...preferences, [field]: e.target.value });

  return (
    <>
      <div className="notif-prefs-section">
        <p className="notif-prefs-section-title">Channels</p>
        <Row title="App Notifications" sub="Shown in the bell dropdown" on={preferences.appEnabled} onToggle={set("appEnabled")} />
        <Row title="Email Notifications" sub="Sent to your account email" on={preferences.emailEnabled} onToggle={set("emailEnabled")} />
        <Row title="Push Notifications" sub="Sent to registered devices" on={preferences.pushEnabled} onToggle={set("pushEnabled")} />
      </div>

      <div className="notif-prefs-section">
        <p className="notif-prefs-section-title">Notification Types</p>
        <Row title="Mission Reminders" sub="Open missions & due-soon alerts" on={preferences.missionReminders} onToggle={set("missionReminders")} />
        <Row title="Achievement Alerts" sub="Relics unlocked & objective progress" on={preferences.achievementAlerts} onToggle={set("achievementAlerts")} />
        <Row title="Daily Summary" sub="A recap each morning" on={preferences.dailySummary} onToggle={set("dailySummary")} />
        <Row title="Weekly Report" sub="A recap every Sunday" on={preferences.weeklyReport} onToggle={set("weeklyReport")} />
        <Row title="Streak Warnings" sub="Sent before your streak breaks" on={preferences.streakWarnings} onToggle={set("streakWarnings")} />
      </div>

      <div className="notif-prefs-section">
        <p className="notif-prefs-section-title">Timing</p>
        <div className="notif-prefs-time-row">
          <div>
            <div className="notif-prefs-row-title">Custom Reminder Time</div>
            <div className="notif-prefs-row-sub">When mission reminders are sent</div>
          </div>
          <input type="time" value={preferences.reminderTime || ""} onChange={setValue("reminderTime")} />
        </div>
        <div className="notif-prefs-time-row">
          <div>
            <div className="notif-prefs-row-title">Quiet Hours Start</div>
            <div className="notif-prefs-row-sub">No email/push sent after this time</div>
          </div>
          <input type="time" value={preferences.quietHoursStart || ""} onChange={setValue("quietHoursStart")} />
        </div>
        <div className="notif-prefs-time-row">
          <div>
            <div className="notif-prefs-row-title">Quiet Hours End</div>
            <div className="notif-prefs-row-sub">Delivery resumes after this time</div>
          </div>
          <input type="time" value={preferences.quietHoursEnd || ""} onChange={setValue("quietHoursEnd")} />
        </div>
      </div>
    </>
  );
}

export default NotificationSettings;