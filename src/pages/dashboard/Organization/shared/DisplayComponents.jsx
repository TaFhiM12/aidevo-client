import React from 'react';
import { Trophy, Users, Calendar, Handshake, Star, Award, Heart, Target } from 'lucide-react';

// Service List Display
export const ServiceList = ({ items = [], type = 'medical' }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No {type} services listed yet.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">{item}</span>
                </div>
            ))}
        </div>
    );
};

// Campaign List Display
export const CampaignList = ({ items = [] }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No ongoing campaigns.
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {items.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium text-gray-800">{item}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Activity List Display
export const ActivityList = ({ items = [] }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No regular activities scheduled.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">{item}</span>
                </div>
            ))}
        </div>
    );
};

// Achievement List Display
export const AchievementList = ({ items = [] }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No achievements listed yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-yellow-200">
                    <Trophy className="text-yellow-500 flex-shrink-0" size={20} />
                    <span className="text-gray-700 font-medium">{item}</span>
                </div>
            ))}
        </div>
    );
};

// Impact Display Component
export const ImpactDisplay = ({ organization }) => {
    const impactStats = organization.organization.impactStats || [];
    const bloodDonations = organization.organization.bloodDonations;
    const livesImpacted = organization.organization.livesImpacted;

    if (impactStats.length === 0 && !bloodDonations && !livesImpacted) {
        return (
            <div className="text-center py-8 text-gray-500">
                No impact statistics available.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {(bloodDonations || livesImpacted) && (
                <div className="grid md:grid-cols-2 gap-4">
                    {bloodDonations && (
                        <div className="bg-white p-6 rounded-lg border border-blue-200 text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {bloodDonations.toLocaleString()}
                            </div>
                            <div className="text-gray-600">Blood Donations</div>
                        </div>
                    )}
                    {livesImpacted && (
                        <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {livesImpacted.toLocaleString()}+
                            </div>
                            <div className="text-gray-600">Lives Impacted</div>
                        </div>
                    )}
                </div>
            )}
            
            {impactStats.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Key Statistics</h4>
                    {impactStats.map((stat, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700">{stat}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Initiative List Display for Associations
export const InitiativeList = ({ items = [] }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No community initiatives listed yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-green-200">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <Target className="text-green-600" size={20} />
                    </div>
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 mb-1">Community Initiative</h5>
                        <p className="text-gray-700">{item}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Cultural Event List Display for Associations
export const CulturalEventList = ({ items = [] }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No cultural events scheduled.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-purple-200">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <Calendar className="text-purple-600" size={20} />
                    </div>
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 mb-1">Cultural Event</h5>
                        <p className="text-gray-700">{item}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            Upcoming
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Networking List Display for Associations
export const NetworkingList = ({ items = [] }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No networking opportunities available.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-200">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Handshake className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 mb-1">Networking Opportunity</h5>
                        <p className="text-gray-700">{item}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Professional
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Event List Display for Clubs
export const EventList = ({ items = [] }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No upcoming events scheduled.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-orange-200">
                    <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                        <Calendar className="text-orange-600" size={20} />
                    </div>
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 mb-1">Upcoming Event</h5>
                        <p className="text-gray-700">{item}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            Soon
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Membership Benefits Display
export const BenefitsList = ({ items = [] }) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No membership benefits listed.
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200">
                    <Star className="text-green-500 flex-shrink-0" size={18} />
                    <span className="text-gray-700">{item}</span>
                </div>
            ))}
        </div>
    );
};

// Leadership Team Display
export const LeadershipDisplay = ({ organization }) => {
    const leadership = organization.organization.leadership || {};
    
    const positions = [
        { key: 'president', label: 'President', icon: Award },
        { key: 'vicePresident', label: 'Vice President', icon: Users },
        { key: 'secretary', label: 'Secretary', icon: Users },
        { key: 'treasurer', label: 'Treasurer', icon: Users },
        { key: 'facultyAdvisor', label: 'Faculty Advisor', icon: Users }
    ];

    const filledPositions = positions.filter(pos => leadership[pos.key]);

    if (filledPositions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No leadership team members listed.
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {filledPositions.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="text-blue-600" size={18} />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800">{leadership[key]}</div>
                        <div className="text-sm text-gray-600">{label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Stats Display Component
export const StatsDisplay = ({ organization }) => {
    const stats = [
        {
            label: 'Total Members',
            value: organization.organization.membershipCount || 0,
            icon: Users,
            color: 'blue'
        },
        {
            label: 'Active Since',
            value: organization.organization.founded 
                ? new Date(organization.organization.founded).getFullYear()
                : 'N/A',
            icon: Calendar,
            color: 'green'
        },
        {
            label: 'Events This Year',
            value: organization.organization.eventsCount || 0,
            icon: Award,
            color: 'purple'
        },
        {
            label: 'Volunteer Hours',
            value: organization.organization.volunteerHours 
                ? `${organization.organization.volunteerHours}+`
                : 'N/A',
            icon: Heart,
            color: 'red'
        }
    ];

    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-600',
        green: 'bg-green-50 border-green-200 text-green-600',
        purple: 'bg-purple-50 border-purple-200 text-purple-600',
        red: 'bg-red-50 border-red-200 text-red-600'
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className={`p-4 rounded-lg border text-center ${colorClasses[stat.color]}`}>
                    <stat.icon className="mx-auto mb-2" size={24} />
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm font-medium">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};