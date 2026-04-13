import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Heart, Users, Calendar, Target, Award, 
    Star, Clock, MapPin, Settings, ImageIcon,
    Droplets, Stethoscope, Ambulance, Shield
} from 'lucide-react';
import OrganizationHeader from './shared/OrganizationHeader';
import InlineEditField from './shared/InlineEditField';
import PhotoAlbum from './shared/PhotoAlbum';
import { updateField, updateArrayField } from '../../../utils/organizationApi';
import ArrayManager from './shared/ArrayManager';
import { CampaignList, ImpactDisplay, ServiceList } from './shared/DisplayComponents';

const SocialServiceProfile = ({ organization }) => {
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
        { id: 'overview', label: 'Overview', icon: Heart },
        { id: 'services', label: 'Services', icon: Stethoscope },
        { id: 'campaigns', label: 'Campaigns', icon: Ambulance },
        { id: 'impact', label: 'Impact', icon: Shield },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const ActiveTabComponent = {
        overview: OverviewTab,
        services: ServicesTab,
        campaigns: CampaignsTab,
        impact: ImpactTab,
        gallery: GalleryTab,
        settings: SettingsTab
    }[activeTab];

    return (
        <div className="min-h-screen py-4 sm:py-6 lg:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <OrganizationHeader 
                    organization={profileData}
                    isEditing={isEditing}
                    onEditToggle={setIsEditing}
                    onFieldUpdate={handleFieldUpdate}
                    savingField={savingField}
                    theme="red"
                    onLogoUpdate={handleLogoUpdate} // ADD THIS
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
                                            ? "border-red-500 text-red-600 bg-white"
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

// Tab Components for Social Service
const OverviewTab = ({ organization, isEditing, onFieldUpdate, savingField }) => (
    <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                    <Heart className="text-red-600" size={24} />
                    <h3 className="font-bold text-gray-900 text-xl">Our Mission</h3>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.mission || ""}
                        onSave={(value) => onFieldUpdate('organization.mission', value)}
                        placeholder="Describe your social service mission..."
                        multiline
                        loading={savingField === 'organization.mission'}
                    />
                ) : (
                    <p className="text-gray-700 leading-relaxed">
                        {organization.organization.mission || "No mission statement provided."}
                    </p>
                )}
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                    <Target className="text-orange-600" size={24} />
                    <h3 className="font-bold text-gray-900 text-xl">Service Focus</h3>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.serviceFocus || ""}
                        onSave={(value) => onFieldUpdate('organization.serviceFocus', value)}
                        placeholder="Primary service areas (e.g., Blood Donation, Medical Aid)..."
                        multiline
                        loading={savingField === 'organization.serviceFocus'}
                    />
                ) : (
                    <p className="text-gray-700 leading-relaxed">
                        {organization.organization.serviceFocus || "No focus areas specified."}
                    </p>
                )}
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <Droplets className="text-red-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Blood Bank Status</h4>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.bloodBankStatus || ""}
                        onSave={(value) => onFieldUpdate('organization.bloodBankStatus', value)}
                        placeholder="Current blood availability"
                        loading={savingField === 'organization.bloodBankStatus'}
                    />
                ) : (
                    <p className="text-gray-700">
                        {organization.organization.bloodBankStatus || "Not specified"}
                    </p>
                )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <Clock className="text-green-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Service Hours</h4>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.serviceHours || ""}
                        onSave={(value) => onFieldUpdate('organization.serviceHours', value)}
                        placeholder="e.g., 24/7, 9AM-5PM"
                        loading={savingField === 'organization.serviceHours'}
                    />
                ) : (
                    <p className="text-gray-700">
                        {organization.organization.serviceHours || "Not specified"}
                    </p>
                )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <Users className="text-blue-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Volunteer Count</h4>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.volunteerCount || ""}
                        onSave={(value) => onFieldUpdate('organization.volunteerCount', value)}
                        placeholder="Number of active volunteers"
                        type="number"
                        loading={savingField === 'organization.volunteerCount'}
                    />
                ) : (
                    <p className="text-gray-700">
                        {organization.organization.volunteerCount || "Not specified"}
                    </p>
                )}
            </div>
        </div>
    </div>
);

const ServicesTab = ({ organization, isEditing, onArrayUpdate, savingField }) => (
    <div className="space-y-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-6">
                <Stethoscope className="text-red-600" size={24} />
                <h3 className="font-bold text-gray-900 text-xl">Medical Services</h3>
            </div>
            {isEditing ? (
                <ArrayManager
                    items={organization.organization.medicalServices || []}
                    onUpdate={(items) => onArrayUpdate('organization.medicalServices', items)}
                    placeholder="Add medical service (e.g., Blood Donation, Health Checkup)"
                    title="Medical Services"
                    description="List all medical services provided by your organization"
                    loading={savingField === 'organization.medicalServices'}
                    color="red"
                />
            ) : (
                <ServiceList 
                    items={organization.organization.medicalServices} 
                    type="medical"
                />
            )}
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-6">
                <Ambulance className="text-purple-600" size={24} />
                <h3 className="font-bold text-gray-900 text-xl">Emergency Services</h3>
            </div>
            {isEditing ? (
                <ArrayManager
                    items={organization.organization.emergencyServices || []}
                    onUpdate={(items) => onArrayUpdate('organization.emergencyServices', items)}
                    placeholder="Add emergency service (e.g., 24/7 Helpline, Ambulance)"
                    title="Emergency Services"
                    description="List emergency services available"
                    loading={savingField === 'organization.emergencyServices'}
                    color="purple"
                />
            ) : (
                <ServiceList 
                    items={organization.organization.emergencyServices} 
                    type="emergency"
                />
            )}
        </div>
    </div>
);

const CampaignsTab = ({ organization, isEditing, onArrayUpdate, savingField }) => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-6">
            <Ambulance className="text-green-600" size={24} />
            <h3 className="font-bold text-gray-900 text-xl">Ongoing Campaigns</h3>
        </div>
        {isEditing ? (
            <ArrayManager
                items={organization.organization.campaigns || []}
                onUpdate={(items) => onArrayUpdate('organization.campaigns', items)}
                placeholder="Add campaign (e.g., Blood Donation Drive, Health Awareness)"
                title="Current Campaigns"
                description="List all ongoing campaigns and initiatives"
                loading={savingField === 'organization.campaigns'}
                color="green"
            />
        ) : (
            <CampaignList items={organization.organization.campaigns} />
        )}
    </div>
);

const ImpactTab = ({ organization, isEditing, onArrayUpdate, savingField }) => (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-6">
            <Shield className="text-blue-600" size={24} />
            <h3 className="font-bold text-gray-900 text-xl">Impact Statistics</h3>
        </div>
        {isEditing ? (
            <div className="space-y-6">
                <ArrayManager
                    items={organization.organization.impactStats || []}
                    onUpdate={(items) => onArrayUpdate('organization.impactStats', items)}
                    placeholder="Add impact statistic (e.g., 5000+ Lives Saved, 1000+ Blood Donations)"
                    title="Impact Statistics"
                    description="Key statistics that demonstrate your organization's impact"
                    loading={savingField === 'organization.impactStats'}
                    color="blue"
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Total Blood Donations
                        </label>
                        <input
                            type="number"
                            value={organization.organization.bloodDonations || ''}
                            onChange={(e) => onArrayUpdate('organization.bloodDonations', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="Enter total donations"
                        />
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Lives Impacted
                        </label>
                        <input
                            type="number"
                            value={organization.organization.livesImpacted || ''}
                            onChange={(e) => onArrayUpdate('organization.livesImpacted', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="Enter number of lives impacted"
                        />
                    </div>
                </div>
            </div>
        ) : (
            <ImpactDisplay organization={organization} />
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Service Settings</h3>
        <p className="text-gray-600">Manage your social service organization settings</p>
    </div>
);

export default SocialServiceProfile;