import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Mic,
  Trophy,
  Scale,
  Gavel,
  Mail,
  Phone,
  User,
} from "lucide-react";

const ClubEventDetails = ({ event }) => {
  const specialReqs = event.specialRequirements || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
        <p className="text-gray-600">{event.shortDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Debate Format */}
        <div className="space-y-6">
          {/* Debate Format */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-500" />
              Debate Format
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Format</p>
                <p className="text-gray-900 font-medium">{specialReqs.debateFormat}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Team Size</p>
                <p className="text-gray-900 font-medium">
                  {specialReqs.teamSize === '1' ? 'Individual' : `${specialReqs.teamSize} members per team`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Skill Level</p>
                <p className="text-gray-900 font-medium capitalize">{specialReqs.skillLevel}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Preparation Time</p>
                  <p className="text-gray-900 font-medium">{specialReqs.preparationTime} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Speech Duration</p>
                  <p className="text-gray-900 font-medium">{specialReqs.speechDuration} minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Motion Topics */}
          {specialReqs.motionTopics && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-500" />
                Debate Topics
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{specialReqs.motionTopics}</p>
            </div>
          )}
        </div>

        {/* Right Column - Competition Details */}
        <div className="space-y-6">
          {/* Event Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
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
                    {event.maxCapacity || 'Unlimited'} teams
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Adjudication & Prizes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              Adjudication & Awards
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Number of Adjudicators</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {specialReqs.adjudicatorsCount}
                </span>
              </div>
              {specialReqs.judgingCriteria && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Judging Criteria</p>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{specialReqs.judgingCriteria}</p>
                </div>
              )}
              {specialReqs.prizeDetails && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Prizes & Awards</p>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{specialReqs.prizeDetails}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(event.contactName || event.contactEmail || event.contactPhone) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-500" />
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

export default ClubEventDetails;