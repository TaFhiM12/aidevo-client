import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Stethoscope,
  Droplets,
  Shield,
  Mail,
  Phone,
  User,
  CheckCircle,
} from "lucide-react";

const SocialServiceEventDetails = ({ event }) => {
  const specialReqs = event.specialRequirements || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
        <p className="text-gray-600">{event.shortDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Medical Requirements */}
        <div className="space-y-6">
          {/* Medical Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-red-500" />
              Medical Requirements
            </h3>
            <div className="space-y-4">
              {specialReqs.medicalRequirements && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Screening Process</p>
                  <p className="text-gray-700 text-sm">{specialReqs.medicalRequirements}</p>
                </div>
              )}
              {specialReqs.eligibilityCriteria && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Eligibility Criteria</p>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{specialReqs.eligibilityCriteria}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Medical Staff</p>
                  <p className="text-gray-900 font-medium">{specialReqs.medicalStaffCount} staff</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Donation Duration</p>
                  <p className="text-gray-900 font-medium">{specialReqs.donationDuration} minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Blood Types Needed */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-red-500" />
              Blood Types Needed
            </h3>
            <div className="flex flex-wrap gap-2">
              {specialReqs.bloodTypesNeeded?.map((type, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Event Details */}
        <div className="space-y-6">
          {/* Event Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              Event Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(event.startAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(event.startAt).toLocaleTimeString()} - {new Date(event.endAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Venue</p>
                  <p className="text-gray-900 font-medium">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="text-gray-900 font-medium">
                    {event.maxCapacity || 'Unlimited'} donors
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment & Facilities */}
          {specialReqs.equipmentProvided?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Equipment & Facilities
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {specialReqs.equipmentProvided.map((equipment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{equipment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post-Donation Care */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Post-Donation Care
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Refreshments & Aftercare</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                specialReqs.postDonationCare ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {specialReqs.postDonationCare ? 'Provided' : 'Not Provided'}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          {(event.contactName || event.contactEmail || event.contactPhone) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-500" />
                Contact Information
              </h3>
              <div className="space-y-3">
                {event.contactName && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{event.contactName}</span>
                  </div>
                )}
                {event.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{event.contactEmail}</span>
                  </div>
                )}
                {event.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{event.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Description */}
      {event.longDesc && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Description</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.longDesc}</p>
        </div>
      )}
    </div>
  );
};

export default SocialServiceEventDetails;