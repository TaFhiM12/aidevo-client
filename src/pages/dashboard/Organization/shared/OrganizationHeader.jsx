import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    MapPin,
    Users,
    Calendar,
    Mail,
    Phone,
    Globe,
    Edit3,
    Save,
    X,
    Upload,
    Award,
    Shield,
    Camera,
    Loader2,
    CheckCircle,
    ExternalLink,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Link as LinkIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '../../../../utils/uploadToCloudinary';
import API from '../../../../utils/api';
import InlineEditField from './InlineEditField';
import useAuth from '../../../../hooks/useAuth';
import { useUserContext } from '../../../../context/UserContext';

const OrganizationHeader = ({ 
    organization, 
    isEditing, 
    onEditToggle, 
    onFieldUpdate, 
    savingField,
    theme = 'blue',
    onLogoUpdate,
    onCoverUpdate,
}) => {
    const { user, updateProfileUser, obtainAccessToken } = useAuth();
    const { updateGlobalUserInfo } = useUserContext();
    const [uploading, setUploading] = useState(false);
    const [uploadingType, setUploadingType] = useState(null);
    const coverFileInputRef = useRef(null);
    const logoFileInputRef = useRef(null);

    const themeColors = {
        blue: {
            gradient: 'from-blue-600 to-cyan-600',
            button: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
            text: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200'
        },
        red: {
            gradient: 'from-red-600 to-pink-600',
            button: 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
            text: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200'
        },
        green: {
            gradient: 'from-green-600 to-emerald-600',
            button: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
            text: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-200'
        }
    };

    const colors = themeColors[theme] || themeColors.blue;

    // Role types configuration
    const roleTypes = {
        "Club": [
            "Debate Club",
            "Sports Club", 
            "Robotics Club",
            "Photographic Club",
            "Cultural Club",
            "Programming Club",
            "Music Club",
            "Drama Club",
            "Art Club",
            "Literature Club"
        ],
        "Social Service": [
            "Blood Bank",
            "Unnotomomoshir",
            "Community Service",
            "Environmental Service",
            "Educational Support",
            "Disaster Relief",
            "Health Awareness",
            "Poverty Alleviation"
        ],
        "Association": [
            "Sylhet Association",
            "Dhaka Association", 
            "Khulna Association",
            "Chittagong Association",
            "Rajshahi Association",
            "Barisal Association",
            "Rangpur Association",
            "Mymensingh Association"
        ]
    };

    const handleImageUpload = async (file, type) => {
        try {
            setUploading(true);
            setUploadingType(type);
            const uploadToast = toast.loading(`Uploading ${type}...`);

            const imageUrl = await uploadToCloudinary(file);

            if (!imageUrl) {
                throw new Error(`Failed to upload ${type}`);
            }

            let updateFieldPath = "";
            let updateValue = imageUrl;

            if (type === "logo") {
                updateFieldPath = "photoURL";
            } else if (type === "cover") {
                updateFieldPath = "organization.coverPhoto";
            }

            const response = await API.patch(`/organizations/${organization._id}/field`, {
                field: updateFieldPath,
                value: updateValue,
            });

            if (response?.success) {
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`, { 
                    id: uploadToast 
                });

                if (type === "logo") {
                    try {
                        await updateProfileUser({
                            photoURL: imageUrl,
                            displayName:
                                organization?.organization?.name ||
                                organization?.name ||
                                user?.displayName ||
                                "Organization",
                        });

                        if (user) {
                            await obtainAccessToken(user, { forceRefresh: true });
                        }

                        updateGlobalUserInfo({ photoURL: imageUrl });
                    } catch (firebaseError) {
                        console.error("Failed to sync organization logo to Firebase:", firebaseError);
                        toast.error("Logo updated, but Firebase profile sync failed.");
                    }
                }
                
                if (type === "logo" && onLogoUpdate) {
                    onLogoUpdate(imageUrl);
                } else if (type === "cover" && onCoverUpdate) {
                    onCoverUpdate(imageUrl);
                }
                
                return true;
            } else {
                throw new Error(`Failed to save ${type} to database`);
            }
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
            toast.error(typeof error === "string" ? error : `Failed to upload ${type}`);
            return false;
        } finally {
            setUploading(false);
            setUploadingType(null);
        }
    };

    const handleCoverUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        await handleImageUpload(file, "cover");
        event.target.value = "";
    };

    const handleLogoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Logo size should be less than 2MB");
            return;
        }

        await handleImageUpload(file, "logo");
        event.target.value = "";
    };

    const triggerCoverInput = () => coverFileInputRef.current?.click();
    const triggerLogoInput = () => logoFileInputRef.current?.click();

    const CoverPhotoUpload = () => (
        <div className="space-y-3 p-4 bg-white rounded-xl border-2 border-blue-300 shadow-lg">
            <div className="flex items-center gap-3">
                <Camera size={20} className="text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Cover Photo
                    </label>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex-1">
                            <button
                                onClick={triggerCoverInput}
                                disabled={uploading}
                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all flex items-center gap-2 font-medium justify-center"
                            >
                                {uploading && uploadingType === 'cover' ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Upload size={18} />
                                )}
                                {uploading && uploadingType === 'cover' ? "Uploading..." : "Upload Cover Photo"}
                            </button>
                            <input
                                ref={coverFileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleCoverUpload}
                                disabled={uploading}
                            />
                        </div>
                        {organization.organization.coverPhoto && (
                            <div className="flex-shrink-0">
                                <div className="w-24 h-8 rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                                    <img
                                        src={organization.organization.coverPhoto}
                                        alt="Current cover preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-center">Current</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const LogoUpload = () => (
        <div className="space-y-3 p-4 bg-white rounded-xl border-2 border-blue-300 shadow-lg">
            <div className="flex items-center gap-3">
                <Camera size={20} className="text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Organization Logo
                    </label>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={triggerLogoInput}
                            disabled={uploading}
                            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all flex items-center gap-2 font-medium flex-1"
                        >
                            {uploading && uploadingType === 'logo' ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Upload size={18} />
                            )}
                            {uploading && uploadingType === 'logo' ? "Uploading..." : "Upload Logo"}
                        </button>
                        <input
                            ref={logoFileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploading}
                        />
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300 bg-white flex items-center justify-center">
                                {organization.photoURL ? (
                                    <img
                                        src={organization.photoURL}
                                        alt="Current logo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building2 className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100"
        >
            {/* Cover Photo Section */}
            <div className={`relative h-[320px] md:h-[380px] lg:h-[440px] bg-gradient-to-r ${colors.gradient} overflow-hidden`}>
                {organization.organization.coverPhoto && (
                    <div
                        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                        style={{ backgroundImage: `url(${organization.organization.coverPhoto})` }}
                    />
                )}

                {/* Layered overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.16),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.32),transparent_55%)]" />

                <div className="absolute inset-0 flex flex-col justify-between">
                    {/* Top Section */}
                    <div className="flex items-start justify-between p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                                <Building2 size={14} className="opacity-90" />
                                {organization.organization.type || "Organization"}
                            </span>
                            {organization.organization.roleType && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                                    <Award size={14} className="opacity-90" />
                                    {organization.organization.roleType}
                                </span>
                            )}
                        </div>

                        {organization.organization.verified && (
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-sm border border-white/20 w-fit">
                                <Shield size={14} className="sm:w-4 sm:h-4" />
                                Verified Organization
                            </div>
                        )}
                    </div>

                    {/* Main Identity */}
                    <div className="flex-1 flex items-end pb-6 sm:pb-8 lg:pb-10 px-4 sm:px-6 lg:px-8">
                        <div className="w-full max-w-5xl">
                            <div className="inline-flex max-w-full flex-col gap-4 rounded-2xl border border-white/20 bg-black/25 p-4 sm:p-6 backdrop-blur-md">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-2xl"
                            >
                                {organization.organization.name || organization.name || "Organization Name"}
                            </motion.h1>

                            {organization.organization.tagline && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-base sm:text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-3xl drop-shadow-lg"
                                >
                                    {organization.organization.tagline}
                                </motion.p>
                            )}

                            {/* Hero Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4"
                            >
                                <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 py-2.5 text-white backdrop-blur-md sm:px-4 sm:py-3">
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <Users size={16} className="sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-lg sm:text-xl font-bold leading-tight">
                                            {organization.organization.membershipCount || 0}
                                        </div>
                                        <div className="text-xs sm:text-sm font-medium text-white/90">
                                            Members
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 py-2.5 text-white backdrop-blur-md sm:px-4 sm:py-3">
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <Calendar size={16} className="sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-lg sm:text-xl font-bold leading-tight">
                                            {organization.organization.founded
                                                ? new Date(organization.organization.founded).getFullYear()
                                                : "N/A"}
                                        </div>
                                        <div className="text-xs sm:text-sm font-medium text-white/90">
                                            Established
                                        </div>
                                    </div>
                                </div>

                                {organization.organization.campus && (
                                    <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 py-2.5 text-white backdrop-blur-md sm:px-4 sm:py-3">
                                        <div className="p-1.5 bg-white/20 rounded-lg">
                                            <MapPin size={16} className="sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm sm:text-base font-bold leading-tight line-clamp-1">
                                                {organization.organization.campus}
                                            </div>
                                            <div className="text-xs sm:text-sm font-medium text-white/90">
                                                Campus
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 py-2.5 text-white backdrop-blur-md sm:px-4 sm:py-3">
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <Award size={16} className="sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm sm:text-base font-bold leading-tight line-clamp-1">
                                            {organization.organization.roleType || organization.organization.type || "Organization"}
                                        </div>
                                        <div className="text-xs sm:text-sm font-medium text-white/90">
                                            Sub-type
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Content Section */}
            <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
                    {/* Logo and Social Media */}
                    <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto">
                        {/* Logo Container */}
                        <div className="relative">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-xl sm:rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                                {organization.photoURL ? (
                                    <img
                                        src={organization.photoURL}
                                        alt="Organization Logo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                                )}
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="flex-1 lg:flex-none">
                            <div className="flex flex-col gap-2 sm:gap-3">
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-700">
                                    Follow Us
                                </h4>
                                <div className="flex gap-2 sm:gap-3">
                                    {Object.entries(organization.organization.socialMedia || {}).map(([platform, value]) => {
                                        if (!value) return null;

                                        const socialIcons = {
                                            facebook: Facebook,
                                            instagram: Instagram,
                                            twitter: Twitter,
                                            linkedin: LinkIcon,
                                            youtube: Youtube,
                                        };

                                        const Icon = socialIcons[platform];
                                        const platformColors = {
                                            facebook: "text-blue-600 hover:text-blue-700",
                                            instagram: "text-pink-600 hover:text-pink-700",
                                            twitter: "text-blue-400 hover:text-blue-500",
                                            linkedin: "text-blue-700 hover:text-blue-800",
                                            youtube: "text-red-600 hover:text-red-700",
                                        };

                                        return Icon ? (
                                            <a
                                                key={platform}
                                                href={value.includes("http") ? value : `https://${platform}.com/${value}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all ${platformColors[platform]} hover:scale-110 transform transition-transform`}
                                                title={`Follow on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                                            >
                                                <Icon size={16} className="sm:w-4 sm:h-4" />
                                            </a>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3 w-full lg:w-auto justify-end">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => onEditToggle(false)}
                                    className="flex-1 lg:flex-none px-4 py-2 sm:px-6 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base"
                                >
                                    <X size={18} className="sm:w-5 sm:h-5" />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    onClick={() => onEditToggle(false)}
                                    className="flex-1 lg:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base shadow-lg shadow-blue-500/25"
                                >
                                    <Save size={18} className="sm:w-5 sm:h-5" />
                                    <span>Save Changes</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => onEditToggle(true)}
                                className="flex-1 lg:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base shadow-lg shadow-blue-500/25"
                            >
                                <Edit3 size={18} className="sm:w-5 sm:h-5" />
                                <span>Edit Profile</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Edit Section */}
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200"
                    >
                        <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-lg sm:text-xl">
                            Quick Edit
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <InlineEditField
                                value={organization.name}
                                onSave={(value) => onFieldUpdate("name", value)}
                                className="text-base"
                                placeholder="Organization name"
                                loading={savingField === "name"}
                                label="Organization Name"
                            />

                            <InlineEditField
                                value={organization.organization.type || ""}
                                onSave={(value) => onFieldUpdate("organization.type", value)}
                                className="text-base"
                                type="select"
                                options={[
                                    "Club",
                                    "Social Service",
                                    "Association"
                                ]}
                                loading={savingField === "organization.type"}
                                label="Organization Type"
                            />

                            {/* New Role Type Field */}
                            <InlineEditField
                                value={organization.organization.roleType || ""}
                                onSave={(value) => onFieldUpdate("organization.roleType", value)}
                                className="text-base"
                                type="select"
                                options={roleTypes[organization.organization.type] || []}
                                disabled={!organization.organization.type}
                                loading={savingField === "organization.roleType"}
                                label="Organization Sub-type"
                                placeholder={organization.organization.type ? `Select ${organization.organization.type} type` : "Select organization type first"}
                            />

                            <InlineEditField
                                value={
                                    organization.organization.founded
                                        ? new Date(organization.organization.founded).toISOString().split("T")[0]
                                        : ""
                                }
                                onSave={(value) => onFieldUpdate("organization.founded", value)}
                                className="text-base"
                                type="date"
                                loading={savingField === "organization.founded"}
                                label="Founded Date"
                            />

                            <div className="md:col-span-2 lg:col-span-3">
                                <CoverPhotoUpload />
                            </div>

                            <div className="md:col-span-2 lg:col-span-3">
                                <LogoUpload />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default OrganizationHeader;