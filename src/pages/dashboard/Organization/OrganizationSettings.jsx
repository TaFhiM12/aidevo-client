import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
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

const SETTINGS_TABS = [
  { id: "operations", label: "Operations", icon: Building2 },
  { id: "alerts", label: "Alerts", icon: BellRing },
  { id: "recruitment", label: "Recruitment", icon: UserPlus },
];

const OrganizationSettings = () => {
  const { userInfo } = useUserRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [settings, setSettings] = useState(defaultSettings);
  const [recruitment, setRecruitment] = useState(defaultRecruitment);
  const [saving, setSaving] = useState(false);

  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");
    return SETTINGS_TABS.find((t) => t.id === tab)?.id || "operations";
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

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
    <div className="mx-auto space-y-6">
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

      {activeTab === "operations" && (
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
      )}

      {activeTab === "alerts" && (
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
      )}

      {activeTab === "recruitment" && (
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
      )}

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
