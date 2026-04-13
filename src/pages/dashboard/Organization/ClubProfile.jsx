import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Trophy, Calendar, Target, Award, 
    Star, Clock, MapPin, Settings, ImageIcon,
    Users2, CalendarDays, Mic, BookOpen
} from 'lucide-react';
import OrganizationHeader from './shared/OrganizationHeader';
import InlineEditField from './shared/InlineEditField';
import PhotoAlbum from './shared/PhotoAlbum';
import ArrayManager from './shared/ArrayManager';
import {
    ActivityList,
    AchievementList,
    EventList,
    BenefitsList,
    LeadershipDisplay,
    StatsDisplay
} from './shared/DisplayComponents';
import { updateField, updateArrayField } from '../../../utils/organizationApi';

const ClubProfile = ({ organization }) => {
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
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'activities', label: 'Activities', icon: Mic },
        { id: 'benefits', label: 'Benefits', icon: Star },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const ActiveTabComponent = {
        overview: OverviewTab,
        activities: ActivitiesTab,
        benefits: BenefitsTab,
        achievements: AchievementsTab,
        gallery: GalleryTab,
        settings: SettingsTab
    }[activeTab];

    return (
        <div className="min-h-screen  py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <OrganizationHeader 
                    organization={profileData}
                    isEditing={isEditing}
                    onEditToggle={setIsEditing}
                    onFieldUpdate={handleFieldUpdate}
                    savingField={savingField}
                    onLogoUpdate={handleLogoUpdate}
                    onCoverUpdate={handleCoverUpdate}
                />
                
                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-1 px-6 overflow-x-auto">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`py-4 px-4 border-b-2 font-semibold text-sm capitalize transition-all whitespace-nowrap flex items-center gap-2 min-w-max ${
                                        activeTab === id
                                            ? "border-blue-500 text-blue-600 bg-white"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
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

// Add this to ClubProfile.jsx
const BenefitsTab = ({ organization, isEditing, onArrayUpdate, savingField }) => (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-6">
            <Star className="text-purple-600" size={24} />
            <h3 className="font-bold text-gray-900 text-xl">Membership Benefits</h3>
        </div>
        {isEditing ? (
            <ArrayManager
                items={organization.organization.membershipBenefits || []}
                onUpdate={(items) => onArrayUpdate('organization.membershipBenefits', items)}
                placeholder="Add membership benefit (e.g., Skill Development, Networking Opportunities)"
                title="Membership Benefits"
                description="List the benefits members receive by joining your club"
                loading={savingField === 'organization.membershipBenefits'}
                color="purple"
            />
        ) : (
            <BenefitsList items={organization.organization.membershipBenefits} />
        )}
    </div>
);

// Tab Components
const OverviewTab = ({ organization, isEditing, onFieldUpdate, savingField }) => (
    <div className="space-y-6">
        {/* Statistics Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 text-xl mb-6">Club Statistics</h3>
            <StatsDisplay organization={organization} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                    <Target className="text-blue-600" size={24} />
                    <h3 className="font-bold text-gray-900 text-xl">Club Mission</h3>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.mission || ""}
                        onSave={(value) => onFieldUpdate('organization.mission', value)}
                        placeholder="Describe your club's mission and purpose..."
                        multiline
                        loading={savingField === 'organization.mission'}
                    />
                ) : (
                    <p className="text-gray-700 leading-relaxed">
                        {organization.organization.mission || "No mission statement provided."}
                    </p>
                )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                    <Star className="text-purple-600" size={24} />
                    <h3 className="font-bold text-gray-900 text-xl">Club Focus</h3>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.focus || ""}
                        onSave={(value) => onFieldUpdate('organization.focus', value)}
                        placeholder="Main focus areas of the club..."
                        multiline
                        loading={savingField === 'organization.focus'}
                    />
                ) : (
                    <p className="text-gray-700 leading-relaxed">
                        {organization.organization.focus || "No focus areas specified."}
                    </p>
                )}
            </div>
        </div>

        {/* Leadership Team Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
            <div className="flex items-center gap-3 mb-6">
                <Users className="text-indigo-600" size={24} />
                <h3 className="font-bold text-gray-900 text-xl">Leadership Team</h3>
            </div>
            {isEditing ? (
                <div className="space-y-4">
                    {['president', 'vicePresident', 'secretary', 'treasurer', 'facultyAdvisor'].map((position) => (
                        <div key={position}>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                {position.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </label>
                            <input
                                type="text"
                                value={organization.organization.leadership?.[position] || ''}
                                onChange={(e) => onFieldUpdate(`organization.leadership.${position}`, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                placeholder={`Enter ${position.replace(/([A-Z])/g, ' $1').toLowerCase()} name`}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <LeadershipDisplay organization={organization} />
            )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <Clock className="text-green-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Meeting Schedule</h4>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.meetingSchedule || ""}
                        onSave={(value) => onFieldUpdate('organization.meetingSchedule', value)}
                        placeholder="e.g., Every Wednesday, 6:00 PM"
                        loading={savingField === 'organization.meetingSchedule'}
                    />
                ) : (
                    <p className="text-gray-700">
                        {organization.organization.meetingSchedule || "Not scheduled"}
                    </p>
                )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <MapPin className="text-red-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Meeting Venue</h4>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.meetingRoom || ""}
                        onSave={(value) => onFieldUpdate('organization.meetingRoom', value)}
                        placeholder="e.g., Room 301, Academic Building"
                        loading={savingField === 'organization.meetingRoom'}
                    />
                ) : (
                    <p className="text-gray-700">
                        {organization.organization.meetingRoom || "Not specified"}
                    </p>
                )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <Users2 className="text-orange-600" size={20} />
                    <h4 className="font-semibold text-gray-900">Membership Fee</h4>
                </div>
                {isEditing ? (
                    <InlineEditField
                        value={organization.organization.membershipFee || ""}
                        onSave={(value) => onFieldUpdate('organization.membershipFee', value)}
                        placeholder="e.g., Free, $20/semester"
                        loading={savingField === 'organization.membershipFee'}
                    />
                ) : (
                    <p className="text-gray-700">
                        {organization.organization.membershipFee || "Not specified"}
                    </p>
                )}
            </div>
        </div>
    </div>
);

// In ClubProfile.jsx - ActivitiesTab
const ActivitiesTab = ({
  organization,
  isEditing,
  onArrayUpdate,
  savingField,
}) => (
  <div className="space-y-6">
    {/* Regular Activities Section */}
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
      <div className="flex items-center gap-3 mb-6">
        <Mic className="text-green-600" size={24} />
        <h3 className="font-bold text-gray-900 text-xl">Regular Activities</h3>
      </div>
      {isEditing ? (
        <ArrayManager
          items={organization.organization.regularActivities || []}
          onUpdate={(items) =>
            onArrayUpdate("organization.regularActivities", items)
          }
          placeholder="Add regular activity..."
          title="Regular Activities"
          loading={savingField === "organization.regularActivities"}
          color="green"
        />
      ) : (
        <ActivityList items={organization.organization.regularActivities} />
      )}
    </div>

    {/* Upcoming Events Section - USING EventList HERE */}
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="text-orange-600" size={24} />
        <h3 className="font-bold text-gray-900 text-xl">Upcoming Events</h3>
      </div>
      {isEditing ? (
        <ArrayManager
          items={organization.organization.upcomingEvents || []}
          onUpdate={(items) =>
            onArrayUpdate("organization.upcomingEvents", items)
          }
          placeholder="Add upcoming event..."
          title="Upcoming Events"
          loading={savingField === "organization.upcomingEvents"}
          color="orange"
        />
      ) : (
        <EventList items={organization.organization.upcomingEvents} />
      )}
    </div>
  </div>
);

const AchievementsTab = ({
  organization,
  isEditing,
  onArrayUpdate,
  savingField,
}) => (
  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200">
    <div className="flex items-center gap-3 mb-6">
      <Trophy className="text-yellow-600" size={24} />
      <h3 className="font-bold text-gray-900 text-xl">Club Achievements</h3>
    </div>
    {isEditing ? (
      <ArrayManager
        items={organization.organization.achievements || []}
        onUpdate={(items) => onArrayUpdate("organization.achievements", items)}
        placeholder="Add achievement (e.g., Won National Debate Championship 2024)"
        title="Achievements & Awards"
        description="List your club's notable achievements and awards"
        loading={savingField === "organization.achievements"}
        color="yellow"
      />
    ) : (
      <AchievementList items={organization.organization.achievements} />
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
    <h3 className="text-2xl font-bold text-gray-900 mb-2">Club Settings</h3>
    <p className="text-gray-600">Manage your club settings and preferences</p>
  </div>
);

export default ClubProfile;
