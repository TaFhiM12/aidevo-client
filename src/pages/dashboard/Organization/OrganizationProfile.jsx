import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Target,
  Clock,
  Star,
  Facebook,
  Instagram,
  Twitter,
  FileText,
  UserPlus,
  Image as ImageIcon,
  Camera,
  Eye,
  Youtube,
  Shield,
  Link as LinkIcon,
  UserCheck,
  Settings,
  Trash2,
  Plus,
  ExternalLink,
  Loader2,
  CheckCircle,
  XCircle,
  Heart,
  Users2,
  CalendarDays,
  ImagePlus,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import useAuth from "../../../hooks/useAuth";
import { useUserContext } from "../../../context/UserContext";
import API from "../../../utils/api";

// Enhanced Inline Edit Field Component (unchanged)
const InlineEditField = ({
  value,
  onSave,
  className = "",
  placeholder = "Click to edit...",
  multiline = false,
  type = "text",
  options = [],
  loading = false,
  icon: Icon,
  label,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");

  useEffect(() => {
    setTempValue(value || "");
  }, [value]);

  const handleSave = async () => {
    if (tempValue.trim() !== (value || "").trim()) {
      const success = await onSave(tempValue.trim());
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </label>
      )}

      {isEditing ? (
        <div className="space-y-3 p-4 bg-white rounded-xl border-2 border-blue-300 shadow-lg">
          <div className="flex items-start gap-3">
            {Icon && (
              <Icon size={20} className="text-blue-500 mt-2 flex-shrink-0" />
            )}
            <div className="flex-1">
              {type === "select" ? (
                <select
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all"
                  autoFocus
                >
                  <option value="">Select an option</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : type === "date" ? (
                <input
                  type="date"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all"
                  autoFocus
                />
              ) : multiline ? (
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`${className} w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none resize-vertical transition-all`}
                  placeholder={placeholder}
                  rows={4}
                  autoFocus
                />
              ) : (
                <input
                  type={type}
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`${className} w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none transition-all`}
                  placeholder={placeholder}
                  autoFocus
                />
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-all flex items-center gap-2 rounded-lg hover:bg-gray-100"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${className} group cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-xl transition-all p-4 border-2 border-transparent hover:border-blue-200 ${
            !value ? "text-gray-400 italic" : "text-gray-900"
          }`}
          onClick={() => setIsEditing(true)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {Icon && (
                <Icon
                  size={20}
                  className="text-blue-500 mt-0.5 flex-shrink-0"
                />
              )}
              <span className="text-base leading-relaxed">
                {value || placeholder}
              </span>
            </div>
            <Edit3
              size={18}
              className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-blue-500 mt-0.5"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Organization Profile Component
const OrganizationProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingField, setSavingField] = useState(null);
  const { user } = useAuth();
  const { updateGlobalUserInfo } = useUserContext(); // Add this

  const [profileData, setProfileData] = useState({
    _id: "",
    uid: "",
    email: "",
    name: "",
    role: "organization",
    photoURL: "",
    createdAt: "",
    organization: {
      type: "",
      tagline: "",
      founded: "",
      website: "",
      phone: "",
      campus: "",
      mission: "",
      vision: "",
      meetingSchedule: "",
      meetingRoom: "",
      membershipCount: 0,
      status: "active",
      verified: false,
      coverPhoto: "",
      socialMedia: {
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        youtube: "",
      },
      leadership: {
        president: "",
        vicePresident: "",
        secretary: "",
        treasurer: "",
        facultyAdvisor: "",
      },
      achievements: [],
      upcomingEvents: [],
      membershipBenefits: [],
      contactInfo: {
        email: "",
        phone: "",
        website: "",
        address: "",
        officeHours: "",
      },
      additionalInfo: {
        membershipFee: "",
        applicationProcess: "",
        meetingFrequency: "",
        focusAreas: [],
      },
    },
  });

  // Refs for file inputs
  const coverFileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);

  // Fetch organization data
  useEffect(() => {
    if (user) {
      fetchOrganizationData();
    }
  }, [user]);

  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/users/uid/${user.uid}`);

      if (response.success) {
        const orgData = response.user;
        setProfileData(orgData);
      } else {
        throw new Error(response.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
      toast.error("Failed to load organization profile");
    } finally {
      setLoading(false);
    }
  };

  // Update individual field - MODIFIED VERSION
  const updateField = async (field, value) => {
    try {
      setSavingField(field);

      const response = await API.patch(`/organizations/${profileData._id}/field`, {
        field,
        value,
      });

      if (response.success) {
        const updatedData = response.organization;
        setProfileData(updatedData);
        
        // Update global user info for immediate UI updates
        if (field === 'name') {
          updateGlobalUserInfo({ name: value });
        } else if (field === 'photoURL') {
          updateGlobalUserInfo({ photoURL: value });
        } else if (field === 'organization.name') {
          updateGlobalUserInfo({ name: value });
        }

        toast.success("Updated successfully!");
        return true;
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating field:", error);
      toast.error("Failed to update field");
      return false;
    } finally {
      setSavingField(null);
    }
  };

  // Update array field
  const updateArrayField = async (field, value) => {
    try {
      setSavingField(field);

      const response = await API.patch(`/organizations/${profileData._id}/field`, {
        field,
        value,
      });

      if (response.success) {
        setProfileData(response.organization);
        return true;
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating array field:", error);
      toast.error("Failed to update");
      return false;
    } finally {
      setSavingField(null);
    }
  };

  // Fixed image upload function - MODIFIED VERSION
  const handleImageUpload = async (file, type) => {
    try {
      setUploading(true);
      const uploadToast = toast.loading(`Uploading ${type}...`);

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      if (!imageUrl) {
        throw new Error(`Failed to upload ${type} to Cloudinary`);
      }

      let updateFieldPath = "";
      let updateValue = imageUrl;

      if (type === "logo") {
        updateFieldPath = "photoURL";
        // Immediately update global user info for instant UI update
        updateGlobalUserInfo({ photoURL: imageUrl });
      } else if (type === "cover") {
        updateFieldPath = "organization.coverPhoto";
      }

      // Update in database
      const response = await API.patch(`/organizations/${profileData._id}/field`, {
        field: updateFieldPath,
        value: updateValue,
      });

      if (response.success) {
        // Update local state
        setProfileData((prev) => {
          if (type === "logo") {
            return { ...prev, photoURL: imageUrl };
          } else {
            return {
              ...prev,
              organization: {
                ...prev.organization,
                coverPhoto: imageUrl,
              },
            };
          }
        });

        toast.success(
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } uploaded successfully!`,
          { id: uploadToast }
        );
        return true;
      } else {
        throw new Error(`Failed to save ${type} to database`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Fixed cover photo upload handler
  const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    await handleImageUpload(file, "cover");

    // Reset the input
    event.target.value = "";
  };

  // Fixed logo upload handler
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 2MB for logo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo size should be less than 2MB");
      return;
    }

    await handleImageUpload(file, "logo");

    // Reset the input
    event.target.value = "";
  };

  // Trigger file input functions
  const triggerCoverInput = () => {
    if (coverFileInputRef.current) {
      coverFileInputRef.current.click();
    }
  };

  const triggerLogoInput = () => {
    if (logoFileInputRef.current) {
      logoFileInputRef.current.click();
    }
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      const saveToast = toast.loading("Saving all changes...");

      const response = await API.put(`/organizations/${profileData._id}/profile`, profileData);

      if (response.success) {
        const updatedData = response.organization;
        setProfileData(updatedData);
        
        // Update global user info with latest data
        updateGlobalUserInfo({
          name: updatedData.name,
          photoURL: updatedData.photoURL
        });

        toast.success("Profile updated successfully!", { id: saveToast });
        setIsEditing(false);
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchOrganizationData();
    toast.success("Changes discarded");
  };

  // Cover Photo Upload Component for Quick Edit
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
                {uploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
                {uploading ? "Uploading..." : "Upload Cover Photo"}
              </button>
              <input
                ref={coverFileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploading}
              />
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 font-medium">
                  Recommended Specifications:
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Aspect Ratio: 3:1 (Mobile) / 4:1 (Tablet) / 5:1 (Desktop)</p>
                  <p>• Minimum Resolution: 1200×400 pixels</p>
                  <p>• Optimal Resolution: 1920×600 pixels</p>
                  <p>• File Format: JPG, PNG, or WebP</p>
                  <p>• Max File Size: 5MB</p>
                </div>
              </div>
            </div>
            {profileData.organization.coverPhoto && (
              <div className="flex-shrink-0">
                <div className="w-24 h-8 rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                  <img
                    src={profileData.organization.coverPhoto}
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

  // Logo Upload Component for Quick Edit
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
              {uploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Upload size={18} />
              )}
              {uploading ? "Uploading..." : "Upload Logo"}
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
                {profileData.photoURL ? (
                  <img
                    src={profileData.photoURL}
                    alt="Current logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Recommended: 400x400px, max 2MB
          </p>
        </div>
      </div>
    </div>
  );

  // Organization Header Component
  const OrganizationHeader = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100"
      >
        {/* Cover Photo Section - Perfect Aspect Ratio */}
        <div className="relative aspect-[3/1] md:aspect-[4/1] lg:aspect-[5/1] bg-gradient-to-r from-blue-600 to-cyan-600 overflow-hidden">
          {/* Cover Image with perfect fit */}
          {profileData.organization.coverPhoto ? (
            <div className="absolute inset-0">
              <img
                src={profileData.organization.coverPhoto}
                alt="Organization Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to gradient if image fails to load
                  e.target.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-cyan-600" />
          )}

          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

          {/* Main Content Overlay */}
          <div className="absolute inset-0 flex flex-col">
            {/* Top Bar with Verified Badge */}
            <div className="flex-0 flex justify-between items-start p-4 sm:p-6 lg:p-8">
              {/* Verified Badge */}
              {profileData.organization.verified && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-sm border border-white/20">
                  <Shield size={14} className="sm:w-4 sm:h-4" />
                  Verified Organization
                </div>
              )}
            </div>

            {/* Center Content - Organization Identity */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
              <div className="text-center w-full max-w-6xl">
                {/* Organization Name - Using organization.name */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight tracking-tight drop-shadow-2xl"
                >
                  {profileData.name || "Organization Name"}
                </motion.h1>

                {/* Tagline */}
                {profileData.organization.tagline && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-3xl sm:max-w-4xl mx-auto mb-4 sm:mb-6 drop-shadow-lg px-2"
                  >
                    {profileData.organization.tagline}
                  </motion.p>
                )}

                {/* Stats Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 px-2"
                >
                  {/* Members Count */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-white/30">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                      <Users2 size={16} className="sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold">
                        {profileData.organization.membershipCount || 0}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-white/90">
                        Members
                      </div>
                    </div>
                  </div>

                  {/* Founded Year */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-white/30">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                      <CalendarDays
                        size={16}
                        className="sm:w-5 sm:h-5 text-white"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold">
                        {profileData.organization.founded
                          ? new Date(
                              profileData.organization.founded
                            ).getFullYear()
                          : "N/A"}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-white/90">
                        Established
                      </div>
                    </div>
                  </div>

                  {/* Campus */}
                  {profileData.organization.campus && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-white/30">
                      <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                        <MapPin
                          size={16}
                          className="sm:w-5 sm:h-5 text-white"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-sm sm:text-base md:text-lg font-bold">
                          {profileData.organization.campus}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-white/90">
                          Campus
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Organization Type */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-white/30">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                      <Building2
                        size={16}
                        className="sm:w-5 sm:h-5 text-white"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-sm sm:text-base md:text-lg font-bold">
                        {profileData.organization.type || "Organization"}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-white/90">
                        Type
                      </div>
                    </div>
                  </div>
                </motion.div>
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
                  {profileData.photoURL ? (
                    <img
                      src={profileData.photoURL}
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
                    {Object.entries(
                      profileData.organization.socialMedia || {}
                    ).map(([platform, value]) => {
                      if (!value) return null;

                      const socialIcons = {
                        facebook: Facebook,
                        instagram: Instagram,
                        twitter: Twitter,
                        linkedin: LinkIcon,
                        youtube: Youtube,
                      };

                      const Icon = socialIcons[platform];
                      const colors = {
                        facebook: "text-blue-600 hover:text-blue-700",
                        instagram: "text-pink-600 hover:text-pink-700",
                        twitter: "text-blue-400 hover:text-blue-500",
                        linkedin: "text-blue-700 hover:text-blue-800",
                        youtube: "text-red-600 hover:text-red-700",
                      };

                      return Icon ? (
                        <a
                          key={platform}
                          href={
                            value.includes("http")
                              ? value
                              : `https://${platform}.com/${value}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all ${colors[platform]} hover:scale-110 transform transition-transform`}
                          title={`Follow on ${
                            platform.charAt(0).toUpperCase() + platform.slice(1)
                          }`}
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
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 lg:flex-none px-4 py-2 sm:px-6 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base"
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={loading}
                    className="flex-1 lg:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base shadow-lg shadow-blue-500/25"
                  >
                    {loading ? (
                      <Loader2
                        size={18}
                        className="sm:w-5 sm:h-5 animate-spin"
                      />
                    ) : (
                      <Save size={18} className="sm:w-5 sm:h-5" />
                    )}
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 lg:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base shadow-lg shadow-blue-500/25"
                >
                  <Edit3 size={18} className="sm:w-5 sm:h-5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Edit Section - Only show when editing */}
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
                {/* Organization Name - Now using organization.name */}
                <InlineEditField
                  value={profileData.name}
                  onSave={(value) => updateField("name", value)}
                  className="text-base"
                  placeholder="Organization name"
                  loading={savingField === "name"}
                  label="Organization Name"
                />

                <InlineEditField
                  value={profileData.organization.type || ""}
                  onSave={(value) => updateField("organization.type", value)}
                  className="text-base"
                  type="select"
                  options={[
                    "Academic Club",
                    "Sports Club",
                    "Cultural Club",
                    "NGO",
                    "Department",
                    "Community",
                    "Society",
                    "Association",
                    "Team",
                    "Volunteer Group",
                    "Professional Association",
                    "Student Union",
                    "Research Group",
                  ]}
                  loading={savingField === "organization.type"}
                  label="Organization Type"
                />

                <InlineEditField
                  value={
                    profileData.organization.founded
                      ? new Date(profileData.organization.founded)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onSave={(value) => updateField("organization.founded", value)}
                  className="text-base"
                  type="date"
                  loading={savingField === "organization.founded"}
                  label="Founded Date"
                />

                {/* Cover Photo Upload in Quick Edit */}
                <div className="md:col-span-2 lg:col-span-3">
                  <CoverPhotoUpload />
                </div>

                {/* Logo Upload in Quick Edit */}
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

  // Contact Field Component
  const ContactField = ({
    label,
    value,
    field,
    isLink = false,
    disabled = false,
    type = "text",
    icon: Icon,
  }) => (
    <div className="group">
      <label className="text-sm font-semibold text-gray-700 block mb-3">
        {label}
      </label>
      {disabled ? (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          {Icon && <Icon size={20} className="text-gray-400" />}
          <p className="text-base text-gray-700">{value || "Not provided"}</p>
        </div>
      ) : isLink && value ? (
        <a
          href={value.includes("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all group"
        >
          <Globe size={20} />
          <span className="font-medium">Visit Website</span>
          <ExternalLink
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </a>
      ) : (
        <InlineEditField
          value={value || ""}
          onSave={(newValue) => updateField(field, newValue)}
          className="text-base text-gray-700"
          placeholder={`Add ${label.toLowerCase()}`}
          type={type}
          loading={savingField === field}
          icon={Icon}
        />
      )}
    </div>
  );

  // Social Media Field Component
  const SocialMediaField = ({
    platform,
    value,
    icon: Icon,
    color,
    baseUrl,
  }) => (
    <div className="flex items-center gap-4 group p-3 hover:bg-gray-50 rounded-xl transition-all">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={20} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <InlineEditField
          value={value || ""}
          onSave={(newValue) =>
            updateField(`organization.socialMedia.${platform}`, newValue)
          }
          className="text-base"
          placeholder={`${platform} username or URL`}
          loading={savingField === `organization.socialMedia.${platform}`}
        />
      </div>
      {value && (
        <a
          href={value.includes("http") ? value : `${baseUrl}${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-400 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100"
        >
          <ExternalLink size={18} />
        </a>
      )}
    </div>
  );

  // Contact Sidebar Component
  const ContactSidebar = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
    >
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-xl">
        <Mail size={24} className="text-blue-500" />
        <span>Contact Information</span>
      </h3>

      <div className="space-y-6">
        <ContactField
          label="Email"
          value={profileData.email}
          field="email"
          disabled={true}
          type="email"
          icon={Mail}
        />
        <ContactField
          label="Phone"
          value={profileData.organization.phone}
          field="organization.phone"
          type="tel"
          icon={Phone}
        />
        <ContactField
          label="Website"
          value={profileData.organization.website}
          field="organization.website"
          isLink={true}
          icon={Globe}
        />
        <ContactField
          label="Office Hours"
          value={profileData.organization.contactInfo?.officeHours}
          field="organization.contactInfo.officeHours"
          icon={Clock}
        />
        <ContactField
          label="Address"
          value={profileData.organization.contactInfo?.address}
          field="organization.contactInfo.address"
          icon={MapPin}
        />
      </div>

      <div className="mt-8">
        <label className="text-sm font-semibold text-gray-700 mb-4 block">
          Social Media
        </label>
        <div className="space-y-4">
          {[
            {
              platform: "facebook",
              icon: Facebook,
              color: "text-blue-600",
              baseUrl: "https://facebook.com/",
            },
            {
              platform: "instagram",
              icon: Instagram,
              color: "text-pink-600",
              baseUrl: "https://instagram.com/",
            },
            {
              platform: "twitter",
              icon: Twitter,
              color: "text-blue-400",
              baseUrl: "https://twitter.com/",
            },
            {
              platform: "linkedin",
              icon: LinkIcon,
              color: "text-blue-700",
              baseUrl: "https://linkedin.com/in/",
            },
            {
              platform: "youtube",
              icon: Youtube,
              color: "text-red-600",
              baseUrl: "https://youtube.com/",
            },
          ].map(({ platform, icon, color, baseUrl }) => (
            <SocialMediaField
              key={platform}
              platform={platform}
              value={profileData.organization.socialMedia?.[platform] || ""}
              icon={icon}
              color={color}
              baseUrl={baseUrl}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Stats Sidebar Component
  const StatsSidebar = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
    >
      <h3 className="font-bold text-gray-900 mb-6 text-xl">
        Organization Stats
      </h3>
      <div className="space-y-4">
        <StatItem
          label="Total Members"
          value={profileData.organization.membershipCount}
          icon={Users}
          color="text-blue-500"
        />
        <StatItem
          label="Active Since"
          value={
            profileData.organization.founded
              ? new Date(profileData.organization.founded).getFullYear()
              : "N/A"
          }
          icon={Calendar}
          color="text-green-500"
        />
        <StatItem
          label="Organization Type"
          value={profileData.organization.type}
          icon={Building2}
          color="text-purple-500"
        />
        <StatItem
          label="Campus"
          value={profileData.organization.campus || "Not set"}
          icon={MapPin}
          color="text-red-500"
        />
        <StatItem
          label="Status"
          value={profileData.organization.status}
          icon={Shield}
          color="text-orange-500"
        />
        <StatItem
          label="Verification"
          value={profileData.organization.verified ? "Verified" : "Pending"}
          icon={UserCheck}
          color={
            profileData.organization.verified
              ? "text-green-500"
              : "text-yellow-500"
          }
        />
      </div>
    </motion.div>
  );

  const StatItem = ({ label, value, icon: Icon, color }) => (
    <div className="flex items-center justify-between py-4 px-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={20} className={color} />}
        <span className="text-base font-medium text-gray-700">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );

  // Array Management Component
  const ArrayManagement = ({
    items,
    onUpdate,
    placeholder,
    icon: Icon,
    color = "blue",
    title,
  }) => {
    const [localItems, setLocalItems] = useState(items || []);

    useEffect(() => {
      setLocalItems(items || []);
    }, [items]);

    const handleAdd = () => {
      const newItems = [...localItems, ""];
      setLocalItems(newItems);
    };

    const handleEdit = (index, value) => {
      const newItems = localItems.map((item, i) =>
        i === index ? value : item
      );
      setLocalItems(newItems);
    };

    const handleRemove = (index) => {
      const newItems = localItems.filter((_, i) => i !== index);
      setLocalItems(newItems);
    };

    const handleSave = async () => {
      const filteredItems = localItems.filter((item) => item.trim() !== "");
      const success = await onUpdate(filteredItems);
      if (success) {
        setLocalItems(filteredItems);
      }
    };

    const colorClasses = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        button:
          "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        button:
          "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
      },
      yellow: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        button:
          "from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        button:
          "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
      },
    };

    const currentColor = colorClasses[color] || colorClasses.blue;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900 text-xl">{title}</h4>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 font-medium"
            >
              <Plus size={18} />
              Add New
            </button>
            <button
              onClick={handleSave}
              disabled={savingField === title}
              className={`px-4 py-2 bg-gradient-to-r ${currentColor.button} text-white rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 font-medium`}
            >
              {savingField === title ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {localItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 ${currentColor.bg} rounded-xl border ${currentColor.border} group transition-all`}
            >
              <div className={`p-3 rounded-xl ${currentColor.iconBg}`}>
                <Icon size={20} className={currentColor.iconColor} />
              </div>
              <input
                type="text"
                value={item}
                onChange={(e) => handleEdit(index, e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none bg-white transition-all"
                placeholder={placeholder}
              />
              <button
                onClick={() => handleRemove(index)}
                className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {localItems.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Icon size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No {title.toLowerCase()} added yet.
              </p>
              <button
                onClick={handleAdd}
                className="mt-4 px-4 py-2 text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Add your first item
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="text-blue-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-2xl">Our Mission</h3>
          </div>
          {isEditing ? (
            <InlineEditField
              value={profileData.organization.mission || ""}
              onSave={(value) => updateField("organization.mission", value)}
              className="text-gray-700 leading-relaxed text-lg"
              placeholder="Describe your organization's mission and purpose..."
              multiline
              loading={savingField === "organization.mission"}
              icon={Target}
            />
          ) : (
            <p className="text-gray-700 leading-relaxed text-lg">
              {profileData.organization.mission ||
                "No mission statement provided. Click to add your organization mission."}
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Award className="text-green-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-2xl">Our Vision</h3>
          </div>
          {isEditing ? (
            <InlineEditField
              value={profileData.organization.vision || ""}
              onSave={(value) => updateField("organization.vision", value)}
              className="text-gray-700 leading-relaxed text-lg"
              placeholder="Describe your organization's vision for the future..."
              multiline
              loading={savingField === "organization.vision"}
              icon={Award}
            />
          ) : (
            <p className="text-gray-700 leading-relaxed text-lg">
              {profileData.organization.vision ||
                "No vision statement provided. Click to add your organization vision."}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Clock className="text-purple-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-2xl">
              Meeting Schedule
            </h3>
          </div>
          {isEditing ? (
            <InlineEditField
              value={profileData.organization.meetingSchedule || ""}
              onSave={(value) =>
                updateField("organization.meetingSchedule", value)
              }
              className="text-gray-700 text-xl font-medium"
              placeholder="e.g., Every Wednesday, 6:00 PM"
              loading={savingField === "organization.meetingSchedule"}
              icon={Clock}
            />
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-700 text-xl font-medium">
                {profileData.organization.meetingSchedule || "No schedule set"}
              </p>
              {profileData.organization.meetingRoom && (
                <span className="text-base text-gray-600 bg-gray-100 px-4 py-2 rounded-xl font-medium">
                  {profileData.organization.meetingRoom}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="text-orange-600" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-2xl">
                Upcoming Events
              </h3>
            </div>
            <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold">
              {profileData.organization.upcomingEvents?.length || 0} events
            </span>
          </div>
          {isEditing ? (
            <ArrayManagement
              items={profileData.organization.upcomingEvents || []}
              onUpdate={(items) =>
                updateArrayField("organization.upcomingEvents", items)
              }
              placeholder="Add event description..."
              icon={Calendar}
              color="orange"
              title="Upcoming Events"
            />
          ) : (
            <div className="space-y-4">
              {profileData.organization.upcomingEvents?.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200"
                >
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 text-lg">{event}</span>
                </div>
              ))}
              {(!profileData.organization.upcomingEvents ||
                profileData.organization.upcomingEvents.length === 0) && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No upcoming events scheduled.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // About Tab Component
  const AboutTab = () => (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Organization Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Organization Type
            </label>
            {isEditing ? (
              <InlineEditField
                value={profileData.organization.type || ""}
                onSave={(value) => updateField("organization.type", value)}
                className="text-gray-900 text-lg"
                type="select"
                options={[
                  "Academic Club",
                  "Sports Club",
                  "Cultural Club",
                  "NGO",
                  "Department",
                  "Community",
                  "Society",
                  "Association",
                  "Team",
                  "Volunteer Group",
                  "Professional Association",
                  "Student Union",
                  "Research Group",
                ]}
                loading={savingField === "organization.type"}
                icon={Building2}
              />
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Building2 size={20} className="text-blue-500" />
                <p className="text-gray-900 text-lg font-medium">
                  {profileData.organization.type || "Not set"}
                </p>
              </div>
            )}
          </div>

          {/* Founded Date */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Founded Date
            </label>
            {isEditing ? (
              <InlineEditField
                value={
                  profileData.organization.founded
                    ? new Date(profileData.organization.founded)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onSave={(value) => updateField("organization.founded", value)}
                className="text-gray-900 text-lg"
                type="date"
                loading={savingField === "organization.founded"}
                icon={Calendar}
              />
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar size={20} className="text-green-500" />
                <p className="text-gray-900 text-lg font-medium">
                  {profileData.organization.founded
                    ? new Date(
                        profileData.organization.founded
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not set"}
                </p>
              </div>
            )}
          </div>

          {/* Campus */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Campus
            </label>
            {isEditing ? (
              <InlineEditField
                value={profileData.organization.campus}
                onSave={(value) => updateField("organization.campus", value)}
                className="text-gray-900 text-lg"
                type="select"
                options={[
                  "Main Campus",
                  "North Campus",
                  "South Campus",
                  "City Campus",
                  "Online",
                  "Multiple Campuses",
                ]}
                loading={savingField === "organization.campus"}
                icon={MapPin}
              />
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <MapPin size={20} className="text-red-500" />
                <p className="text-gray-900 text-lg font-medium">
                  {profileData.organization.campus || "Not set"}
                </p>
              </div>
            )}
          </div>

          {/* Membership Fee */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Membership Fee
            </label>
            {isEditing ? (
              <InlineEditField
                value={
                  profileData.organization.additionalInfo?.membershipFee || ""
                }
                onSave={(value) =>
                  updateField(
                    "organization.additionalInfo.membershipFee",
                    value
                  )
                }
                className="text-gray-900 text-lg"
                placeholder="e.g., $20 per semester, Free for students"
                loading={
                  savingField === "organization.additionalInfo.membershipFee"
                }
                icon={Users}
              />
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Users size={20} className="text-purple-500" />
                <p className="text-gray-900 text-lg font-medium">
                  {profileData.organization.additionalInfo?.membershipFee ||
                    "Not set"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold text-gray-900 text-xl mb-6">
            Leadership Team
          </h4>
          {[
            "president",
            "vicePresident",
            "secretary",
            "treasurer",
            "facultyAdvisor",
          ].map((position) => (
            <div key={position}>
              <label className="text-sm font-semibold text-gray-700 block mb-3">
                {position
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              {isEditing ? (
                <InlineEditField
                  value={profileData.organization.leadership?.[position] || ""}
                  onSave={(value) =>
                    updateField(`organization.leadership.${position}`, value)
                  }
                  className="text-gray-900 text-lg"
                  placeholder={`Enter ${position
                    .replace(/([A-Z])/g, " $1")
                    .toLowerCase()} name`}
                  loading={
                    savingField === `organization.leadership.${position}`
                  }
                  icon={UserCheck}
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <UserCheck size={20} className="text-blue-500" />
                  <p className="text-gray-900 text-lg font-medium">
                    {profileData.organization.leadership?.[position] ||
                      "Position vacant"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 border border-yellow-200">
        {isEditing ? (
          <ArrayManagement
            items={profileData.organization.achievements || []}
            onUpdate={(items) =>
              updateArrayField("organization.achievements", items)
            }
            placeholder="Add achievement description..."
            icon={Award}
            color="yellow"
            title="Achievements & Awards"
          />
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Award className="text-yellow-600" size={28} />
              </div>
              <h4 className="font-bold text-gray-900 text-2xl">
                Achievements & Awards
              </h4>
            </div>
            <div className="space-y-4">
              {profileData.organization.achievements?.map(
                (achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-6 bg-white rounded-xl border border-yellow-200 shadow-sm"
                  >
                    <Award className="text-yellow-500" size={24} />
                    <span className="text-gray-700 text-lg">{achievement}</span>
                  </div>
                )
              )}
              {(!profileData.organization.achievements ||
                profileData.organization.achievements.length === 0) && (
                <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-yellow-300">
                  <Award size={48} className="text-yellow-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No achievements added yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
        {isEditing ? (
          <ArrayManagement
            items={profileData.organization.membershipBenefits || []}
            onUpdate={(items) =>
              updateArrayField("organization.membershipBenefits", items)
            }
            placeholder="Add benefit description..."
            icon={Star}
            color="green"
            title="Membership Benefits"
          />
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <Star className="text-green-600" size={28} />
              </div>
              <h4 className="font-bold text-gray-900 text-2xl">
                Membership Benefits
              </h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {profileData.organization.membershipBenefits?.map(
                (benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-6 bg-white rounded-xl border border-green-200 shadow-sm"
                  >
                    <Star className="text-green-500" size={24} />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                )
              )}
              {(!profileData.organization.membershipBenefits ||
                profileData.organization.membershipBenefits.length === 0) && (
                <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-green-300 col-span-2">
                  <Star size={48} className="text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No membership benefits added yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Tab Components
  const EventsTab = () => (
    <div className="text-center py-16">
      <CalendarDays className="w-24 h-24 text-gray-400 mx-auto mb-8" />
      <h3 className="text-3xl font-bold text-gray-900 mb-6">
        Events Management
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
        Manage your organization's events, workshops, and activities in one
        centralized platform
      </p>
      <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-3 font-semibold text-lg mx-auto shadow-lg shadow-blue-500/25">
        <Plus size={24} />
        Create New Event
      </button>
    </div>
  );

  const MembersTab = () => (
    <div className="text-center py-16">
      <UserPlus className="w-24 h-24 text-gray-400 mx-auto mb-8" />
      <h3 className="text-3xl font-bold text-gray-900 mb-6">
        Members Management
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
        View, manage, and communicate with your organization members and assign
        roles
      </p>
      <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-3 font-semibold text-lg mx-auto shadow-lg shadow-blue-500/25">
        <UserCheck size={24} />
        View All Members
      </button>
    </div>
  );

  const GalleryTab = () => (
    <div className="text-center py-16">
      <ImagePlus className="w-24 h-24 text-gray-400 mx-auto mb-8" />
      <h3 className="text-3xl font-bold text-gray-900 mb-6">Photo Gallery</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
        Showcase your organization's photos, event memories, and achievements
      </p>
      <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-3 font-semibold text-lg mx-auto shadow-lg shadow-blue-500/25">
        <Upload size={24} />
        Upload Photos
      </button>
    </div>
  );

  const SettingsTab = () => (
    <div className="text-center py-16">
      <Settings className="w-24 h-24 text-gray-400 mx-auto mb-8" />
      <h3 className="text-3xl font-bold text-gray-900 mb-6">
        Organization Settings
      </h3>
      <p className="text-gray-600 max-w-md mx-auto text-lg">
        Manage your organization settings, privacy options, and administrative
        preferences
      </p>
    </div>
  );

  // Main Content Component
  const OrganizationContent = () => {
    const tabs = [
      { id: "overview", label: "Overview", icon: Eye, component: OverviewTab },
      { id: "about", label: "About", icon: FileText, component: AboutTab },
      { id: "events", label: "Events", icon: Calendar, component: EventsTab },
      { id: "members", label: "Members", icon: Users, component: MembersTab },
      {
        id: "gallery",
        label: "Gallery",
        icon: ImageIcon,
        component: GalleryTab,
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        component: SettingsTab,
      },
    ];

    const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

    return (
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-8">
          <ContactSidebar />
          <StatsSidebar />
        </div>

        {/* Main Content */}
        <div className="xl:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* Enhanced Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50/50">
              <nav className="flex space-x-1 px-6 overflow-x-auto">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`py-5 px-4 border-b-2 font-semibold text-base capitalize transition-all whitespace-nowrap flex items-center gap-3 min-w-max ${
                      activeTab === id
                        ? "border-blue-500 text-blue-600 bg-white shadow-sm"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {ActiveComponent && <ActiveComponent />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading && !profileData._id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-xl font-medium">
            Loading organization profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrganizationHeader />
        <OrganizationContent />
      </div>
    </div>
  );
};

export default OrganizationProfile;