import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Mic,
  Trophy,
  Scale,
  Gavel,
} from "lucide-react";
import { uploadToCloudinary } from "../../../../utils/uploadToCloudinary";
import useAuth from "../../../../hooks/useAuth";
import useUserRole from "../../../../hooks/useUserRole";
import API from "../../../../utils/api";

const DebateClubEventCreation = () => {
  const { user } = useAuth();
  const { userInfo } = useUserRole();

  const orgName = userInfo?.organization?.name || "Debate Club";
  const orgEmail = userInfo?.email || user?.email || "";
  const [formData, setFormData] = useState({
  title: "",
  shortDesc: "",
  longDesc: "",
  organizationEmail: orgEmail,
  organization: orgName,

  type: "on-campus",
  category: "competition",
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

  tags: "debate, public-speaking, competition, critical-thinking",
  visibility: "public",
  cover: null,
  requirements: "",
  targetAudience: "all-students",

  debateFormat: "British Parliamentary",
  teamSize: "2",
  motionTopics: "",
  judgingCriteria: "",
  preparationTime: 30,
  speechDuration: 7,
  adjudicatorsCount: "",
  prizeDetails: "",
  skillLevel: "beginner",
});

  const debateFormats = [
    "British Parliamentary",
    "World Schools Style", 
    "Lincoln-Douglas",
    "Public Forum",
    "Asian Parliamentary",
    "Karl Popper",
    "Other"
  ];

  const skillLevels = [
    { value: "beginner", label: "Beginner - First time debaters" },
    { value: "intermediate", label: "Intermediate - Some experience" },
    { value: "advanced", label: "Advanced - Competitive level" },
    { value: "open", label: "Open - All levels welcome" }
  ];

  const targetAudiences = [
    { value: "all-students", label: "All Students" },
    { value: "first-year", label: "First Year Students" },
    { value: "postgraduate", label: "Postgraduate Students" },
    { value: "debate-members", label: "Debate Club Members Only" }
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

  const submitToast = toast.loading("Creating debate event...");

  try {
    if (!formData.motionTopics) {
      toast.error("Please specify the debate motion topics", { id: submitToast });
      return;
    }

    if (!formData.adjudicatorsCount) {
      toast.error("Please specify the number of adjudicators", { id: submitToast });
      return;
    }

    let imageUrl = "";

    if (formData.cover) {
      imageUrl = await uploadToCloudinary(formData.cover);
    }

    const eventData = {
      ...formData,
      organizationEmail: orgEmail,
      organization: orgName,
      cover: imageUrl,
      organizationType: "debate-club",
      specialRequirements: {
        debateFormat: formData.debateFormat,
        teamSize: formData.teamSize,
        motionTopics: formData.motionTopics,
        judgingCriteria: formData.judgingCriteria,
        preparationTime: formData.preparationTime,
        speechDuration: formData.speechDuration,
        adjudicatorsCount: formData.adjudicatorsCount,
        prizeDetails: formData.prizeDetails,
        skillLevel: formData.skillLevel,
      },
    };

    const res = await API.post("/events", eventData);

    if (res.success) {
      toast.success("Debate event created successfully", { id: submitToast });

      setFormData((prev) => ({
        ...prev,
        title: "",
        shortDesc: "",
        longDesc: "",
        organizationEmail: orgEmail,
        organization: orgName,
        type: "on-campus",
        category: "competition",
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
        tags: "debate, public-speaking, competition, critical-thinking",
        visibility: "public",
        cover: null,
        requirements: "",
        targetAudience: "all-students",
        debateFormat: "British Parliamentary",
        teamSize: "2",
        motionTopics: "",
        judgingCriteria: "",
        preparationTime: 30,
        speechDuration: 7,
        adjudicatorsCount: "",
        prizeDetails: "",
        skillLevel: "beginner",
      }));
    } else {
      throw new Error(res.message || "Failed to create debate event");
    }
  } catch (err) {
    console.error(err);
    toast.error(
      err?.response?.data?.message || err?.message || "Failed to create debate event",
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
          className="text-center mb-8 "
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border-l-8 border-sky-500">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="p-4 bg-sky-100 rounded-2xl shadow-lg">
                <Mic className="w-12 h-12 text-sky-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-sky-700 mb-3">
                  Create Debate Competition
                </h1>
                <p className="text-sky-600 text-xl font-medium">
                  Organize an engaging debate competition to foster critical thinking and public speaking
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
          <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 text-white px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Debate Competition Details</h2>
                <p className="text-sky-100 text-lg mt-2">
                  Set up your debate event with proper format and rules
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
                <h3 className="text-2xl font-bold text-sky-800">Competition Basics</h3>
              </div>

              <div className="space-y-6">
                {/* Event Title */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    🏆 Debate Competition Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white text-lg shadow-sm"
                    placeholder="e.g., Intra-University Debate Championship 2024"
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
                      placeholder="Brief overview of your debate competition..."
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
                      placeholder="Full event details, competition rules, benefits for participants..."
                      value={formData.longDesc}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Debate Format Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-sky-50 rounded-2xl p-8 border border-sky-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-sky-600 rounded-xl">
                  <Gavel className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-sky-800">Debate Format & Rules</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Debate Format */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    🏛️ Debate Format *
                  </label>
                  <select
                    name="debateFormat"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.debateFormat}
                    onChange={handleChange}
                    required
                  >
                    {debateFormats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>

                {/* Team Size */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    👥 Team Size
                  </label>
                  <select
                    name="teamSize"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.teamSize}
                    onChange={handleChange}
                  >
                    <option value="1">Individual</option>
                    <option value="2">2 members per team</option>
                    <option value="3">3 members per team</option>
                    <option value="4">4 members per team</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Preparation Time */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    ⏱️ Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="preparationTime"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    min="15"
                    max="120"
                    value={formData.preparationTime}
                    onChange={handleChange}
                  />
                </div>

                {/* Speech Duration */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    🎤 Speech Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="speechDuration"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    min="5"
                    max="15"
                    value={formData.speechDuration}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Motion Topics */}
              <div className="space-y-3 mt-6">
                <label className="block text-lg font-semibold text-sky-700">
                  💬 Debate Motion Topics *
                </label>
                <textarea
                  name="motionTopics"
                  className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white resize-none h-32 shadow-sm"
                  placeholder="List potential debate topics/motions. You can specify if motions will be announced in advance or at the event..."
                  value={formData.motionTopics}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Judging Criteria */}
              <div className="space-y-3 mt-6">
                <label className="block text-lg font-semibold text-sky-700">
                  ⚖️ Judging Criteria
                </label>
                <textarea
                  name="judgingCriteria"
                  className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white resize-none h-24 shadow-sm"
                  placeholder="Specify how participants will be judged (content, style, strategy, etc.)..."
                  value={formData.judgingCriteria}
                  onChange={handleChange}
                />
              </div>
            </motion.section>

            {/* Schedule & Venue Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
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
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-sky-700 flex items-center gap-3">
                    <MapPin className="w-5 h-5" /> Competition Venue *
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    placeholder="Main Auditorium or Online Platform"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </motion.section>

            {/* Adjudicators & Prizes Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-sky-50 rounded-2xl p-8 border border-sky-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-sky-600 rounded-xl">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-sky-800">Adjudicators & Awards</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Adjudicators Count */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    👨‍⚖️ Number of Adjudicators *
                  </label>
                  <input
                    type="number"
                    name="adjudicatorsCount"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    placeholder="e.g., 3"
                    min="1"
                    value={formData.adjudicatorsCount}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Skill Level */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-sky-700">
                    🎯 Skill Level
                  </label>
                  <select
                    name="skillLevel"
                    className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.skillLevel}
                    onChange={handleChange}
                  >
                    {skillLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prize Details */}
              <div className="space-y-3 mt-6">
                <label className="block text-lg font-semibold text-sky-700">
                  🏆 Prizes & Awards
                </label>
                <textarea
                  name="prizeDetails"
                  className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white resize-none h-20 shadow-sm"
                  placeholder="Trophies, certificates, cash prizes, scholarships, etc."
                  value={formData.prizeDetails}
                  onChange={handleChange}
                />
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
                      Maximum Teams
                    </label>
                    <input
                      type="number"
                      name="maxCapacity"
                      className="w-full px-6 py-4 border-2 border-sky-300 rounded-xl focus:ring-4 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 bg-white shadow-sm"
                      placeholder="20"
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
                    placeholder="Debate Coordinator Name"
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
                    placeholder="debate@university.edu"
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
              <Mic className="w-8 h-8" />
              Create Debate Competition
            </motion.button>
          </form>
        </motion.div>

        {/* Debate Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 bg-white rounded-3xl shadow-2xl border border-sky-200 p-8"
        >
          <h3 className="text-3xl font-bold text-sky-700 mb-6 flex items-center gap-3">
            <Scale className="w-8 h-8" />
            Debate Competition Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-sky-600">Event Planning</h4>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li className="flex items-center gap-3">• Clearly define debate rules and time limits</li>
                <li className="flex items-center gap-3">• Recruit experienced judges and timekeepers</li>
                <li className="flex items-center gap-3">• Provide research materials in advance</li>
                <li className="flex items-center gap-3">• Plan for opening and closing ceremonies</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-sky-600">Execution</h4>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li className="flex items-center gap-3">• Arrange for recording equipment if needed</li>
                <li className="flex items-center gap-3">• Have backup motions prepared</li>
                <li className="flex items-center gap-3">• Provide feedback sessions for participants</li>
                <li className="flex items-center gap-3">• Ensure proper venue setup with timing devices</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DebateClubEventCreation;