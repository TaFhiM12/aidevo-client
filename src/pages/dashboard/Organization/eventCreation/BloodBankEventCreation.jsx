import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  Heart,
  Stethoscope,
  Droplets,
} from "lucide-react";
import { uploadToCloudinary } from "../../../../utils/uploadToCloudinary";
import useAuth from "../../../../hooks/useAuth";
import useUserRole from "../../../../hooks/useUserRole";
import API from "../../../../utils/api";

const BloodBankEventCreation = () => {
  const { user } = useAuth();
  const { userInfo } = useUserRole();

  const orgName = userInfo?.organization?.name || "Blood Bank";
  const orgEmail = userInfo?.email || user?.email || "";
  const [formData, setFormData] = useState({
  title: "",
  shortDesc: "",
  longDesc: "",
  organizationEmail: orgEmail,
  organization: orgName,

  type: "on-campus",
  category: "blood-donation",
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

  tags: "blood-donation, healthcare, community-service, life-saving",
  visibility: "public",
  cover: null,
  requirements: "",
  targetAudience: "all-students",

  medicalRequirements: "",
  bloodTypesNeeded: ["All Blood Types"],
  donationDuration: 45,
  medicalStaffCount: "",
  equipmentProvided: [],
  postDonationCare: true,
  eligibilityCriteria: "",
});

  const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "All Blood Types"];
  const equipmentOptions = [
    "Donation Beds", "Blood Bags", "Needles & Tubes", "Blood Pressure Monitors", 
    "Hemoglobin Testers", "First Aid Kit", "Refreshments", "Medical Screening Area"
  ];

  const targetAudiences = [
    { value: "all-students", label: "All Students" },
    { value: "faculty-only", label: "Faculty Only" },
    { value: "staff-only", label: "Staff Only" },
    { value: "public", label: "General Public" }
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

  const handleBloodTypeChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, bloodTypesNeeded: selectedOptions }));
  };

  const handleEquipmentToggle = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipmentProvided: prev.equipmentProvided.includes(equipment)
        ? prev.equipmentProvided.filter(item => item !== equipment)
        : [...prev.equipmentProvided, equipment]
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const submitToast = toast.loading("Creating blood donation event...");

  try {
    if (!formData.medicalRequirements) {
      toast.error("Please specify medical requirements for blood donation events", { id: submitToast });
      return;
    }

    if (!formData.medicalStaffCount) {
      toast.error("Please specify the number of medical staff available", { id: submitToast });
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
      organizationType: "blood-bank",
      specialRequirements: {
        medicalRequirements: formData.medicalRequirements,
        bloodTypesNeeded: formData.bloodTypesNeeded,
        donationDuration: formData.donationDuration,
        medicalStaffCount: formData.medicalStaffCount,
        equipmentProvided: formData.equipmentProvided,
        postDonationCare: formData.postDonationCare,
        eligibilityCriteria: formData.eligibilityCriteria,
      },
    };

    const res = await API.post("/events", eventData);

    if (res.success) {
      toast.success("Blood donation event created successfully", { id: submitToast });

      setFormData((prev) => ({
        ...prev,
        title: "",
        shortDesc: "",
        longDesc: "",
        organizationEmail: orgEmail,
        organization: orgName,
        type: "on-campus",
        category: "blood-donation",
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
        tags: "blood-donation, healthcare, community-service, life-saving",
        visibility: "public",
        cover: null,
        requirements: "",
        targetAudience: "all-students",
        medicalRequirements: "",
        bloodTypesNeeded: ["All Blood Types"],
        donationDuration: 45,
        medicalStaffCount: "",
        equipmentProvided: [],
        postDonationCare: true,
        eligibilityCriteria: "",
      }));
    } else {
      throw new Error(res.message || "Failed to create blood donation event");
    }
  } catch (err) {
    console.error(err);
    toast.error(
      err?.response?.data?.message || err?.message || "Failed to create blood donation event",
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
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border-l-8 border-red-500">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="p-4 bg-red-100 rounded-2xl shadow-lg">
                <Droplets className="w-12 h-12 text-red-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-red-700 mb-3">
                  Create Blood Donation Event
                </h1>
                <p className="text-red-600 text-xl font-medium">
                  Organize a life-saving blood donation drive for our community
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
          className="bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Blood Drive Details</h2>
                <p className="text-red-100 text-lg mt-2">
                  Fill in the details for your life-saving blood donation event
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
              className="bg-red-50 rounded-2xl p-8 border border-red-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-600 rounded-xl">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-800">Event Basics</h3>
              </div>

              <div className="space-y-6">
                {/* Event Title */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-red-700">
                    🩸 Blood Drive Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white text-lg shadow-sm"
                    placeholder="e.g., Annual Blood Donation Camp 2024"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-red-700">
                      Short Description *
                    </label>
                    <textarea
                      name="shortDesc"
                      className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white resize-none h-32 shadow-sm"
                      placeholder="Brief overview of your blood donation event..."
                      value={formData.shortDesc}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-red-700">
                      Detailed Information
                    </label>
                    <textarea
                      name="longDesc"
                      className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white resize-none h-32 shadow-sm"
                      placeholder="Full event details, importance of donation, impact on community..."
                      value={formData.longDesc}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Date, Time & Location Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-red-50 rounded-2xl p-8 border border-red-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-600 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-800">Schedule & Venue</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-red-700 flex items-center gap-3">
                    <Calendar className="w-5 h-5" /> Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startAt"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.startAt}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-red-700 flex items-center gap-3">
                    <Clock className="w-5 h-5" /> End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endAt"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.endAt}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-red-700">
                    Event Type
                  </label>
                  <select
                    name="type"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="on-campus">On-campus</option>
                    <option value="off-campus">Off-campus</option>
                    <option value="mobile-unit">Mobile Blood Unit</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-red-700 flex items-center gap-3">
                    <MapPin className="w-5 h-5" /> Donation Venue *
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
                    placeholder="Main Auditorium or Blood Donation Center"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </motion.section>

            {/* Blood Bank Specific Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-red-50 rounded-2xl p-8 border border-red-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-600 rounded-xl">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-800">Medical Requirements</h3>
              </div>

              <div className="space-y-6">
                {/* Medical Requirements */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-red-700">
                    🩺 Medical Screening Process *
                  </label>
                  <textarea
                    name="medicalRequirements"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white resize-none h-32 shadow-sm"
                    placeholder="Describe the medical screening process, health checks, and any specific requirements for donors..."
                    value={formData.medicalRequirements}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Eligibility Criteria */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-red-700">
                    ✅ Donor Eligibility Criteria
                  </label>
                  <textarea
                    name="eligibilityCriteria"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white resize-none h-24 shadow-sm"
                    placeholder="Age requirements, weight limits, health conditions, last donation period, etc."
                    value={formData.eligibilityCriteria}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Blood Types Needed */}
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-red-700">
                      🩸 Blood Types Needed
                    </label>
                    <select
                      multiple
                      value={formData.bloodTypesNeeded}
                      onChange={handleBloodTypeChange}
                      className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white h-40 shadow-sm"
                    >
                      {bloodTypes.map(type => (
                        <option key={type} value={type} className="p-2 hover:bg-red-100">
                          {type}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-red-600 font-medium">
                      Hold Ctrl/Cmd to select multiple blood types
                    </span>
                  </div>

                  {/* Medical Staff & Duration */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="block text-lg font-semibold text-red-700">
                        👨‍⚕️ Number of Medical Staff *
                      </label>
                      <input
                        type="number"
                        name="medicalStaffCount"
                        className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
                        placeholder="e.g., 5"
                        min="1"
                        value={formData.medicalStaffCount}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-lg font-semibold text-red-700">
                        ⏱️ Estimated Donation Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="donationDuration"
                        className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
                        min="15"
                        max="120"
                        value={formData.donationDuration}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Equipment Provided */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-red-700">
                    🏥 Medical Equipment & Facilities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {equipmentOptions.map(equipment => (
                      <label key={equipment} className="flex items-center space-x-3 p-4 border-2 border-red-300 rounded-xl hover:bg-red-100 cursor-pointer transition-all duration-300 bg-white shadow-sm">
                        <input
                          type="checkbox"
                          checked={formData.equipmentProvided.includes(equipment)}
                          onChange={() => handleEquipmentToggle(equipment)}
                          className="checkbox checkbox-error checkbox-lg"
                        />
                        <span className="text-base font-medium text-gray-700">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Post-Donation Care */}
                <div className="flex items-center gap-4 p-6 bg-red-100 rounded-xl border-2 border-red-300">
                  <input
                    type="checkbox"
                    name="postDonationCare"
                    checked={formData.postDonationCare}
                    onChange={handleChange}
                    className="checkbox checkbox-error checkbox-lg"
                  />
                  <div>
                    <span className="block text-lg font-semibold text-red-700">Provide Post-Donation Care</span>
                    <span className="text-red-600 font-medium">Refreshments, rest area, and aftercare instructions</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Registration & Capacity Section */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-red-50 rounded-2xl p-8 border border-red-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-600 rounded-xl">
                  <Users2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-800">Registration & Capacity</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Target Audience */}
                  <div className="space-y-3">
                    <label className="text-lg font-semibold text-red-700 flex items-center gap-3">
                      <Target className="w-5 h-5" /> Target Audience
                    </label>
                    <select
                      name="targetAudience"
                      className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
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
                    <label className="block text-lg font-semibold text-red-700">
                      Maximum Donors
                    </label>
                    <input
                      type="number"
                      name="maxCapacity"
                      className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
                      placeholder="100"
                      value={formData.maxCapacity}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Registration Deadline */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-red-700">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
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
              transition={{ delay: 0.7 }}
              className="bg-red-50 rounded-2xl p-8 border border-red-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-600 rounded-xl">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-800">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-red-700">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
                    placeholder="Medical Coordinator Name"
                    value={formData.contactName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-red-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
                    placeholder="medical@bloodbank.edu"
                    value={formData.contactEmail}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-red-700 flex items-center gap-3">
                    <Phone className="w-5 h-5" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm"
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
              transition={{ delay: 0.8 }}
              className="bg-red-50 rounded-2xl p-8 border border-red-200"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-600 rounded-xl">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-800">Event Cover Image</h3>
              </div>

              <div className="space-y-4">
                <input
                  type="file"
                  name="cover"
                  accept="image/*"
                  className="w-full px-6 py-4 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-lg file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-700 shadow-sm"
                  onChange={handleChange}
                />
                <span className="text-base text-red-600 font-medium block">
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
                      className="rounded-2xl w-full max-h-80 object-cover border-2 border-red-300 shadow-lg"
                    />
                  </motion.div>
                )}
              </div>
            </motion.section>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 px-8 rounded-2xl font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center gap-4"
              type="submit"
            >
              <Heart className="w-8 h-8" />
              Create Blood Donation Event
            </motion.button>
          </form>
        </motion.div>

        {/* Blood Donation Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 bg-white rounded-3xl shadow-2xl border border-red-200 p-8"
        >
          <h3 className="text-3xl font-bold text-red-700 mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Blood Donation Event Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-red-600">Medical Requirements</h4>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li className="flex items-center gap-3">• Ensure adequate medical staff and equipment</li>
                <li className="flex items-center gap-3">• Provide refreshments for donors after donation</li>
                <li className="flex items-center gap-3">• Schedule 15-minute breaks between donations</li>
                <li className="flex items-center gap-3">• Have emergency medical protocols in place</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-red-600">Event Planning</h4>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li className="flex items-center gap-3">• Promote the event 2-3 weeks in advance</li>
                <li className="flex items-center gap-3">• Set up comfortable waiting and recovery areas</li>
                <li className="flex items-center gap-3">• Coordinate with hospital/blood bank for storage</li>
                <li className="flex items-center gap-3">• Provide donation certificates to participants</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BloodBankEventCreation;