import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  Award,
  GraduationCap,
  Network,
  Mail,
  Phone,
  User,
} from "lucide-react";

const AssociationEventDetails = ({ event }) => {
  const specialReqs = event.specialRequirements || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
        <p className="text-gray-600">{event.shortDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          {/* Event Basics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-500" />
              Event Basics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(event.startAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
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
                    {event.maxCapacity || 'Unlimited'} participants
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              Professional Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Event Type</p>
                <p className="text-gray-900 font-medium">{specialReqs.eventType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Professional Level</p>
                <p className="text-gray-900 font-medium">{specialReqs.professionalLevel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Membership Requirement</p>
                <p className="text-gray-900 font-medium capitalize">
                  {specialReqs.membershipRequired?.replace('-', ' ')}
                </p>
              </div>
              {specialReqs.industryFocus && (
                <div>
                  <p className="text-sm text-gray-500">Industry Focus</p>
                  <p className="text-gray-900 font-medium">{specialReqs.industryFocus}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Additional Information */}
        <div className="space-y-6">
          {/* Guest Speakers */}
          {specialReqs.guestSpeakers && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Guest Speakers
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{specialReqs.guestSpeakers}</p>
            </div>
          )}

          {/* Professional Features */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              Professional Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Continuing Education Credits</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  specialReqs.ceCredits ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {specialReqs.ceCredits ? `Yes (${specialReqs.creditHours || 0} hours)` : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Networking Session</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  specialReqs.networkingSession ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {specialReqs.networkingSession ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Certification Provided</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  specialReqs.certificationProvided ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {specialReqs.certificationProvided ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(event.contactName || event.contactEmail || event.contactPhone) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
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

export default AssociationEventDetails;