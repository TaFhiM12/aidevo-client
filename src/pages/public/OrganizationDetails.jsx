import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  Mail,
  Users,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  UserPlus,
  LogIn,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import API from "../../utils/api";
import Loading from "../../components/common/Loading";
import useAuth from "../../hooks/useAuth";
import useUserRole from "../../hooks/useUserRole";
import ApplicationModal from "../../components/layouts/ApplicationModal";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const OrganizationDetails = () => {
  const { user } = useAuth();
  const { userInfo, loading: roleLoading } = useUserRole();
  const { id } = useParams();
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["organization-details", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await API.get("/organizations");
      const organizations = Array.isArray(response?.data) ? response.data : [];
      const found = organizations.find((item) => String(item?._id) === String(id));
      if (!found) {
        return { organization: null, error: "Organization not found." };
      }
      return { organization: found, error: "" };
    },
  });

  const organization = data?.organization || null;
  const error = data?.error || "";

  const applicationsQuery = useQuery({
    queryKey: ["student-applications", user?.uid],
    enabled: Boolean(user?.uid && userInfo?.role === "student"),
    queryFn: async () => {
      const response = await API.get(`/students/${user.uid}/applications`);
      return Array.isArray(response?.data) ? response.data : [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const organizationInfo = useMemo(() => organization?.organization || {}, [organization]);
  const userApplications = useMemo(
    () => applicationsQuery.data ?? [],
    [applicationsQuery.data]
  );
  const applicationsLoading = applicationsQuery.isLoading;

  const recruitmentStatus = useMemo(() => {
    const recruitment = organizationInfo?.recruitment || {};
    const isOpen = recruitment?.isOpen === true;
    const deadlineTs = recruitment?.deadline
      ? new Date(recruitment.deadline).getTime()
      : null;
    const deadlinePassed =
      Number.isFinite(deadlineTs) && deadlineTs < Date.now();

    return {
      isOpen: isOpen && !deadlinePassed,
      headline: recruitment?.headline || "",
      description: recruitment?.description || "",
      deadline: recruitment?.deadline || "",
      deadlinePassed,
    };
  }, [organizationInfo]);

  const applicationStatus = useMemo(() => {
    if (!user || userInfo?.role !== "student" || !organization?._id) return null;
    const found = userApplications.find(
      (app) => String(app.organizationId) === String(organization._id)
    );
    return found?.status || null;
  }, [organization?._id, user, userApplications, userInfo?.role]);

  const getApplyButtonConfig = () => {
    if (!user) {
      return {
        text: "Sign In to Apply",
        disabled: true,
        icon: LogIn,
        buttonClass:
          "app-btn-secondary bg-slate-200 border-slate-200 text-slate-600 cursor-not-allowed",
        helperText:
          "Please sign in with a student account to submit an application.",
      };
    }

    if (roleLoading || applicationsLoading) {
      return {
        text: "Loading...",
        disabled: true,
        icon: Clock,
        buttonClass:
          "app-btn-secondary bg-slate-200 border-slate-200 text-slate-600 cursor-not-allowed",
        helperText: "Checking your eligibility...",
      };
    }

    if (!recruitmentStatus.isOpen) {
      return {
        text: recruitmentStatus.deadlinePassed
          ? "Recruitment Closed (Deadline Passed)"
          : "Recruitment Closed",
        disabled: true,
        icon: AlertCircle,
        buttonClass:
          "app-btn-secondary bg-slate-200 border-slate-200 text-slate-600 cursor-not-allowed",
        helperText: "This organization is not accepting applications right now.",
      };
    }

    if (userInfo?.role !== "student") {
      return {
        text: "Students Only",
        disabled: true,
        icon: AlertCircle,
        buttonClass:
          "app-btn-secondary bg-slate-200 border-slate-200 text-slate-600 cursor-not-allowed",
        helperText: "Only student accounts can apply to organizations.",
      };
    }

    if (applicationStatus) {
      const statusConfig = {
        pending: {
          text: "Application Pending",
          icon: Clock,
          buttonClass:
            "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold cursor-default",
        },
        approved: {
          text: "Approved ✓",
          icon: CheckCircle,
          buttonClass:
            "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold cursor-default",
        },
        rejected: {
          text: "Application Rejected",
          icon: XCircle,
          buttonClass:
            "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold cursor-default",
        },
      };

      const statusEntry = statusConfig[applicationStatus] || statusConfig.pending;
      return {
        ...statusEntry,
        disabled: true,
        helperText: "You have already applied to this organization.",
      };
    }

    return {
      text: "Apply Now",
      disabled: false,
      icon: Users,
      buttonClass: "app-btn-primary",
      helperText: "Join this organization and be part of the community.",
    };
  };

  const applyButtonConfig = getApplyButtonConfig();
  const ApplyIcon = applyButtonConfig.icon;

  const handleApply = () => {
    if (applyButtonConfig.disabled || !organization) {
      if (!user) {
        toast.error("Please sign in to apply");
      }
      return;
    }
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async () => {
    setShowApplicationModal(false);
    await applicationsQuery.refetch();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50/40 p-12 mt-6">
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-5">
        <Link
          to="/organization"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Organizations
        </Link>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {organization && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {organizationInfo.coverPhoto ? (
                <img
                  src={organizationInfo.coverPhoto}
                  alt={organizationInfo.name || organization.name}
                  className="w-full h-52 object-cover"
                />
              ) : (
                <div className="h-52 bg-gradient-to-r from-cyan-500 to-blue-600" />
              )}

              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                    {organization.photoURL ? (
                      <img
                        src={organization.photoURL}
                        alt={organizationInfo.name || organization.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                        {organizationInfo.name || organization.name}
                      </h1>
                      {organizationInfo.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                          <BadgeCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-1">
                      {organizationInfo.tagline || "Serving students through impactful events and community initiatives."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <h2 className="font-semibold text-slate-900">Organization Details</h2>
                <div className="space-y-3 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Type: {organizationInfo.type || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Campus: {organizationInfo.campus || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email: {organization.email || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Members: {organizationInfo.membersCount || 0}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <h2 className="font-semibold text-slate-900">Profile Snapshot</h2>
                <div className="space-y-3 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Founded: {organizationInfo.founded || "Not specified"}
                  </p>
                  <p className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Gallery photos: {Array.isArray(organizationInfo.photoAlbum) ? organizationInfo.photoAlbum.length : 0}
                  </p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {organizationInfo.description ||
                    "This organization is actively involved in student development, engagement programs, and collaborative events."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 md:col-span-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <h2 className="font-semibold text-slate-900">Recruitment Status</h2>
                </div>

                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${recruitmentStatus.isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {recruitmentStatus.isOpen ? 'Open for Applications' : 'Recruitment Closed'}
                </span>

                {recruitmentStatus.headline && (
                  <p className="text-sm font-medium text-slate-900">{recruitmentStatus.headline}</p>
                )}

                {recruitmentStatus.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">{recruitmentStatus.description}</p>
                )}

                {recruitmentStatus.deadline && (
                  <p className="text-xs text-slate-500">
                    Application deadline: {new Date(recruitmentStatus.deadline).toLocaleDateString()}
                  </p>
                )}

                {user && (
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={applyButtonConfig.disabled}
                      className={`w-full sm:w-auto ${applyButtonConfig.buttonClass}`}
                    >
                      <ApplyIcon className="w-4 h-4" />
                      {applyButtonConfig.text}
                    </button>
                    {applyButtonConfig.helperText && (
                      <p className="text-xs text-slate-500">{applyButtonConfig.helperText}</p>
                    )}
                  </div>
                )}

                {!user && (
                  <p className="text-xs text-slate-500">
                    Sign in to view your application eligibility and apply.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showApplicationModal && organization && (
          <ApplicationModal
            organization={organization}
            onClose={() => setShowApplicationModal(false)}
            onSubmit={handleApplicationSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizationDetails;
