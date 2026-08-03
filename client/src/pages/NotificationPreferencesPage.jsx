import { useEffect, useState } from "react";
import { notificationsApi } from "../api/notifications.js";
import NotificationSettings from "../components/NotificationSettings.jsx";
import "../styles/notifications.css";
import "../styles/settings-aura.css";

const DEFAULT_PREFS = {
  appEnabled: true,
  emailEnabled: true,
  pushEnabled: false,
  missionReminders: true,
  achievementAlerts: true,
  weeklyReport: true,
  dailySummary: true,
  streakWarnings: true,
  reminderTime: "",
  quietHoursStart: "",
  quietHoursEnd: "",
};

const TEMPLATE_TYPES = [
  "MISSION_REMINDER",
  "MISSION_DUE_SOON",
  "ACHIEVEMENT_UNLOCK",
  "OBJECTIVE_PROGRESS",
  "STREAK_WARNING",
  "SYSTEM",
];

function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFS);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", text }

  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateDraft, setTemplateDraft] = useState({
    name: "",
    title: "",
    message: "",
    type: "MISSION_REMINDER",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await notificationsApi.getPreferences();
        setPreferences({ ...DEFAULT_PREFS, ...data });
      } catch (err) {
        setStatus({ type: "error", text: err.message || "Failed to load preferences" });
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const data = await notificationsApi.getTemplates();
        setTemplates(data);
      } catch {
        // Non-fatal — templates are a secondary feature on this page.
      } finally {
        setTemplatesLoading(false);
      }
    })();
  }, []);

  const handleChange = (next) => {
    setPreferences(next);
    setDirty(true);
    setStatus(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const updated = await notificationsApi.updatePreferences(preferences);
      setPreferences({ ...DEFAULT_PREFS, ...updated });
      setDirty(false);
      setStatus({ type: "success", text: "Saved." });
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateDraft.name.trim() || !templateDraft.message.trim()) return;
    try {
      const created = await notificationsApi.createTemplate(templateDraft);
      setTemplates((prev) => [created, ...prev]);
      setTemplateDraft({ name: "", title: "", message: "", type: "MISSION_REMINDER" });
      setShowTemplateForm(false);
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Failed to create template" });
    }
  };

  const handleDeleteTemplate = async (id) => {
    const previous = templates;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    try {
      await notificationsApi.removeTemplate(id);
    } catch {
      setTemplates(previous);
    }
  };

  const handleSendTest = async () => {
    setStatus(null);
    try {
      await notificationsApi.sendTest();
      setStatus({ type: "success", text: "Test notification sent — check the bell." });
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Failed to send test notification" });
    }
  };

  if (loading) {
    return <div className="notif-prefs-page">Loading notification preferences...</div>;
  }

  return (
    <div className="notif-prefs-page">
      <div className="notif-prefs-header">
        <h1 className="notif-prefs-title">Notification Preferences</h1>
        <p className="notif-prefs-sub">
          Choose how and when AuraFarm reaches you. Changes save when you hit Save.
        </p>
      </div>

      <NotificationSettings preferences={preferences} onChange={handleChange} />

      <div className="notif-prefs-section">
        <p className="notif-prefs-section-title">Custom Reminder Templates</p>

        {templatesLoading && <p className="notif-prefs-row-sub">Loading templates...</p>}

        {!templatesLoading && templates.length === 0 && !showTemplateForm && (
          <p className="notif-prefs-row-sub">
            No custom templates yet. Create one to replace AuraFarm's default reminder copy with your own.
          </p>
        )}

        {templates.map((template) => (
          <div key={template.id} className="notif-template-item">
            <div>
              <div className="notif-template-name">{template.title || template.name}</div>
              <div className="notif-template-message">{template.message}</div>
            </div>
            <button
              type="button"
              className="notif-card-action-btn notif-card-action-btn--danger"
              title="Delete template"
              onClick={() => handleDeleteTemplate(template.id)}
            >
              &times;
            </button>
          </div>
        ))}

        {showTemplateForm ? (
          <div className="notif-template-form">
            <input
              type="text"
              placeholder="Template name (e.g. Gym Motivation)"
              value={templateDraft.name}
              onChange={(e) => setTemplateDraft({ ...templateDraft, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Title shown in the notification"
              value={templateDraft.title}
              onChange={(e) => setTemplateDraft({ ...templateDraft, title: e.target.value })}
            />
            <textarea
              placeholder="Message, e.g. The physique you want is built by today's discipline."
              value={templateDraft.message}
              onChange={(e) => setTemplateDraft({ ...templateDraft, message: e.target.value })}
            />
            <select
              value={templateDraft.type}
              onChange={(e) => setTemplateDraft({ ...templateDraft, type: e.target.value })}
            >
              {TEMPLATE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" className="notif-prefs-save-btn" onClick={handleCreateTemplate}>
                Save Template
              </button>
              <button
                type="button"
                className="notif-dropdown-action"
                onClick={() => setShowTemplateForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="notif-add-template-btn"
            onClick={() => setShowTemplateForm(true)}
            style={{ marginTop: "12px" }}
          >
            + New Template
          </button>
        )}
      </div>

      <div className="notif-prefs-section">
        <p className="notif-prefs-section-title">Test</p>
        <p className="notif-prefs-row-sub" style={{ marginBottom: "12px" }}>
          Send yourself a sample notification to confirm delivery is working.
        </p>
        <button type="button" className="notif-dropdown-action" onClick={handleSendTest}>
          Send Test Notification
        </button>
      </div>

      <div className="notif-prefs-save-bar">
        {status && (
          <span className={`notif-prefs-status notif-prefs-status--${status.type}`}>{status.text}</span>
        )}
        <button type="button" className="notif-prefs-save-btn" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default NotificationPreferencesPage;