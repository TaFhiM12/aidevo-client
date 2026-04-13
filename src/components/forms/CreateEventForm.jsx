import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Upload, 
  Users, 
  PlusCircle, 
  DollarSign,
  Tag,
  Eye,
  Mail,
  Phone,
  Building,
  Users2,
  Target,
  FileText,
  Sparkles
} from "lucide-react";

export default function CreateEventForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    shortDesc: "",
    longDesc: "",
    organization: "",
    
    // Event Type & Category
    type: "on-campus",
    category: "academic",
    location: "",
    
    // Date & Time
    startAt: "",
    endAt: "",
    registrationDeadline: "",
    
    // Registration Details
    registrationRequired: false,
    maxCapacity: "",
    fee: "0",
    
    // Contact & Organization
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    
    // Additional Details
    tags: "",
    visibility: "public",
    cover: null,
    requirements: "",
    targetAudience: "all-students"
  });

  const organizationTypes = [
    "Debating Club",
    "Photographic Society", 
    "Blood Bank",
    "Charitable Organization",
    "Islamic Knowledge Society",
    "Cultural Club",
    "Sports Club",
    "Academic Society",
    "Student Government",
    "Other"
  ];

  const eventCategories = [
    { value: "academic", label: "Academic" },
    { value: "cultural", label: "Cultural" },
    { value: "sports", label: "Sports" },
    { value: "social", label: "Social" },
    { value: "religious", label: "Religious" },
    { value: "charity", label: "Charity" },
    { value: "workshop", label: "Workshop" },
    { value: "seminar", label: "Seminar" },
    { value: "competition", label: "Competition" },
    { value: "blood-donation", label: "Blood Donation" }
  ];

  const targetAudiences = [
    { value: "all-students", label: "All Students" },
    { value: "faculty-only", label: "Faculty Only" },
    { value: "first-year", label: "First Year Students" },
    { value: "postgraduate", label: "Postgraduate Students" },
    { value: "club-members", label: "Club Members Only" },
    { value: "women-only", label: "Women Only" },
    { value: "men-only", label: "Men Only" },
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=" mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] text-white p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Event</h1>
            <p className="text-blue-100 text-sm mt-1">
              Fill in the details to create an amazing event for your organization
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Organization & Basic Information */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#4bbeff] rounded-lg">
              <Building className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Organization & Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Organization */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Organizing Body *
              </label>
              <select
                name="organization"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                value={formData.organization}
                onChange={handleChange}
                required
              >
                <option value="">Select Organization</option>
                {organizationTypes.map(org => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
            </div>

            {/* Event Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Event Category *
              </label>
              <select
                name="category"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {eventCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Event Title */}
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
              placeholder="e.g., Intra-University Debate Championship 2024"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Short Description *
              </label>
              <textarea
                name="shortDesc"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white resize-none h-20"
                placeholder="Brief overview of your event (appears in event cards)"
                value={formData.shortDesc}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Detailed Description
              </label>
              <textarea
                name="longDesc"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white resize-none h-28"
                placeholder="Full event description, agenda, rules, benefits, etc."
                value={formData.longDesc}
                onChange={handleChange}
              />
            </div>
          </div>
        </motion.section>

        {/* Date, Time & Location */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#4bbeff] rounded-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Date, Time & Location</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar size={14} /> Start Date & Time *
              </label>
              <input
                type="datetime-local"
                name="startAt"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                value={formData.startAt}
                onChange={handleChange}
                required
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock size={14} /> End Date & Time *
              </label>
              <input
                type="datetime-local"
                name="endAt"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                value={formData.endAt}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Event Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <select
                name="type"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="on-campus">On-campus</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
                <option value="off-campus">Off-campus</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin size={14} /> Venue / Link *
              </label>
              <input
                type="text"
                name="location"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                placeholder="Main Auditorium or Zoom Meeting Link"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </motion.section>

        {/* Registration & Fees */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#4bbeff] rounded-lg">
              <Users2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Registration & Fees</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration Required */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
              <input
                type="checkbox"
                name="registrationRequired"
                className="checkbox checkbox-primary checkbox-sm"
                checked={formData.registrationRequired}
                onChange={handleChange}
              />
              <div>
                <span className="block text-sm font-medium text-gray-700">Registration Required</span>
                <span className="text-xs text-gray-500">Attendees need to register beforehand</span>
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Target size={14} /> Target Audience
              </label>
              <select
                name="targetAudience"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                value={formData.targetAudience}
                onChange={handleChange}
              >
                {targetAudiences.map(audience => (
                  <option key={audience.value} value={audience.value}>{audience.label}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.registrationRequired && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Max Capacity
                </label>
                <input
                  type="number"
                  name="maxCapacity"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                  placeholder="100"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign size={14} /> Participation Fee
                </label>
                <input
                  type="number"
                  name="fee"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.fee}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </motion.section>

        {/* Contact Information */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#4bbeff] rounded-lg">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Contact Person
              </label>
              <input
                type="text"
                name="contactName"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                placeholder="John Doe"
                value={formData.contactName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="contactEmail"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                placeholder="contact@organization.edu"
                value={formData.contactEmail}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone size={14} /> Phone Number
              </label>
              <input
                type="tel"
                name="contactPhone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                placeholder="+1 234 567 8900"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </div>
          </div>
        </motion.section>

        {/* Additional Details */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#4bbeff] rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Additional Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visibility */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Eye size={14} /> Visibility
              </label>
              <select
                name="visibility"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                value={formData.visibility}
                onChange={handleChange}
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="university">University Members Only</option>
                <option value="organization">Organization Members Only</option>
                <option value="private">Private - By invitation only</option>
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Tag size={14} /> Tags
              </label>
              <input
                type="text"
                name="tags"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white"
                placeholder="debate, competition, public-speaking"
                value={formData.tags}
                onChange={handleChange}
              />
              <span className="text-xs text-gray-500">Separate tags with commas</span>
            </div>
          </div>

          {/* Special Requirements */}
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText size={14} /> Special Requirements
            </label>
            <textarea
              name="requirements"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white resize-none h-20"
              placeholder="Any special requirements, equipment needed, dress code, etc."
              value={formData.requirements}
              onChange={handleChange}
            />
          </div>
        </motion.section>

        {/* Media Upload */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#4bbeff] rounded-lg">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Event Cover Image</h2>
          </div>

          <div className="space-y-4">
            <input
              type="file"
              name="cover"
              accept="image/*"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4bbeff] focus:border-[#4bbeff] transition-all duration-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4bbeff] file:text-white hover:file:bg-[#3aa8e6]"
              onChange={handleChange}
            />
            <span className="text-sm text-gray-500 block">
              Recommended: 1200x600px, JPG/PNG format (Max: 5MB)
            </span>
            
            {formData.cover && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4"
              >
                <img
                  src={URL.createObjectURL(formData.cover)}
                  alt="Cover preview"
                  className="rounded-lg w-full max-h-64 object-cover border border-gray-200 shadow-sm"
                />
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
          type="submit"
        >
          <Users className="w-5 h-5" />
          Create Event
        </motion.button>
      </form>
    </motion.div>
  );
}