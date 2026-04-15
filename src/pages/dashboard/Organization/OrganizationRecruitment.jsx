import { useEffect, useState } from "react";
import { UserPlus, Save, Shield } from "lucide-react";
import toast from "react-hot-toast";
import useUserRole from "../../../hooks/useUserRole";
import API from "../../../utils/api";
import OrganizationApplicants from "./OrganizationApplicants";

const defaultRecruitment = {
  isOpen: false,
  headline: "",
  description: "",
  deadline: "",
};

const OrganizationRecruitment = () => {
  const { userInfo } = useUserRole();
  const [recruitment, setRecruitment] = useState(defaultRecruitment);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("applications");

  useEffect(() => {
    const serverRecruitment = userInfo?.organization?.recruitment;
    if (serverRecruitment && typeof serverRecruitment === "object") {
      setRecruitment({ ...defaultRecruitment, ...serverRecruitment });
    }
  }, [userInfo?.organization?.recruitment]);

  const updateRecruitment = (key, value) => {
    setRecruitment((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!userInfo?._id) return;

    try {
      setSaving(true);
      await API.patch(`/organizations/${userInfo._id}/field`, {
        field: "organization.recruitment",
        value: recruitment,
      });

      toast.success("Recruitment settings updated");
    } catch (error) {
      console.error("Failed to save recruitment settings:", error);
      toast.error(typeof error === "string" ? error : "Could not save recruitment settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="app-surface p-6">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setActiveSection("applications")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeSection === "applications"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Applications
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("settings")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeSection === "settings"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Recruitment Settings
          </button>
        </div>
      </div>

      {activeSection === "applications" && (
        <div className="app-surface p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Applications Management</h2>
          <p className="text-sm text-slate-600">
            Review, approve, reject, and remove applications directly from this page.
          </p>
          <OrganizationApplicants embedded showStats={false} />
        </div>
      )}

      {activeSection === "settings" && (
        <>
          <div className="app-surface p-6 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Recruitment Settings</h2>
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
                rows={4}
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

          <div className="app-surface p-5 flex items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-600" />
             
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="app-btn-primary"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Recruitment"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrganizationRecruitment;
