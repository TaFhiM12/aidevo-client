import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    Calendar,
    Users,
    FileText,
    CircleCheck,
    TrendingUp,
    Wallet,
    AlertTriangle,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useUserRole from "../../../hooks/useUserRole";
import API from "../../../utils/api";
import Loading from "../../../components/common/Loading";

const Card = ({ label, value, icon: Icon }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-600">{label}</p>
            <Icon className="w-5 h-5 text-sky-600" />
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
);

const OrganizationAnalytics = () => {
    const { user } = useAuth();
    const { userInfo } = useUserRole();
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState(null);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user?.uid || !userInfo?.email) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const [overviewRes, paymentsRes] = await Promise.all([
                    API.get(`/users/dashboard-overview/${user.uid}`),
                    API.get(`/payments/organization/${encodeURIComponent(userInfo.email)}`),
                ]);

                setDashboard(overviewRes?.data || null);
                setPayments(Array.isArray(paymentsRes?.data) ? paymentsRes.data : []);
            } catch (error) {
                console.error("Analytics load failed:", error);
                setDashboard(null);
                setPayments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user?.uid, userInfo?.email]);

    const stats = dashboard?.stats || {};
    const overview = dashboard?.overview || {};
    const attendanceAnalytics = overview?.attendanceAnalytics || {};
    const perEventAttendance = Array.isArray(overview?.perEventAttendance)
        ? overview.perEventAttendance
        : [];

    const metrics = useMemo(() => {
        const totalApplications = Number(stats.totalApplications || 0);
        const approvedApplications = Number(stats.approvedApplications || 0);
        const totalEvents = Number(stats.totalEvents || 0);
        const totalRevenue = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        return {
            conversionRate:
                `${attendanceAnalytics.perEventConversionRate ?? 0}%`,
            averageApplicantsPerEvent:
                totalEvents > 0
                    ? (totalApplications / totalEvents).toFixed(1)
                    : "0.0",
            averageParticipantsPerEvent: attendanceAnalytics.averageParticipantsPerEvent ?? 0,
            totalRevenue: `BDT ${totalRevenue.toLocaleString()}`,
            activePipeline: (overview.recentApplications || []).filter(
                (item) => item.status === "pending"
            ).length,
            noShowRisk: `${attendanceAnalytics.noShowRisk?.level || "low"} (${attendanceAnalytics.noShowRisk?.score ?? 0}%)`,
        };
    }, [stats, payments, overview.recentApplications, attendanceAnalytics]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Organization Analytics</h1>
                <p className="text-slate-600 mt-1">
                    Production-style operational insights for events, applicants, members, and revenue.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card label="Total Events" value={stats.totalEvents || 0} icon={Calendar} />
                <Card label="Total Applications" value={stats.totalApplications || 0} icon={FileText} />
                <Card label="Active Members" value={stats.activeMembers || 0} icon={Users} />
                <Card label="Approved Applicants" value={stats.approvedApplications || 0} icon={CircleCheck} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card label="Conversion Rate" value={metrics.conversionRate} icon={TrendingUp} />
                <Card
                    label="Avg Applicants/Event"
                    value={metrics.averageApplicantsPerEvent}
                    icon={Activity}
                />
                <Card label="Avg Participants/Event" value={metrics.averageParticipantsPerEvent} icon={Users} />
                <Card label="No-Show Risk" value={metrics.noShowRisk} icon={AlertTriangle} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card label="Revenue" value={metrics.totalRevenue} icon={Wallet} />
                <Card label="Pending Pipeline" value={metrics.activePipeline} icon={FileText} />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Per Event Attendance Health</h2>
                <div className="space-y-2">
                    {perEventAttendance.length === 0 && (
                        <p className="text-sm text-slate-500">No attendance data yet.</p>
                    )}
                    {perEventAttendance.map((event) => (
                        <div key={String(event.eventId)} className="rounded-xl border border-slate-100 px-4 py-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-medium text-slate-900">{event.title}</p>
                                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                    Fill {event.fillRate}%
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                                {event.participantCount} participants
                                {event.capacity > 0 ? ` / ${event.capacity} capacity` : ""}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Upcoming Events</h2>
                <div className="space-y-2">
                    {(overview.upcomingEvents || []).length === 0 && (
                        <p className="text-sm text-slate-500">No upcoming events scheduled.</p>
                    )}
                    {(overview.upcomingEvents || []).map((event) => (
                        <div key={String(event._id)} className="rounded-xl border border-slate-100 px-4 py-3">
                            <p className="font-medium text-slate-900">{event.title}</p>
                            <p className="text-sm text-slate-600">{event.location || "TBA"}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrganizationAnalytics;