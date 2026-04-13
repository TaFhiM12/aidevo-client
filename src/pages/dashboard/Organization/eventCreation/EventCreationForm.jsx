import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../../../utils/api";
import {
  EVENT_FORM_CONFIG,
  COMMON_EVENT_DEFAULTS,
} from "../../../../config/eventFormConfig";
import { uploadToCloudinary } from "../../../../utils/uploadToCloudinary";
import renderDynamicField from "../../../../components/forms/renderDynamicField";

const EventCreationForm = ({
  organizationType,
  organizationName,
  organizationEmail,
}) => {
  const config = EVENT_FORM_CONFIG[organizationType];

  const initialState = useMemo(() => {
    if (!config) return null;

    const extraDefaults = {};
    for (const field of config.extraFields) {
      if (field.type === "checkbox") extraDefaults[field.name] = false;
      else extraDefaults[field.name] = "";
    }

    return {
      ...COMMON_EVENT_DEFAULTS,
      ...config.defaultValues,
      ...extraDefaults,
      organization: organizationName || "",
      organizationEmail: organizationEmail || "",
      contactEmail: organizationEmail || "",
    };
  }, [config, organizationName, organizationEmail]);

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">
            Unsupported Organization Type
          </h1>
          <p className="text-gray-600">
            No event form config found for this organization type.
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const nextErrors = {};

    const requiredCommon = [
      "title",
      "shortDesc",
      "location",
      "startAt",
      "endAt",
      "organization",
      "organizationEmail",
    ];

    for (const field of requiredCommon) {
      if (!formData[field]) {
        nextErrors[field] = `${field} is required`;
      }
    }

    for (const field of config.extraFields) {
      if (field.required && !formData[field.name]) {
        nextErrors[field.name] = `${field.label} is required`;
      }
    }

    if (
      formData.startAt &&
      formData.endAt &&
      new Date(formData.endAt) <= new Date(formData.startAt)
    ) {
      nextErrors.endAt = "End time must be after start time";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildSpecialRequirements = () => {
    const specialRequirements = {};

    for (const field of config.extraFields) {
      specialRequirements[field.name] = formData[field.name];
    }

    return specialRequirements;
  };

  const resetForm = () => {
    const extraDefaults = {};
    for (const field of config.extraFields) {
      if (field.type === "checkbox") extraDefaults[field.name] = false;
      else extraDefaults[field.name] = "";
    }

    setFormData({
      ...COMMON_EVENT_DEFAULTS,
      ...config.defaultValues,
      ...extraDefaults,
      organization: organizationName || "",
      organizationEmail: organizationEmail || "",
      contactEmail: organizationEmail || "",
    });

    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const submitToast = toast.loading("Creating event...");

    try {
      setSubmitting(true);

      let coverUrl = "";

      if (formData.cover) {
        coverUrl = await uploadToCloudinary(formData.cover);
      }

      const eventPayload = {
        title: formData.title,
        shortDesc: formData.shortDesc,
        longDesc: formData.longDesc,
        organization: organizationName,
        organizationEmail,
        type: formData.type,
        category: formData.category,
        location: formData.location,
        startAt: formData.startAt,
        endAt: formData.endAt,
        registrationDeadline: formData.registrationDeadline,
        registrationRequired: formData.registrationRequired,
        maxCapacity: formData.maxCapacity,
        fee: formData.fee,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        tags: formData.tags,
        visibility: formData.visibility,
        cover: coverUrl,
        requirements: formData.requirements,
        targetAudience: formData.targetAudience,
        organizationType,
        specialRequirements: buildSpecialRequirements(),
      };

      const res = await API.post("/events", eventPayload);

      if (!res.success) {
        throw new Error(res.message || "Failed to create event");
      }

      toast.success("Event created successfully", { id: submitToast });

      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create event",
        { id: submitToast }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h1 className="text-4xl font-bold text-blue-700 mb-3">
            {config.pageTitle}
          </h1>
          <p className="text-gray-600 text-lg">{config.pageDescription}</p>
        </motion.div>

        <div className="bg-white rounded-3xl shadow-xl border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium">Organization</label>
                <input
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Organization Email
                </label>
                <input
                  name="organizationEmail"
                  value={formData.organizationEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium">Start At</label>
                <input
                  type="datetime-local"
                  name="startAt"
                  value={formData.startAt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">End At</label>
                <input
                  type="datetime-local"
                  name="endAt"
                  value={formData.endAt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
                {errors.endAt && (
                  <p className="mt-1 text-sm text-red-500">{errors.endAt}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Max Capacity</label>
                <input
                  type="number"
                  name="maxCapacity"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Fee</label>
                <input
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Target Audience</label>
                <input
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Category</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                >
                  <option value="on-campus">On-campus</option>
                  <option value="online">Online</option>
                  <option value="off-campus">Off-campus</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">
                  Short Description
                </label>
                <textarea
                  name="shortDesc"
                  value={formData.shortDesc}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl"
                />
                {errors.shortDesc && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.shortDesc}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">
                  Detailed Description
                </label>
                <textarea
                  name="longDesc"
                  value={formData.longDesc}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">Tags</label>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Contact Name</label>
                <input
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Contact Email</label>
                <input
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Contact Phone</label>
                <input
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Visibility</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="registrationRequired"
                  checked={formData.registrationRequired}
                  onChange={handleChange}
                  className="h-5 w-5"
                />
                <label className="font-medium">Registration Required</label>
              </div>

              <div>
                <label className="block mb-2 font-medium">Cover Image</label>
                <input
                  type="file"
                  name="cover"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>
            </section>

            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Custom Fields
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.extraFields.map((field) => (
                  <div
                    key={field.name}
                    className={field.type === "textarea" ? "md:col-span-2" : ""}
                  >
                    {renderDynamicField({
                      field,
                      value: formData[field.name],
                      onChange: handleChange,
                      error: errors[field.name],
                    })}
                  </div>
                ))}
              </div>
            </section>

            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Creating Event..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventCreationForm;