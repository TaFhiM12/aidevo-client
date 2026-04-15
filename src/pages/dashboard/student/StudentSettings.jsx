import { useEffect, useState } from "react";
import { Bell, ShieldCheck, Sparkles, Save } from "lucide-react";
import toast from "react-hot-toast";
import useUserRole from "../../../hooks/useUserRole";
import API from "../../../utils/api";

const defaultSettings = {
  emailNotifications: true,
  recommendationAlerts: true,
  engagementDigest: true,
  profileVisibility: "members",
};

const StudentSettings = () => {
  const { userInfo } = useUserRole();
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cacheKey = `student_settings_${userInfo?.uid || "guest"}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(cached) });
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, [userInfo?.uid]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!userInfo?._id) return;

    try {
      setSaving(true);
      const cacheKey = `student_settings_${userInfo?.uid || "guest"}`;
      localStorage.setItem(cacheKey, JSON.stringify(settings));

      await API.patch(`/students/${userInfo._id}/field`, {
        field: "student.preferences",
        value: settings,
      });

      toast.success("Student settings saved successfully");
    } catch (error) {
      console.error("Failed to save student settings:", error);
      toast.error(typeof error === "string" ? error : "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="app-surface p-6">
        <h1 className="text-2xl font-bold text-slate-900">Student Settings</h1>
        <p className="text-slate-600 mt-1">
          Manage notifications, visibility, and engagement preferences.
        </p>
      </div>

      <div className="app-surface p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        </div>

        <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-slate-700">Email Notifications</span>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => updateSetting("emailNotifications", e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-slate-700">Recommendation Alerts</span>
          <input
            type="checkbox"
            checked={settings.recommendationAlerts}
            onChange={(e) => updateSetting("recommendationAlerts", e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-slate-700">Weekly Engagement Digest</span>
          <input
            type="checkbox"
            checked={settings.engagementDigest}
            onChange={(e) => updateSetting("engagementDigest", e.target.checked)}
          />
        </label>
      </div>

      <div className="app-surface p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">Privacy</h2>
        </div>

        <label className="block text-sm text-slate-600">Profile Visibility</label>
        <select
          value={settings.profileVisibility}
          onChange={(e) => updateSetting("profileVisibility", e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2"
        >
          <option value="public">Public</option>
          <option value="members">Members only</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="app-surface p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-600" />
          <span className="font-medium text-slate-800">Keep your settings aligned with your goals.</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="app-btn-primary"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default StudentSettings;
