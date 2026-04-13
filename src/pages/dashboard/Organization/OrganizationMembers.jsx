import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Search,
    Users,
    Calendar,
    Mail,
    Building2,
    Download,
    AlertCircle,
} from "lucide-react";
import API from "../../../utils/api";
import useUserRole from "../../../hooks/useUserRole";
import toast from "react-hot-toast";
import useInfiniteScrollSlice from "../../../hooks/useInfiniteScrollSlice";

const OrganizationMembers = () => {
    const { userInfo, loading: roleLoading } = useUserRole();
    const [searchTerm, setSearchTerm] = useState("");
    const {
        data,
        isLoading: loading,
        error,
    } = useQuery({
        queryKey: ["organization-members", userInfo?.email],
        enabled: Boolean(userInfo?.email),
        queryFn: async () => {
            const response = await API.get(
                `/organizations/email/${encodeURIComponent(userInfo.email)}/members`
            );
            const payload = response?.data || {};
            return {
                members: Array.isArray(payload?.members) ? payload.members : [],
                organizationName:
                    payload?.organization?.name || userInfo?.organizationName || "Organization",
            };
        },
        staleTime: 1000 * 60 * 3,
        gcTime: 1000 * 60 * 20,
        refetchOnWindowFocus: false,
    });

    const members = data?.members || [];
    const organizationName = data?.organizationName || userInfo?.organizationName || "Organization";

    const formatDate = (value) => {
        if (!value) return "N/A";
        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const filteredMembers = useMemo(() => {
        if (!searchTerm.trim()) return members;

        const query = searchTerm.toLowerCase();
        return members.filter((member) => {
            const haystack = `${member.studentName || ""} ${member.studentEmail || ""} ${member.studentInfo?.department || ""} ${member.studentInfo?.session || ""}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [members, searchTerm]);

    const {
        visibleItems: visibleMembers,
        hasMore,
        loadMoreRef,
    } = useInfiniteScrollSlice(filteredMembers, {
        pageSize: 20,
        resetDeps: [searchTerm, filteredMembers.length],
    });

    const activeMembers = useMemo(
        () => members.filter((member) => member.status === "active").length,
        [members]
    );

    const newestJoinDate = useMemo(() => {
        if (!members.length) return "N/A";
        const sorted = [...members].sort(
            (a, b) => new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0)
        );
        return formatDate(sorted[0]?.joinedAt);
    }, [members]);

    const exportCsv = () => {
        if (!members.length) {
            toast.error("No members to export");
            return;
        }

        const escapeCsv = (value) => {
            const str = String(value ?? "");
            if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
                return `"${str.replace(/\"/g, '""')}"`;
            }
            return str;
        };

        const headers = [
            "Organization",
            "Member Name",
            "Member Email",
            "Department",
            "Session",
            "Status",
            "Joined At",
        ];

        const rows = members.map((member) => [
            organizationName,
            member.studentName || "",
            member.studentEmail || "",
            member.studentInfo?.department || "",
            member.studentInfo?.session || "",
            member.status || "",
            formatDate(member.joinedAt),
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-members.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    if (roleLoading || loading) {
        return (
            <div className="space-y-6">
                <div className="app-surface p-6 animate-pulse">
                    <div className="h-8 w-60 rounded bg-gray-200 mb-3" />
                    <div className="h-4 w-96 rounded bg-gray-200 mb-4" />
                    <div className="h-11 w-full rounded-xl bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="app-surface p-4 animate-pulse">
                            <div className="h-4 w-24 rounded bg-gray-200 mb-3" />
                            <div className="h-8 w-20 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
                <div className="app-surface p-5 animate-pulse min-h-[280px]">
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((row) => (
                            <div key={row} className="h-12 rounded bg-gray-200" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="app-surface p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Organization Members</h1>
                        <p className="text-slate-600 mt-1">
                            Manage and review your verified member base for {organizationName}.
                        </p>
                    </div>
                    <button
                        onClick={exportCsv}
                        className="app-btn-secondary px-4 py-2 inline-flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                <div className="mt-4 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, department"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {String(error || "Failed to load organization members")}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="app-surface p-4">
                    <p className="text-xs text-slate-500">Total Members</p>
                    <p className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2">
                        <Users className="w-5 h-5 text-sky-600" />
                        {members.length}
                    </p>
                </div>
                <div className="app-surface p-4">
                    <p className="text-xs text-slate-500">Active Members</p>
                    <p className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                        {activeMembers}
                    </p>
                </div>
                <div className="app-surface p-4">
                    <p className="text-xs text-slate-500">Last Joined</p>
                    <p className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-violet-600" />
                        {newestJoinDate}
                    </p>
                </div>
            </div>

            <div className="app-surface overflow-hidden">
                {filteredMembers.length === 0 ? (
                    <div className="p-8 text-center text-slate-600">
                        {members.length === 0
                            ? "No members joined yet."
                            : "No members match this search."}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px]">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Session</th>
                                    <th className="px-4 py-3">Joined</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleMembers.map((member) => (
                                    <tr key={member._id} className="border-b border-slate-100 last:border-b-0">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {member.studentName || "Unnamed"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            <span className="inline-flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5" />
                                                {member.studentEmail || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {member.studentInfo?.department || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {member.studentInfo?.session || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {formatDate(member.joinedAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 capitalize">
                                                {member.status || "active"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {hasMore && filteredMembers.length > 0 && (
                            <div ref={loadMoreRef} className="py-4 text-center text-sm text-slate-500">
                                Loading more members...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizationMembers;