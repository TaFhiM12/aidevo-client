import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Edit3,
  Save,
  X,
  Upload,
  Camera,
  Shield,
  Award,
  Target,
  Heart,
  Users,
  Star,
  Clock,
  Bookmark,
  TrendingUp,
  BarChart3,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Globe,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import useAuth from "../../../hooks/useAuth";
import { useUserContext } from "../../../context/UserContext";
import API from "../../../utils/api";

// Enhanced Inline Edit Field Component for Student Profile
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

// Array Management Component for Skills, Projects, etc.
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
    const newItems = localItems.map((item, i) => (i === index ? value : item));
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
      button: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      button:
        "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      button:
        "from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      button:
        "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
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
            className={`px-4 py-2 bg-gradient-to-r ${currentColor.button} text-white rounded-xl transition-all flex items-center gap-2 font-medium`}
          >
            <Save size={18} />
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

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingField, setSavingField] = useState(null);
  const [interestInput, setInterestInput] = useState("");
  const { user } = useAuth();
  const { updateGlobalUserInfo } = useUserContext();

  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    _id: "",
    uid: "",
    email: "",
    name: "",
    role: "student",
    photoURL: "",
    createdAt: "",
    student: {
      studentId: "",
      department: "",
      session: "",
      interests: "",
      year: new Date().getFullYear(),
      status: "active",
      verified: false,
      bio: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      cgpa: "",
      skills: [],
      projects: [],
      achievements: [],
      socialLinks: {
        linkedin: "",
        github: "",
        portfolio: "",
        twitter: "",
        facebook: "",
        instagram: "",
      },
      education: {
        currentYear: "",
        expectedGraduation: "",
        major: "",
        minor: "",
      },
      career: {
        lookingFor: "",
        preferredRole: "",
        resumeUrl: "",
      },
    },
  });

  // Departments data
  const departments = [
    { name: "Computer Science and Engineering", code: "cse" },
    { name: "Electrical and Electronic Engineering", code: "eee" },
    { name: "Industrial and Production Engineering", code: "ipe" },
    { name: "Petroleum and Mining Engineering", code: "pme" },
    { name: "Chemical Engineering", code: "che" },
    { name: "Biomedical Engineering", code: "bme" },
    { name: "Textile Engineering", code: "te" },
    { name: "Microbiology", code: "mb" },
    { name: "Fisheries and Marine Bioscience", code: "fmb" },
    { name: "Genetic Engineering and Biotechnology", code: "gebt" },
    { name: "Pharmacy", code: "phar" },
    { name: "Biochemistry and Molecular Biology", code: "bmb" },
    { name: "Environmental Science and Technology", code: "est" },
    { name: "Nutrition and Food Technology", code: "nft" },
    { name: "Food Engineering", code: "fe" },
    { name: "Climate and Disaster Management", code: "cdm" },
    { name: "Physical Education and Sports Science", code: "pess" },
    { name: "Physiotherapy and Rehabilitation", code: "ptr" },
    { name: "Nursing and Health Science", code: "nhs" },
    { name: "English", code: "eng" },
    { name: "Physics", code: "phy" },
    { name: "Chemistry", code: "chem" },
    { name: "Mathematics", code: "math" },
    { name: "Applied Statistics and Data Science", code: "asd" },
    { name: "Accounting and Information Systems", code: "ais" },
    { name: "Management", code: "mgt" },
    { name: "Finance and Banking", code: "fb" },
    { name: "Marketing", code: "mkt" },
  ];

  const interestsOptions = [
    "Charity & Volunteering",
    "Clubs & Societies",
    "Associations",
    "Sports & Athletics",
    "Cultural Activities",
    "Technical & Coding",
    "Research & Innovation",
    "Entrepreneurship",
    "Arts & Creativity",
    "Leadership & Development",
    "Community Service",
    "Environmental Causes",
    "Education & Tutoring",
    "Professional Development",
    "Social Events",
  ];

  const parseInterestString = (value) =>
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const normalizeInterests = (interests) =>
    Array.from(
      new Set(
        interests
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );

  // Fetch student data
  useEffect(() => {
    if (user?.email) {
      fetchStudentData();
    }
  }, [user?.email]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      const userResponse = await API.get(`/users/uid/${user.uid}`);
      const studentData = userResponse.data;
      setProfileData(studentData);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  // Update individual field
  const updateField = async (field, value) => {
    try {
      setSavingField(field);

      const response = await API.patch(`/students/${profileData._id}/field`, {
        field,
        value,
      });

      if (response.success) {
        const updatedData = response.data;
        setProfileData(updatedData);

        if (field === "name") {
          updateGlobalUserInfo({ name: value });
        } else if (field === "photoURL") {
          updateGlobalUserInfo({ photoURL: value });
        } else if (field === "student.interests") {
          updateGlobalUserInfo({ interests: value });
        }

        toast.success("Updated successfully!");
        return true;
      }

      throw new Error(response.message || "Update failed");
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

      const response = await API.patch(`/students/${profileData._id}/field`, {
        field,
        value,
      });

      if (response.success) {
        setProfileData(response.data);
        return true;
      }

      throw new Error(response.message || "Update failed");
    } catch (error) {
      console.error("Error updating array field:", error);
      toast.error("Failed to update");
      return false;
    } finally {
      setSavingField(null);
    }
  };

  const interests = parseInterestString(profileData.student?.interests);

  const saveInterests = async (nextInterests) => {
    const normalizedInterests = normalizeInterests(nextInterests);
    const interestsValue = normalizedInterests.join(", ");
    return updateField("student.interests", interestsValue);
  };

  const addInterest = async (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    const success = await saveInterests([...interests, trimmedValue]);

    if (success) {
      setInterestInput("");
    }
  };

  const removeInterest = async (value) => {
    await saveInterests(interests.filter((item) => item !== value));
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (event) => {
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

    try {
      setUploading(true);
      const uploadToast = toast.loading("Uploading profile photo...");

      const imageUrl = await uploadToCloudinary(file);

      if (!imageUrl) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      // Update in database
      const response = await API.patch(`/students/${profileData._id}/field`, {
        field: "photoURL",
        value: imageUrl,
      });

      if (response.success) {
        setProfileData((prev) => ({ ...prev, photoURL: imageUrl }));
        updateGlobalUserInfo({ photoURL: imageUrl });
        toast.success("Profile photo updated successfully!", {
          id: uploadToast,
        });
      } else {
        throw new Error("Failed to save photo to database");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload profile photo");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const triggerPhotoInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Student Header Component
  const StudentHeader = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100"
      >
        {/* Header Background */}
        <div className="relative h-48 bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Main Content */}
          <div className="relative h-full flex items-center justify-between px-8">
            {/* Student Info */}
            <div className="flex items-center gap-6">
              {/* Profile Photo with Edit Overlay */}
              <div className="relative group">
                <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-2xl overflow-hidden">
                  {profileData.photoURL ? (
                    <img
                      src={profileData.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={triggerPhotoInput}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </div>

              {/* Student Details */}
              <div className="text-white">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold mb-2"
                >
                  {profileData.name || "Student Name"}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/90 text-lg mb-3"
                >
                  {profileData.student?.department
                    ? departments.find(
                        (dept) => dept.code === profileData.student.department,
                      )?.name || profileData.student.department
                    : "Department not set"}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full">
                    <GraduationCap size={16} />
                    <span className="text-sm font-medium">
                      ID: {profileData.student?.studentId || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">
                      Session: {profileData.student?.session || "N/A"}
                    </span>
                  </div>
                  {profileData.student?.verified && (
                    <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-lg px-3 py-1 rounded-full">
                      <Shield size={16} />
                      <span className="text-sm font-medium">
                        Verified Student
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border-2 border-white/50 text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 font-semibold"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 font-semibold shadow-lg"
                  >
                    <Save size={20} />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 font-semibold shadow-lg"
                >
                  <Edit3 size={20} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatItem
              icon={BookOpen}
              label="CGPA"
              value={profileData.student?.cgpa || "N/A"}
              color="text-blue-600"
            />
            <StatItem
              icon={TrendingUp}
              label="Year"
              value={`Year ${profileData.student?.year || "N/A"}`}
              color="text-green-600"
            />
            <StatItem
              icon={Award}
              label="Achievements"
              value={profileData.student?.achievements?.length || 0}
              color="text-purple-600"
            />
            <StatItem
              icon={BarChart3}
              label="Skills"
              value={profileData.student?.skills?.length || 0}
              color="text-orange-600"
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const StatItem = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
      <div className={`p-3 rounded-xl bg-gray-100 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );

  // Contact Info Component - WIDER VERSION
  const ContactInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 w-full"
    >
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-xl">
        <User size={24} className="text-blue-500" />
        <span>Contact Information</span>
      </h3>

      <div className="space-y-5">
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
          value={profileData.student?.phone}
          field="student.phone"
          type="tel"
          icon={Phone}
        />
        <ContactField
          label="Address"
          value={profileData.student?.address}
          field="student.address"
          icon={MapPin}
        />
        <ContactField
          label="Date of Birth"
          value={
            profileData.student?.dateOfBirth
              ? new Date(profileData.student.dateOfBirth).toLocaleDateString()
              : ""
          }
          field="student.dateOfBirth"
          type="date"
          icon={Calendar}
        />
      </div>
    </motion.div>
  );

  const ContactField = ({
    label,
    value,
    field,
    disabled = false,
    type = "text",
    icon: Icon,
  }) => (
    <div className="group w-full">
      <label className="text-sm font-semibold text-gray-700 block mb-2">
        {label}
      </label>
      {disabled ? (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl w-full">
          {Icon && <Icon size={20} className="text-gray-400" />}
          <p className="text-base text-gray-700 flex-1 truncate">
            {value || "Not provided"}
          </p>
        </div>
      ) : (
        <div className="w-full">
          <InlineEditField
            value={value || ""}
            onSave={(newValue) => updateField(field, newValue)}
            className="text-base text-gray-700 w-full"
            placeholder={`Add ${label.toLowerCase()}`}
            type={type}
            loading={savingField === field}
            icon={Icon}
          />
        </div>
      )}
    </div>
  );

  // Academic Info Component - WIDER VERSION
  const AcademicInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 w-full"
    >
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-xl">
        <GraduationCap size={24} className="text-green-500" />
        <span>Academic Information</span>
      </h3>

      <div className="space-y-5">
        <AcademicField
          label="Student ID"
          value={profileData.student?.studentId}
          field="student.studentId"
          icon={User}
        />
        <AcademicField
          label="Department"
          value={profileData.student?.department}
          field="student.department"
          type="select"
          options={departments.map((dept) => dept.code)}
          optionLabels={departments.reduce((acc, dept) => {
            acc[dept.code] = dept.name;
            return acc;
          }, {})}
          icon={BookOpen}
        />
        <AcademicField
          label="Session"
          value={profileData.student?.session}
          field="student.session"
          icon={Calendar}
        />
        <AcademicField
          label="Current Year"
          value={profileData.student?.year}
          field="student.year"
          type="select"
          options={["1", "2", "3", "4", "5"]}
          icon={TrendingUp}
        />
        <AcademicField
          label="CGPA"
          value={profileData.student?.cgpa}
          field="student.cgpa"
          type="number"
          step="0.01"
          min="0"
          max="4"
          icon={Star}
        />
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Interests
          </label>
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex flex-wrap gap-2 mb-3">
              {interests.length > 0 ? (
                interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-medium"
                  >
                    <Heart size={14} />
                    {interest}
                    <button
                      type="button"
                      className="text-pink-700 hover:text-pink-900"
                      onClick={() => removeInterest(interest)}
                      disabled={savingField === "student.interests"}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No interests selected yet. Add a few to improve event recommendations.
                </p>
              )}
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="Add custom interest"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <button
                type="button"
                onClick={() => addInterest(interestInput)}
                disabled={savingField === "student.interests"}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {interestsOptions
                .filter((option) => !interests.includes(option))
                .slice(0, 8)
                .map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => addInterest(option)}
                    disabled={savingField === "student.interests"}
                    className="px-2.5 py-1 text-xs font-medium border border-blue-200 text-blue-700 bg-white rounded-full hover:bg-blue-50 disabled:opacity-60"
                  >
                    + {option}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const AcademicField = ({
    label,
    value,
    field,
    type = "text",
    options = [],
    optionLabels = {},
    icon: Icon,
    ...inputProps
  }) => (
    <div className="group w-full">
      <label className="text-sm font-semibold text-gray-700 block mb-2">
        {label}
      </label>
      <div className="w-full">
        <InlineEditField
          value={value || ""}
          onSave={(newValue) => updateField(field, newValue)}
          className="text-base text-gray-700 w-full"
          placeholder={`Add ${label.toLowerCase()}`}
          type={type}
          options={options}
          loading={savingField === field}
          icon={Icon}
          {...inputProps}
        />
      </div>
      {optionLabels[value] && (
        <p className="text-sm text-gray-500 mt-1">{optionLabels[value]}</p>
      )}
    </div>
  );

  // Social Links Component - WIDER VERSION
  const SocialLinks = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 w-full"
    >
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-xl">
        <Globe size={24} className="text-purple-500" />
        <span>Social Links</span>
      </h3>

      <div className="space-y-4">
        {[
          {
            platform: "linkedin",
            icon: Linkedin,
            color: "text-blue-600",
            baseUrl: "https://linkedin.com/in/",
          },
          {
            platform: "github",
            icon: Github,
            color: "text-gray-800",
            baseUrl: "https://github.com/",
          },
          {
            platform: "portfolio",
            icon: Globe,
            color: "text-green-600",
            baseUrl: "",
          },
          {
            platform: "twitter",
            icon: Twitter,
            color: "text-blue-400",
            baseUrl: "https://twitter.com/",
          },
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
        ].map(({ platform, icon: Icon, color, baseUrl }) => (
          <SocialField
            key={platform}
            platform={platform}
            value={profileData.student?.socialLinks?.[platform] || ""}
            icon={Icon}
            color={color}
            baseUrl={baseUrl}
          />
        ))}
      </div>
    </motion.div>
  );

  const SocialField = ({ platform, value, icon: Icon, color, baseUrl }) => (
    <div className="flex items-center gap-4 group p-3 hover:bg-gray-50 rounded-xl transition-all w-full">
      <div className={`p-3 rounded-xl bg-gray-100 ${color} flex-shrink-0`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <InlineEditField
          value={value || ""}
          onSave={(newValue) =>
            updateField(`student.socialLinks.${platform}`, newValue)
          }
          className="text-base w-full"
          placeholder={`${platform} username or URL`}
          loading={savingField === `student.socialLinks.${platform}`}
        />
      </div>
      {value && (
        <a
          href={value.includes("http") ? value : `${baseUrl}${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-400 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
        >
          <ExternalLink size={18} />
        </a>
      )}
    </div>
  );

  // Bio Component
  const BioSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <User className="text-blue-600" size={28} />
        </div>
        <h3 className="font-bold text-gray-900 text-2xl">About Me</h3>
      </div>

      {isEditing ? (
        <InlineEditField
          value={profileData.student?.bio || ""}
          onSave={(value) => updateField("student.bio", value)}
          className="text-gray-700 leading-relaxed text-lg w-full"
          placeholder="Tell us about yourself, your passions, goals, and what you're looking to achieve..."
          multiline
          loading={savingField === "student.bio"}
          icon={User}
        />
      ) : (
        <p className="text-gray-700 leading-relaxed text-lg">
          {profileData.student?.bio ||
            "No bio provided. Click to add your bio and tell us about yourself."}
        </p>
      )}
    </motion.div>
  );

  // Skills Component
  const SkillsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
    >
      {isEditing ? (
        <ArrayManagement
          items={profileData.student?.skills || []}
          onUpdate={(items) => updateArrayField("student.skills", items)}
          placeholder="Add a skill (e.g., JavaScript, Python, UI/UX Design)"
          icon={BarChart3}
          color="blue"
          title="Skills"
        />
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 className="text-blue-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-2xl">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {profileData.student?.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium text-sm"
              >
                {skill}
              </span>
            ))}
            {(!profileData.student?.skills ||
              profileData.student.skills.length === 0) && (
              <div className="text-center py-8 w-full">
                <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No skills added yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  // Projects Component
  const ProjectsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
    >
      {isEditing ? (
        <ArrayManagement
          items={profileData.student?.projects || []}
          onUpdate={(items) => updateArrayField("student.projects", items)}
          placeholder="Add a project description"
          icon={Target}
          color="green"
          title="Projects"
        />
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Target className="text-green-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-2xl">Projects</h3>
          </div>
          <div className="space-y-4">
            {profileData.student?.projects?.map((project, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-6 bg-green-50 rounded-xl border border-green-200"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 text-lg">{project}</span>
              </div>
            ))}
            {(!profileData.student?.projects ||
              profileData.student.projects.length === 0) && (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Target size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No projects added yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  // Achievements Component
  const AchievementsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
    >
      {isEditing ? (
        <ArrayManagement
          items={profileData.student?.achievements || []}
          onUpdate={(items) => updateArrayField("student.achievements", items)}
          placeholder="Add an achievement description"
          icon={Award}
          color="purple"
          title="Achievements"
        />
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Award className="text-purple-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-2xl">Achievements</h3>
          </div>
          <div className="space-y-4">
            {profileData.student?.achievements?.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-6 bg-purple-50 rounded-xl border border-purple-200"
              >
                <Award className="text-purple-500" size={24} />
                <span className="text-gray-700 text-lg">{achievement}</span>
              </div>
            ))}
            {(!profileData.student?.achievements ||
              profileData.student.achievements.length === 0) && (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Award size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No achievements added yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  // Career Goals Component
  const CareerGoalsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-orange-100 rounded-xl">
          <TrendingUp className="text-orange-600" size={28} />
        </div>
        <h3 className="font-bold text-gray-900 text-2xl">Career Goals</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-3">
            Currently Looking For
          </label>
          {isEditing ? (
            <InlineEditField
              value={profileData.student?.career?.lookingFor || ""}
              onSave={(value) =>
                updateField("student.career.lookingFor", value)
              }
              className="text-gray-700 w-full"
              placeholder="Internships, Full-time positions, Research opportunities..."
              type="select"
              options={[
                "Internships",
                "Full-time Positions",
                "Part-time Positions",
                "Research Opportunities",
                "Volunteer Work",
                "Not Currently Looking",
              ]}
              loading={savingField === "student.career.lookingFor"}
              icon={Target}
            />
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Target size={20} className="text-orange-500" />
              <p className="text-gray-900 text-lg font-medium">
                {profileData.student?.career?.lookingFor || "Not specified"}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-3">
            Preferred Role
          </label>
          {isEditing ? (
            <InlineEditField
              value={profileData.student?.career?.preferredRole || ""}
              onSave={(value) =>
                updateField("student.career.preferredRole", value)
              }
              className="text-gray-700 w-full"
              placeholder="Software Engineer, Data Scientist, UX Designer..."
              loading={savingField === "student.career.preferredRole"}
              icon={User}
            />
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <User size={20} className="text-orange-500" />
              <p className="text-gray-900 text-lg font-medium">
                {profileData.student?.career?.preferredRole || "Not specified"}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Main Content Component - UPDATED LAYOUT
  const StudentContent = () => {
    const tabs = [
      { id: "overview", label: "Overview" },
      { id: "academic", label: "Academic" },
      { id: "projects", label: "Projects" },
      { id: "skills", label: "Skills" },
      { id: "achievements", label: "Achievements" },
      { id: "career", label: "Career" },
    ];

    const renderTabContent = () => {
      switch (activeTab) {
        case "overview":
          return (
            <div className="space-y-8">
              <BioSection />
              <div className="grid md:grid-cols-2 gap-8">
                <SkillsSection />
                <AchievementsSection />
              </div>
            </div>
          );
        case "academic":
          return (
            <div className="space-y-8">
              <AcademicInfo />
              <CareerGoalsSection />
            </div>
          );
        case "projects":
          return <ProjectsSection />;
        case "skills":
          return <SkillsSection />;
        case "achievements":
          return <AchievementsSection />;
        case "career":
          return <CareerGoalsSection />;
        default:
          return <BioSection />;
      }
    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar - WIDER VERSION */}
        <div className="xl:col-span-1 space-y-8">
          <ContactInfo />
          <SocialLinks />
        </div>

        {/* Main Content */}
        <div className="xl:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50/50">
              <nav className="flex space-x-1 px-6 overflow-x-auto">
                {tabs.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`py-5 px-4 border-b-2 font-semibold text-base capitalize transition-all whitespace-nowrap min-w-max ${
                      activeTab === id
                        ? "border-blue-500 text-blue-600 bg-white shadow-sm"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {label}
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
                  {renderTabContent()}
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
            Loading student profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StudentHeader />
        <StudentContent />
      </div>
    </div>
  );
};

export default MyProfile;
