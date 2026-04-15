import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Bell, ShieldCheck, Sparkles, Save } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useUserRole from "../../../hooks/useUserRole";
import API from "../../../utils/api";

const defaultSettings = {
  emailNotifications: true,
  recommendationAlerts: true,
  engagementDigest: true,
  profileVisibility: "members",
};

const SETTINGS_TABS = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: ShieldCheck },
];

const StudentSettings = () => {
  const { userInfo } = useUserRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);

  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");
    return SETTINGS_TABS.find((t) => t.id === tab)?.id || "notifications";
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

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
      {/* Tab Bar */}
      <div className="sticky  flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/96 p-1 backdrop-blur-2xl sm:gap-3 sm:p-1.5">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 sm:px-4 sm:py-3 ${
                isActive
                  ? "border border-sky-200/80 bg-gradient-to-r from-sky-50 to-blue-50 text-sky-800 shadow-sm shadow-sky-100/70"
                  : "border border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/80 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="sync">
        {activeTab === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="app-surface space-y-5 p-6"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-sky-600" />
              <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-slate-300 hover:bg-white/50">
              <span className="text-slate-700">Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => updateSetting("emailNotifications", e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-sky-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-slate-300 hover:bg-white/50">
              <span className="text-slate-700">Recommendation Alerts</span>
              <input
                type="checkbox"
                checked={settings.recommendationAlerts}
                onChange={(e) => updateSetting("recommendationAlerts", e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-sky-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-slate-300 hover:bg-white/50">
              <span className="text-slate-700">Weekly Engagement Digest</span>
              <input
                type="checkbox"
                checked={settings.engagementDigest}
                onChange={(e) => updateSetting("engagementDigest", e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-sky-600"
              />
            </label>
          </motion.div>
        )}

        {activeTab === "privacy" && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="app-surface space-y-4 p-6"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Privacy</h2>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Profile Visibility</label>
              <select
                value={settings.profileVisibility}
                onChange={(e) => updateSetting("profileVisibility", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 transition-colors hover:border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-50"
              >
                <option value="public">Public</option>
                <option value="members">Members only</option>
                <option value="private">Private</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Control who can view your profile and engagement data.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <div className="app-surface flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Sparkles className="h-5 w-5 flex-shrink-0 text-sky-600" />
          <span className="font-medium text-slate-800">Keep your settings aligned with your goals.</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex min-w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default StudentSettings;
