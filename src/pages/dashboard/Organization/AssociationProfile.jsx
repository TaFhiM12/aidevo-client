import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Calendar, Target, Award, 
    Star, Clock, MapPin, Settings, ImageIcon,
    Globe, Home, Users2, Handshake
} from 'lucide-react';
import OrganizationHeader from './shared/OrganizationHeader';
import InlineEditField from './shared/InlineEditField';
import PhotoAlbum from './shared/PhotoAlbum';
import { InitiativeList, CulturalEventList, NetworkingList } from './shared/DisplayComponents';
import { updateField, updateArrayField } from '../../../utils/organizationApi';
import ArrayManager from './shared/ArrayManager';

const AssociationProfile = ({ organization }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [profileData, setProfileData] = useState(organization);
    const [savingField, setSavingField] = useState(null);

    const handleLogoUpdate = (newLogoUrl) => {
        setProfileData(prev => ({
            ...prev,
            photoURL: newLogoUrl
        }));
    };

    const handleCoverUpdate = (newCoverUrl) => {
        setProfileData(prev => ({
            ...prev,
            organization: {
                ...prev.organization,
                coverPhoto: newCoverUrl
            }
        }));
    };

    const handleFieldUpdate = async (field, value) => {
        const success = await updateField(profileData._id, field, value, setSavingField);
        if (success) {
            setProfileData(prev => ({
                ...prev,
                organization: {
                    ...prev.organization,
                    [field.replace('organization.', '')]: value
                }
            }));
        }
        return success;
    };

    const handleArrayUpdate = async (field, value) => {
        const success = await updateArrayField(profileData._id, field, value, setSavingField);
        if (success) {
            setProfileData(prev => ({
                ...prev,
                organization: {
                    ...prev.organization,
                    [field.replace('organization.', '')]: value
                }
            }));
        }
        return success;
    };

    const handlePhotosUpdate = (newPhotos) => {
        setProfileData(prev => ({
            ...prev,
            organization: {
                ...prev.organization,
                photoAlbum: newPhotos
            }
        }));
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'community', label: 'Community', icon: Users2 },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'networking', label: 'Networking', icon: Handshake },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const ActiveTabComponent = {
        overview: OverviewTab,
        community: CommunityTab,
        events: EventsTab,
        networking: NetworkingTab,
        gallery: GalleryTab,
        settings: SettingsTab
    }[activeTab];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-4 sm:py-6 lg:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <OrganizationHeader 
                    organization={profileData}
                    isEditing={isEditing}
                    onEditToggle={setIsEditing}
                    onFieldUpdate={handleFieldUpdate}
                    savingField={savingField}
                    theme="green"
                    onLogoUpdate={handleLogoUpdate}
                    onCoverUpdate={handleCoverUpdate}
                />
                
                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-1 px-3 sm:px-4 lg:px-6 overflow-x-auto snap-x snap-mandatory">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`snap-start py-3.5 sm:py-4 px-3 sm:px-4 border-b-2 font-semibold text-sm capitalize transition-all whitespace-nowrap flex items-center gap-2 min-w-max ${
                                        activeTab === id
                                            ? "border-green-500 text-green-600 bg-white"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 sm:p-6 lg:p-7">
                        {ActiveTabComponent && (
                            <ActiveTabComponent
                                organization={profileData}
                                isEditing={isEditing}
                                onFieldUpdate={handleFieldUpdate}
                                onArrayUpdate={handleArrayUpdate}
                                savingField={savingField}
                                onPhotosUpdate={handlePhotosUpdate}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tab Components for Association
const OverviewTab = ({ organization, isEditing, onFieldUpdate, savingField }) => (
    <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                    <Home className="text-green-600" size={24} />
                    <h3 className="font-bold text-gray-900 text-xl">Association Purpose</h3>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.mission || ""}
                        onSave={(value) => onFieldUpdate('organization.mission', value)}
                        placeholder="Describe your association's purpose and goals..."
                        multiline
                        loading={savingField === 'organization.mission'}
                    />
                ) : (
                    <p className="text-gray-700 leading-relaxed">
                        {organization.organization.mission || "No purpose statement provided."}
                    </p>
                )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                    <Globe className="text-blue-600" size={24} />
                    <h3 className="font-bold text-gray-900 text-xl">Regional Focus</h3>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.regionalFocus || ""}
                        onSave={(value) => onFieldUpdate('organization.regionalFocus', value)}
                        placeholder="Geographical focus area (e.g., Sylhet, Dhaka)..."
                        loading={savingField === 'organization.regionalFocus'}
                    />
                ) : (
                    <p className="text-gray-700 leading-relaxed">
                        {organization.organization.regionalFocus || "No regional focus specified."}
                    </p>
                )}
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <Users2 className="text-purple-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Member Regions</h4>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.memberRegions || ""}
                        onSave={(value) => onFieldUpdate('organization.memberRegions', value)}
                        placeholder="Regions represented by members"
                        loading={savingField === 'organization.memberRegions'}
                    />
                ) : (
                    <p className="text-gray-700">
                        {organization.organization.memberRegions || "Not specified"}
                    </p>
                )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <Handshake className="text-orange-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Networking Events</h4>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.networkingFrequency || ""}
                        onSave={(value) => onFieldUpdate('organization.networkingFrequency', value)}
                        placeholder="e.g., Monthly meetups, Quarterly gatherings"
                        loading={savingField === 'organization.networkingFrequency'}
                    />
                ) : (
                    <p className="text-gray-700">
                        {organization.organization.networkingFrequency || "Not specified"}
                    </p>
                )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <Star className="text-yellow-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Cultural Activities</h4>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.culturalActivities || ""}
                        onSave={(value) => onFieldUpdate('organization.culturalActivities', value)}
                        placeholder="Cultural events and celebrations"
                        loading={savingField === 'organization.culturalActivities'}
                    />
                ) : (
                    <p className="text-gray-700">
                        {organization.organization.culturalActivities || "Not specified"}
                    </p>
                )}
            </div>
        </div>
    </div>
);

const CommunityTab = ({ organization, isEditing, onArrayUpdate, savingField }) => (
    <div className="space-y-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-6">
                <Users className="text-green-600" size={24} />
                <h3 className="font-bold text-gray-900 text-xl">Community Initiatives</h3>
            </div>
            {isEditing ? (
                <ArrayManager
                    items={organization.organization.communityInitiatives || []}
                    onUpdate={(items) => onArrayUpdate('organization.communityInitiatives', items)}
                    placeholder="Add community initiative (e.g., Scholarship Program, Cultural Festival)"
                    title="Community Initiatives"
                    description="List your association's community development programs"
                    loading={savingField === 'organization.communityInitiatives'}
                    color="green"
                />
            ) : (
                <InitiativeList items={organization.organization.communityInitiatives} />
            )}
        </div>
    </div>
);

const EventsTab = ({ organization, isEditing, onArrayUpdate, savingField }) => (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-purple-600" size={24} />
            <h3 className="font-bold text-gray-900 text-xl">Cultural & Social Events</h3>
        </div>
        {isEditing ? (
            <ArrayManager
                items={organization.organization.culturalEvents || []}
                onUpdate={(items) => onArrayUpdate('organization.culturalEvents', items)}
                placeholder="Add cultural event (e.g., Pohela Boishakh Celebration, Eid Reunion)"
                title="Cultural Events"
                description="List your association's cultural and social gatherings"
                loading={savingField === 'organization.culturalEvents'}
                color="purple"
            />
        ) : (
            <CulturalEventList items={organization.organization.culturalEvents} />
        )}
    </div>
);

const NetworkingTab = ({ organization, isEditing, onArrayUpdate, savingField }) => (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-6">
            <Handshake className="text-blue-600" size={24} />
            <h3 className="font-bold text-gray-900 text-xl">Professional Networking</h3>
        </div>
        {isEditing ? (
            <ArrayManager
                items={organization.organization.networkingOpportunities || []}
                onUpdate={(items) => onArrayUpdate('organization.networkingOpportunities', items)}
                placeholder="Add networking opportunity (e.g., Alumni Meet, Career Workshop)"
                title="Networking Opportunities"
                description="List professional networking events and programs"
                loading={savingField === 'organization.networkingOpportunities'}
                color="blue"
            />
        ) : (
            <NetworkingList items={organization.organization.networkingOpportunities} />
        )}
    </div>
);

const GalleryTab = ({ organization, onPhotosUpdate }) => (
    <PhotoAlbum
        organizationId={organization._id}
        photos={organization.organization?.photoAlbum || []}
        onPhotosUpdate={onPhotosUpdate}
    />
);

const SettingsTab = () => (
    <div className="text-center py-12">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Association Settings</h3>
        <p className="text-gray-600">Manage your association settings and preferences</p>
    </div>
);

export default AssociationProfile;