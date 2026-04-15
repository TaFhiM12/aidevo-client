import { useMemo } from "react";
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
} from "lucide-react";
import API from "../../utils/api";
import Loading from "../../components/common/Loading";

const OrganizationDetails = () => {
  const { id } = useParams();
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

  const organizationInfo = useMemo(() => organization?.organization || {}, [organization]);
  const recruitment = organizationInfo?.recruitment || {};
  const recruitmentOpen = recruitment?.isOpen === true;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50/40 pb-12">
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
                      <h1 className="text-2xl font-bold text-slate-900">
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

                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${recruitmentOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {recruitmentOpen ? 'Open for Applications' : 'Recruitment Closed'}
                </span>

                {recruitment?.headline && (
                  <p className="text-sm font-medium text-slate-900">{recruitment.headline}</p>
                )}

                {recruitment?.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">{recruitment.description}</p>
                )}

                {recruitment?.deadline && (
                  <p className="text-xs text-slate-500">
                    Application deadline: {new Date(recruitment.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationDetails;
