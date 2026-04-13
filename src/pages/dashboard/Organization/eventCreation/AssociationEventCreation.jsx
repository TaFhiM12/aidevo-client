import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Upload,
  Users,
  DollarSign,
  Mail,
  Phone,
  Building,
  Target,
  Briefcase,
  Award,
  Network,
  GraduationCap,
  Users2,
} from "lucide-react";
import { uploadToCloudinary } from "../../../../utils/uploadToCloudinary";
import useAuth from "../../../../hooks/useAuth";
import useUserRole from "../../../../hooks/useUserRole";
import API from "../../../../utils/api";

const AssociationEventCreation = () => {
  const { user } = useAuth();
  const { userInfo } = useUserRole();

  const orgName =
    userInfo?.organization?.name || "Association";
  const orgEmail =
    userInfo?.email || user?.email || "";

    const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    longDesc: "",
    organizationEmail: orgEmail,
    organization: orgName,

    type: "on-campus",
    category: "professional",
    location: "",

    startAt: "",
    endAt: "",
    registrationDeadline: "",

    registrationRequired: true,
    maxCapacity: "",
    fee: "0",

    contactName: "",
    contactEmail: orgEmail,
    contactPhone: "",

    tags: "professional, networking, development",
    visibility: "public",
    cover: null,
    requirements: "",
    targetAudience: "all-students",

    eventType: "Networking Session",
    membershipRequired: "open",
    guestSpeakers: "",
    professionalLevel: "All Levels",
    ceCredits: false,
    creditHours: 0,
    industryFocus: "",
    networkingSession: true,
    certificationProvided: false,
  });

  const eventTypes = [
    "Networking Session",
    "Professional Workshop",
    "Annual Conference",
    "Seminar/Talk",
    "Training Program",
    "Committee Meeting",
    "Social Gathering",
    "Award Ceremony",
    "Industry Visit",
    "Mentorship Program"
  ];

  const professionalLevels = [
    "All Levels",
    "Students/Entry Level",
    "Junior Professionals",
    "Mid-Career Professionals",
    "Senior Executives",
    "Mixed Audience"
  ];

  const industries = [
    "Technology", "Business", "Healthcare", "Education", "Engineering",
    "Arts & Media", "Science & Research", "Government", "Non-profit", "General"
  ];

  const targetAudiences = [
    { value: "all-students", label: "All Students" },
    { value: "members-only", label: "Association Members Only" },
    { value: "alumni", label: "Alumni" },
    { value: "industry-professionals", label: "Industry Professionals" }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const submitToast = toast.loading("Creating association event...");

  try {
    let imageUrl = "";

    if (formData.cover) {
      imageUrl = await uploadToCloudinary(formData.cover);
    }

    const eventData = {
      ...formData,
      organizationEmail: orgEmail,
      organization: orgName,
      cover: imageUrl,
      organizationType: "association",
      specialRequirements: {
        eventType: formData.eventType,
        membershipRequired: formData.membershipRequired,
        guestSpeakers: formData.guestSpeakers,
        professionalLevel: formData.professionalLevel,
        ceCredits: formData.ceCredits,
        creditHours: formData.creditHours,
        industryFocus: formData.industryFocus,
        networkingSession: formData.networkingSession,
        certificationProvided: formData.certificationProvided,
      },
    };

    const res = await API.post("/events", eventData);

    if (res.success) {
      toast.success("Association event created successfully", { id: submitToast });

      setFormData((prev) => ({
        ...prev,
        title: "",
        shortDesc: "",
        longDesc: "",
        organizationEmail: orgEmail,
        organization: orgName,
        type: "on-campus",
        category: "professional",
        location: "",
        startAt: "",
        endAt: "",
        registrationDeadline: "",
        registrationRequired: true,
        maxCapacity: "",
        fee: "0",
        contactName: "",
        contactEmail: orgEmail,
        contactPhone: "",
        tags: "professional, networking, development",
        visibility: "public",
        cover: null,
        requirements: "",
        targetAudience: "all-students",
        eventType: "Networking Session",
        membershipRequired: "open",
        guestSpeakers: "",
        professionalLevel: "All Levels",
        ceCredits: false,
        creditHours: 0,
        industryFocus: "",
        networkingSession: true,
        certificationProvided: false,
      }));
    } else {
      throw new Error(res.message || "Failed to create association event");
    }
  } catch (err) {
    console.error(err);
    toast.error(
      err?.response?.data?.message || err?.message || "Failed to create association event",
      { id: submitToast }
    );
  }
};

  return (
    <div className="min-h-screen  pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-6"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border-l-8 border-sky-500">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="p-4 bg-sky-100 rounded-2xl shadow-lg">
                <Briefcase className="w-12 h-12 text-sky-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-sky-500 mb-3">
                  Create Professional Event
                </h1>
                <p className="text-sky-400 text-xl font-medium">
                  Organize professional development events, networking sessions, and workshops
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-white px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Network className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Professional Event Details</h2>
                <p className="text-sky-100 text-lg mt-2">
                  Plan your professional development or networking event
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Basic Information Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-sky-50 rounded-2xl p-8 border border-sky-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-sky-600 rounded-xl">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-sky-800">Event Basics</h3>
              </div>

              <div className="space-y-6">
                {/* Organization */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    Association Name *
                  </label>
                  <input
                    type="text"
                    name="organization"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white text-lg shadow-sm"
                    placeholder="e.g., Technology Professionals Association"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Event Title */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    🎯 Professional Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white text-lg shadow-sm"
                    placeholder="e.g., Annual Tech Innovation Summit 2024"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-sky-700">
                      Short Description *
                    </label>
                    <textarea
                      name="shortDesc"
                      className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white resize-none h-32 shadow-sm"
                      placeholder="Brief overview of your professional event..."
                      value={formData.shortDesc}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-sky-700">
                      Detailed Information
                    </label>
                    <textarea
                      name="longDesc"
                      className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white resize-none h-32 shadow-sm"
                      placeholder="Full event details, agenda, learning outcomes, benefits..."
                      value={formData.longDesc}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Event Type & Professional Details Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-sky-50 rounded-2xl p-8 border border-sky-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-sky-600 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-sky-800">Professional Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Type */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    🎯 Event Type *
                  </label>
                  <select
                    name="eventType"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Professional Level */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    📊 Target Professional Level
                  </label>
                  <select
                    name="professionalLevel"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.professionalLevel}
                    onChange={handleChange}
                  >
                    {professionalLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Membership Requirement */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    👥 Membership Requirement
                  </label>
                  <select
                    name="membershipRequired"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.membershipRequired}
                    onChange={handleChange}
                  >
                    <option value="open">Open to all</option>
                    <option value="members">Members only</option>
                    <option value="members-guests">Members + guests</option>
                    <option value="invitation">By invitation only</option>
                  </select>
                </div>

                {/* Industry Focus */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    🏭 Industry Focus
                  </label>
                  <select
                    name="industryFocus"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.industryFocus}
                    onChange={handleChange}
                  >
                    <option value="">General/Cross-industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Speakers */}
              <div className="space-y-3 mt-6">
                <label className="block text-lg font-semibold text-sky-700">
                  🎤 Guest Speakers & Presenters
                </label>
                <textarea
                  name="guestSpeakers"
                  className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white resize-none h-24 shadow-sm"
                  placeholder="List confirmed or potential guest speakers, their affiliations, and topics..."
                  value={formData.guestSpeakers}
                  onChange={handleChange}
                />
              </div>
            </motion.section>

            {/* Professional Development Features */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-sky-50 rounded-2xl p-8 border border-sky-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-sky-600 rounded-xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-sky-800">Professional Development Features</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CE Credits */}
                  <div className="flex items-center gap-4 p-6 bg-sky-100 rounded-xl border-2 border-sky-300">
                    <input
                      type="checkbox"
                      name="ceCredits"
                      checked={formData.ceCredits}
                      onChange={handleChange}
                      className="checkbox checkbox-success checkbox-lg"
                    />
                    <div className="flex-1">
                      <span className="block text-lg font-semibold text-sky-700">Continuing Education Credits</span>
                      <span className="text-sky-600 font-medium">This event offers professional development credits</span>
                    </div>
                    {formData.ceCredits && (
                      <div className="w-24">
                        <input
                          type="number"
                          name="creditHours"
                          className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg text-base font-medium"
                          placeholder="Hours"
                          min="0.5"
                          step="0.5"
                          value={formData.creditHours}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                  </div>

                  {/* Networking Session */}
                  <div className="flex items-center gap-4 p-6 bg-sky-100 rounded-xl border-2 border-sky-300">
                    <input
                      type="checkbox"
                      name="networkingSession"
                      checked={formData.networkingSession}
                      onChange={handleChange}
                      className="checkbox checkbox-success checkbox-lg"
                    />
                    <div>
                      <span className="block text-lg font-semibold text-sky-700">Networking Session</span>
                      <span className="text-sky-600 font-medium">Dedicated time for professional networking</span>
                    </div>
                  </div>
                </div>

                {/* Certification */}
                <div className="flex items-center gap-4 p-6 bg-sky-100 rounded-xl border-2 border-sky-300">
                  <input
                    type="checkbox"
                    name="certificationProvided"
                    checked={formData.certificationProvided}
                    onChange={handleChange}
                    className="checkbox checkbox-success checkbox-lg"
                  />
                  <div>
                    <span className="block text-lg font-semibold text-sky-700">Certificate of Participation</span>
                    <span className="text-sky-600 font-medium">Provide certificates to attendees</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Schedule & Venue Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-sky-50 rounded-2xl p-8 border border-sky-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-sky-600 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-sky-800">Schedule & Venue</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-sky-700 flex items-center gap-3">
                    <Calendar className="w-5 h-5" /> Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startAt"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.startAt}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-sky-700 flex items-center gap-3">
                    <Clock className="w-5 h-5" /> End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endAt"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.endAt}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    Event Type
                  </label>
                  <select
                    name="type"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="on-campus">On-campus</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="off-campus">Off-campus</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-sky-700 flex items-center gap-3">
                    <MapPin className="w-5 h-5" /> Event Venue *
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    placeholder="Conference Hall or Online Platform"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </motion.section>

            {/* Registration Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-sky-50 rounded-2xl p-8 border border-sky-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-sky-600 rounded-xl">
                  <Users2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-sky-800">Registration & Participants</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Target Audience */}
                  <div className="space-y-3">
                    <label className="text-lg font-semibold text-sky-700 flex items-center gap-3">
                      <Target className="w-5 h-5" /> Target Audience
                    </label>
                    <select
                      name="targetAudience"
                      className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                      value={formData.targetAudience}
                      onChange={handleChange}
                    >
                      {targetAudiences.map(audience => (
                        <option key={audience.value} value={audience.value}>{audience.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Max Capacity */}
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-sky-700">
                      Maximum Participants
                    </label>
                    <input
                      type="number"
                      name="maxCapacity"
                      className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                      placeholder="100"
                      value={formData.maxCapacity}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Registration Deadline */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </motion.section>

            {/* Contact Information */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-sky-50 rounded-2xl p-8 border border-sky-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-sky-600 rounded-xl">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-sky-800">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    placeholder="Event Coordinator Name"
                    value={formData.contactName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    placeholder="events@association.org"
                    value={formData.contactEmail}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-sky-700 flex items-center gap-3">
                    <Phone className="w-5 h-5" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    placeholder="+1 234 567 8900"
                    value={formData.contactPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </motion.section>

            {/* Media Upload */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-sky-50 rounded-2xl p-8 border border-sky-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-sky-600 rounded-xl">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-sky-800">Event Cover Image</h3>
              </div>

              <div className="space-y-4">
                <input
                  type="file"
                  name="cover"
                  accept="image/*"
                  className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-lg file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-700 shadow-sm"
                  onChange={handleChange}
                />
                <span className="text-base text-sky-600 font-medium block">
                  Recommended: 1200x600px, JPG/PNG format (Max: 5MB)
                </span>
                
                {formData.cover && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6"
                  >
                    <img
                      src={URL.createObjectURL(formData.cover)}
                      alt="Cover preview"
                      className="rounded-2xl w-full max-h-80 object-cover border-2 border-sky-300 shadow-lg"
                    />
                  </motion.div>
                )}
              </div>
            </motion.section>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white py-6 px-8 rounded-2xl font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center gap-4"
              type="submit"
            >
              <Briefcase className="w-8 h-8" />
              Create Professional Event
            </motion.button>
          </form>
        </motion.div>

        {/* Professional Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 bg-white rounded-3xl shadow-2xl border border-sky-200 p-8"
        >
          <h3 className="text-3xl font-bold text-sky-700 mb-6 flex items-center gap-3">
            <Network className="w-8 h-8" />
            Professional Event Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-sky-600">Event Planning</h4>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li className="flex items-center gap-3">• Clearly state membership requirements and fees</li>
                <li className="flex items-center gap-3">• Highlight professional development benefits</li>
                <li className="flex items-center gap-3">• Plan networking opportunities and icebreakers</li>
                <li className="flex items-center gap-3">• Consider hybrid (in-person + virtual) options</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-sky-600">Execution & Follow-up</h4>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li className="flex items-center gap-3">• Follow up with attendees for feedback</li>
                <li className="flex items-center gap-3">• Provide resources and presentation materials</li>
                <li className="flex items-center gap-3">• Record sessions for future reference</li>
                <li className="flex items-center gap-3">• Build partnerships with industry professionals</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssociationEventCreation;