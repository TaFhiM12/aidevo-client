import { useEffect, useState } from "react";
import { Building2, Shield, Save, BellRing, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import useUserRole from "../../../hooks/useUserRole";
import API from "../../../utils/api";

const defaultSettings = {
  autoApproveMembers: false,
  applicationEmailAlerts: true,
  paymentReceiptAlerts: true,
  profileTheme: "professional",
};

const defaultRecruitment = {
  isOpen: false,
  headline: "",
  description: "",
  deadline: "",
};

const OrganizationSettings = () => {
  const { userInfo } = useUserRole();
  const [settings, setSettings] = useState(defaultSettings);
  const [recruitment, setRecruitment] = useState(defaultRecruitment);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cacheKey = `org_settings_${userInfo?.uid || "guest"}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(cached) });
      } catch {
        setSettings(defaultSettings);
      }
    }

    const serverRecruitment = userInfo?.organization?.recruitment;
    if (serverRecruitment && typeof serverRecruitment === "object") {
      setRecruitment({ ...defaultRecruitment, ...serverRecruitment });
    }
  }, [userInfo?.uid]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateRecruitment = (key, value) => {
    setRecruitment((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!userInfo?._id) return;

    try {
      setSaving(true);
      const cacheKey = `org_settings_${userInfo?.uid || "guest"}`;
      localStorage.setItem(cacheKey, JSON.stringify(settings));

      await API.patch(`/organizations/${userInfo._id}/field`, {
        field: "organization.settings",
        value: settings,
      });

      await API.patch(`/organizations/${userInfo._id}/field`, {
        field: "organization.recruitment",
        value: recruitment,
      });

      toast.success("Organization settings updated");
    } catch (error) {
      console.error("Failed to save organization settings:", error);
      toast.error(typeof error === "string" ? error : "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="app-surface p-4">
        <h1 className="text-2xl font-bold text-slate-900">Organization Settings</h1>
        <p className="text-slate-600 mt-1">
          Configure operations, governance, and communication preferences in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="app-surface p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-semibold text-slate-900">Operations</h2>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-slate-700">Auto-approve member onboarding</span>
            <input
              type="checkbox"
              checked={settings.autoApproveMembers}
              onChange={(e) => updateSetting("autoApproveMembers", e.target.checked)}
            />
          </label>

          <label className="block text-sm text-slate-600">Profile Theme</label>
          <select
            value={settings.profileTheme}
            onChange={(e) => updateSetting("profileTheme", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2"
          >
            <option value="professional">Professional</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        <div className="app-surface p-4 space-y-4">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Alerts</h2>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-slate-700">Application email alerts</span>
            <input
              type="checkbox"
              checked={settings.applicationEmailAlerts}
              onChange={(e) => updateSetting("applicationEmailAlerts", e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-slate-700">Payment receipt alerts</span>
            <input
              type="checkbox"
              checked={settings.paymentReceiptAlerts}
              onChange={(e) => updateSetting("paymentReceiptAlerts", e.target.checked)}
            />
          </label>
        </div>

        <div className="app-surface p-4 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Recruitment</h2>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-slate-700">Open recruitment for students</span>
            <input
              type="checkbox"
              checked={recruitment.isOpen}
              onChange={(e) => updateRecruitment("isOpen", e.target.checked)}
            />
          </label>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Recruitment Headline</label>
            <input
              value={recruitment.headline}
              onChange={(e) => updateRecruitment("headline", e.target.value)}
              placeholder="e.g. Looking for motivated volunteers"
              className="w-full border border-slate-200 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Recruitment Description</label>
            <textarea
              value={recruitment.description}
              onChange={(e) => updateRecruitment("description", e.target.value)}
              rows={3}
              placeholder="Tell students why they should apply"
              className="w-full border border-slate-200 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Application Deadline</label>
            <input
              type="date"
              value={recruitment.deadline || ""}
              onChange={(e) => updateRecruitment("deadline", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="app-surface p-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <Shield className="w-5 h-5 text-sky-600" />
          <span className="font-medium text-slate-800">Operational controls are configured for consistent execution.</span>
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

export default OrganizationSettings;
