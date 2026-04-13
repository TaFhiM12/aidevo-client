import React, { useMemo } from 'react';
import { Users, Calendar, MessageCircle, Sparkles, ArrowRight, MapPin, Building2 } from 'lucide-react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import API from '../../../utils/api';

const Hero = () => {
    const defaultStats = {
        organizations: 0,
        activeOrganizations: 0,
        events: 0,
        campuses: 0,
        applications: 0,
    };

    const { data: stats = defaultStats } = useQuery({
        queryKey: ['hero-stats'],
        queryFn: async () => {
            try {
                const [orgRes, eventRes] = await Promise.all([
                    API.get('/organizations/with-applications').catch(() => API.get('/organizations')),
                    API.get('/events').catch(() => ({ data: [] })),
                ]);

                const organizations = Array.isArray(orgRes?.data) ? orgRes.data : [];
                const events = Array.isArray(eventRes?.data) ? eventRes.data : [];

                const campuses = new Set(
                    organizations
                        .map((org) => org?.organization?.campus)
                        .filter(Boolean)
                ).size;

                const activeOrganizations = organizations.filter(
                    (org) => String(org?.status || '').toLowerCase() === 'active'
                ).length;

                const applications = organizations.reduce(
                    (sum, org) => sum + Number(org?.applicationCount || 0),
                    0
                );

                return {
                    organizations: organizations.length,
                    activeOrganizations,
                    events: events.length,
                    campuses,
                    applications,
                };
            } catch {
                return defaultStats;
            }
        },
    });

    const topBadgeText = useMemo(() => {
        if (stats.organizations > 0) {
            return `Live directory with ${stats.organizations} organizations`;
        }
        return 'Live campus organization directory';
    }, [stats.organizations]);

    return (
        <div className=" min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 overflow-hidden my-10">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                {/* Top Badge */}
                <div className="flex justify-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-blue-100">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">{topBadgeText}</span>
                    </div>
                </div>

                {/* Hero Headline */}
                <div className="text-center max-w-4xl mx-auto mb-12 animate-slide-up">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Campus Organizations,
                        <span className="block mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                            One Reliable Workspace
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                        Browse active organizations, review their focus areas, and apply to the groups that match your academic and extracurricular goals.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/organization" className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
                            Browse Organizations
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/events" className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-200">
                            Explore Events
                        </Link>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20 animate-fade-in-up">
                    <FeatureCard
                        icon={<Calendar className="w-6 h-6" />}
                        title="Event Discovery"
                        description="Find upcoming events by category, organization, and campus location."
                        color="blue"
                    />
                    <FeatureCard
                        icon={<MessageCircle className="w-6 h-6" />}
                        title="Application Updates"
                        description="Track application progress with clear status updates and notifications."
                        color="cyan"
                    />
                    <FeatureCard
                        icon={<Users className="w-6 h-6" />}
                        title="Verified Profiles"
                        description="Review organization purpose, activity records, and contact information before applying."
                        color="blue"
                    />
                </div>

                {/* Stats Section */}
                <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    <StatCard number={stats.organizations} label="Organizations" icon={<Building2 className="w-5 h-5 text-blue-500" />} />
                    <StatCard number={stats.activeOrganizations} label="Active Profiles" icon={<Users className="w-5 h-5 text-blue-500" />} />
                    <StatCard number={stats.events} label="Published Events" icon={<Calendar className="w-5 h-5 text-blue-500" />} />
                    <StatCard number={stats.campuses} label="Campus Coverage" icon={<MapPin className="w-5 h-5 text-blue-500" />} />
                </div>
            </div>

            {/* Bottom Wave Decoration */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
                </svg>
            </div>

            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                @keyframes slide-up {
                    from { 
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.8s ease-out;
                }
                @keyframes fade-in-up {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out 0.3s both;
                }
            `}</style>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, color }) => {
    const colorClasses = color === 'blue' 
        ? 'from-blue-500 to-blue-600' 
        : 'from-cyan-500 to-cyan-600';
    
    return (
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    );
};

const StatCard = ({ number, label, icon }) => {
    return (
        <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-1">
                {number}
                {icon}
            </div>
            <div className="text-gray-600 font-medium">{label}</div>
        </div>
    );
};

export default Hero;