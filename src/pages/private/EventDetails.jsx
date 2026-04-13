import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  Bookmark,
  Building,
  Tag,
  Phone,
  Mail,
  User,
  DollarSign,
  Target,
  Eye,
  ChevronRight,
  Star,
  Users2,
  Clock4,
  AlertCircle,
  X,
  CreditCard,
} from "lucide-react";
import API from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendanceSubmitting, setAttendanceSubmitting] = useState(false);
  const [studentPayments, setStudentPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    fetchEventDetails();
    fetchRelatedEvents();
  }, [id]);

  useEffect(() => {
    const fetchStudentPayments = async () => {
      if (!user?.uid) return;
      try {
        const response = await API.get(`/payments/student/${user.uid}`);
        setStudentPayments(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        setStudentPayments([]);
      }
    };

    fetchStudentPayments();
  }, [user?.uid, id]);

  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      if (!user?.uid || !id) {
        setIsRegistered(false);
        return;
      }

      try {
        const response = await API.get(`/events/${id}/attendance-status`);
        setIsRegistered(Boolean(response?.data?.isAttending));
      } catch (error) {
        setIsRegistered(false);
      }
    };

    fetchAttendanceStatus();
  }, [user?.uid, id]);

  const fetchEventDetails = async () => {
  try {
    const response = await API.get(`/events/${id}`);
    

    if (response.success) {
      setEvent(response.data);
    } else {
      setEvent(null);
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    setEvent(null);
  } finally {
    setLoading(false);
  }
};

const fetchRelatedEvents = async () => {
  try {
    const response = await API.get(`/events/${id}/related`);

    if (response.success) {
      setRelatedEvents(Array.isArray(response.data) ? response.data : []);
    } else {
      setRelatedEvents([]);
    }
  } catch (error) {
    console.error("Error fetching related events:", error);
    setRelatedEvents([]);
  }
};

  const isPaidEvent = Number(event?.fee || 0) > 0;
  const hasPaidForEvent = studentPayments.some(
    (payment) => String(payment.eventId) === String(id) && payment.status === "succeeded"
  );
  const latestPaymentForEvent = studentPayments.find(
    (payment) => String(payment.eventId) === String(id) && payment.status === "succeeded"
  );

  const downloadReceiptPdfStyle = (payment) => {
    if (!payment) return;

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${payment.transactionId}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; padding: 24px; margin: 0; }
      .card { max-width: 720px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
      .head { background: linear-gradient(135deg,#0369a1,#0891b2); color: #fff; padding: 20px; }
      .body { padding: 20px; }
      .row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px dashed #e2e8f0; }
      .row:last-child { border-bottom:none; }
      .label { color:#64748b; }
      .value { font-weight:600; color:#0f172a; }
      @media print { body { background: #fff; padding: 0; } .card { border:none; border-radius:0; } }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="head">
        <h2 style="margin:0">Payment Receipt</h2>
        <p style="margin:8px 0 0 0;opacity:.9">Aidevo Event Registration</p>
      </div>
      <div class="body">
        <div class="row"><span class="label">Event</span><span class="value">${payment.eventTitle}</span></div>
        <div class="row"><span class="label">Transaction ID</span><span class="value">${payment.transactionId}</span></div>
        <div class="row"><span class="label">Amount</span><span class="value">BDT ${Number(payment.amount || 0).toLocaleString()}</span></div>
        <div class="row"><span class="label">Status</span><span class="value">${payment.status}</span></div>
        <div class="row"><span class="label">Paid At</span><span class="value">${new Date(payment.paidAt).toLocaleString()}</span></div>
      </div>
    </div>
    <script>window.onload = () => window.print();</script>
  </body>
</html>`;

    const popup = window.open("", "_blank", "width=880,height=720");
    if (!popup) return;
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  };

  const handleRegister = async () => {
    if (!user?.uid) {
      navigate("/signin");
      return;
    }

    if (isPaidEvent && !hasPaidForEvent) {
      setShowPaymentModal(true);
      return;
    }

    try {
      setAttendanceSubmitting(true);
      const response = await API.post(`/events/${id}/attend`, {});
      setIsRegistered(true);
      toast.success(response?.message || "Attendance confirmed");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to register for this event");
    } finally {
      setAttendanceSubmitting(false);
    }
  };

  const handleCheckoutPayment = async (e) => {
    e.preventDefault();

    if (!event) return;

    try {
      setPaymentError("");
      setPaymentLoading(true);

      const digits = paymentForm.cardNumber.replace(/\D/g, "");
      if (digits.length < 12) {
        throw new Error("Please enter a valid card number");
      }

      await API.post("/payments/checkout", {
        eventId: id,
        amount: Number(event.fee || 0),
        cardLast4: digits.slice(-4),
      });

      const response = await API.get(`/payments/student/${user.uid}`);
      setStudentPayments(Array.isArray(response?.data) ? response.data : []);
      setIsRegistered(true);
      setShowPaymentModal(false);
      setPaymentForm({ cardNumber: "", cardHolder: "", expiry: "", cvv: "" });
    } catch (error) {
      setPaymentError(
        typeof error === "string" ? error : "Payment could not be completed"
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: "from-blue-500 to-cyan-500",
      cultural: "from-purple-500 to-pink-500",
      sports: "from-green-500 to-emerald-500",
      social: "from-orange-500 to-red-500",
      religious: "from-indigo-500 to-purple-500",
      charity: "from-rose-500 to-red-500",
      workshop: "from-amber-500 to-orange-500",
      seminar: "from-teal-500 to-cyan-500",
      competition: "from-violet-500 to-purple-500",
      "blood-donation": "from-red-500 to-rose-500",
    };
    return colors[category] || "from-gray-500 to-gray-700";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      academic: "📚",
      cultural: "🎭",
      sports: "⚽",
      social: "🎉",
      religious: "🕌",
      charity: "🤝",
      workshop: "🔧",
      seminar: "💡",
      competition: "🏆",
      "blood-donation": "💉",
    };
    return icons[category] || "🎯";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20 px-4">
        <div className="max-w-6xl mx-auto text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/events")}
            className="bg-gradient-to-r from-[#4bbeff] to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8"
        >
          {/* Event Cover Image */}
          <div className="relative h-80 md:h-96 overflow-hidden">
            {event.cover ? (
              <img
                src={event.cover}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${getCategoryColor(event.category)} flex items-center justify-center`}
              >
                <span className="text-6xl">
                  {getCategoryIcon(event.category)}
                </span>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Header Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getCategoryColor(event.category)} backdrop-blur-sm`}
                >
                  {event.category.replace("-", " ")}
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {event.organization}
                </span>
                {isUpcoming(event.startAt) && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-500 backdrop-blur-sm flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Upcoming Event
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {event.title}
              </h1>

              <p className="text-xl text-white/90 max-w-3xl leading-relaxed">
                {event.shortDesc}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors duration-200">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors duration-200">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors duration-200">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(event.startAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold text-gray-900">
                  {formatTime(event.startAt)} - {formatTime(event.endAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {event.type} • {event.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Users2 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Capacity</p>
                <p className="font-semibold text-gray-900">
                  {event.maxCapacity || "Unlimited"} spots
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-8">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-6 py-3 font-semibold border-b-2 transition-colors duration-200 ${
                    activeTab === "details"
                      ? "border-[#4bbeff] text-[#4bbeff]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Event Details
                </button>
                <button
                  onClick={() => setActiveTab("registration")}
                  className={`px-6 py-3 font-semibold border-b-2 transition-colors duration-200 ${
                    activeTab === "registration"
                      ? "border-[#4bbeff] text-[#4bbeff]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Registration Info
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`px-6 py-3 font-semibold border-b-2 transition-colors duration-200 ${
                    activeTab === "contact"
                      ? "border-[#4bbeff] text-[#4bbeff]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Contact & Support
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "details" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      About This Event
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {event.longDesc || event.shortDesc}
                    </p>
                  </div>

                  {event.requirements && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Requirements & Guidelines
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {event.requirements}
                      </p>
                    </div>
                  )}

                  {event.tags && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-blue-500" />
                        Tags & Topics
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(event.tags) ? event.tags : event.tags.split(",")).map((tag, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "registration" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Registration Information
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Registration Required:
                        </span>
                        <span
                          className={`font-semibold ${event.registrationRequired ? "text-green-600" : "text-gray-600"}`}
                        >
                          {event.registrationRequired ? "Yes" : "No"}
                        </span>
                      </div>

                      {event.registrationRequired && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Max Capacity:</span>
                            <span className="font-semibold text-gray-900">
                              {event.maxCapacity} people
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">
                              Registration Deadline:
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatDate(event.registrationDeadline)} at{" "}
                              {formatTime(event.registrationDeadline)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">
                              Participation Fee:
                            </span>
                            <span className="font-semibold text-gray-900 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {parseFloat(event.fee) > 0 ? `BDT ${event.fee}` : "Free"}
                            </span>
                          </div>

                          {parseFloat(event.fee) > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Payment Status:</span>
                              <span className={`font-semibold ${hasPaidForEvent ? "text-emerald-600" : "text-amber-600"}`}>
                                {hasPaidForEvent ? "Paid" : "Pending"}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Target Audience
                    </h4>
                    <p className="text-gray-700">
                      This event is open to:{" "}
                      <span className="font-semibold">
                        {event.targetAudience?.replace("-", " ") ||
                          "All students"}
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "contact" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Event Coordinator
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">
                          {event.contactName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <a
                          href={`mailto:${event.contactEmail}`}
                          className="text-blue-600 hover:underline"
                        >
                          {event.contactEmail}
                        </a>
                      </div>

                      {event.contactPhone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <a
                            href={`tel:${event.contactPhone}`}
                            className="text-gray-700 hover:text-blue-600"
                          >
                            {event.contactPhone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Building className="w-5 h-5 text-orange-600" />
                      Organizing Body
                    </h4>
                    <p className="text-gray-700">
                      This event is organized by{" "}
                      <span className="font-semibold">
                        {event.organization}
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Registration Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-gradient-to-br from-[#4bbeff] to-blue-500 rounded-2xl p-6 text-white shadow-xl">
                  <h3 className="text-xl font-bold mb-4">Join This Event</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock4 className="w-5 h-5" />
                      <span>{formatDate(event.startAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span className="capitalize">{event.type}</span>
                    </div>
                    {event.registrationRequired && event.maxCapacity && (
                      <div className="flex items-center gap-2">
                        <Users2 className="w-5 h-5" />
                        <span>{event.maxCapacity} spots available</span>
                      </div>
                    )}
                  </div>

                  {isRegistered ? (
                    <div className="bg-green-500/20 border border-green-400 rounded-xl p-4 text-center">
                        <p className="font-semibold">You're Registered!</p>
                      <p className="text-sm opacity-90 mt-1">
                          Your attendance is saved in the system.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                        disabled={!isUpcoming(event.startAt) || attendanceSubmitting}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                          isUpcoming(event.startAt) && !attendanceSubmitting
                          ? "bg-white text-blue-600 hover:shadow-2xl hover:scale-105"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                        {attendanceSubmitting
                          ? "Saving..."
                          : isUpcoming(event.startAt)
                        ? event.registrationRequired
                          ? isPaidEvent && !hasPaidForEvent
                            ? `Pay BDT ${event.fee} & Register`
                            : "Register Now"
                          : "Mark Attendance"
                        : "Event Ended"}
                    </button>
                  )}

                  {event.registrationRequired && event.registrationDeadline && (
                    <p className="text-white/80 text-sm text-center mt-3">
                      Register before {formatDate(event.registrationDeadline)}
                    </p>
                  )}

                  {hasPaidForEvent && latestPaymentForEvent && (
                    <button
                      onClick={() => downloadReceiptPdfStyle(latestPaymentForEvent)}
                      className="w-full mt-3 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-medium"
                    >
                      Download Payment Receipt
                    </button>
                  )}
                </div>

                {/* Share Section */}
                <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Share This Event
                  </h4>
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-blue-100 text-blue-600 rounded-xl font-semibold hover:bg-blue-200 transition-colors duration-200">
                      Facebook
                    </button>
                    <button className="flex-1 py-3 bg-blue-400 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors duration-200">
                      Twitter
                    </button>
                    <button className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors duration-200">
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Events Section */}
        {relatedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Related Events
              </h2>
              <Link
                to="/events"
                className="flex items-center gap-2 text-[#4bbeff] hover:text-blue-600 font-semibold"
              >
                View All Events
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedEvents.map((relatedEvent) => (
                <div
                  key={relatedEvent._id}
                  className="bg-gray-50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/events/${relatedEvent._id}`)}
                >
                  <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-3 group-hover:scale-105 transition-transform duration-300" />
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#4bbeff] transition-colors">
                    {relatedEvent.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {relatedEvent.shortDesc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Secure Payment Checkout</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCheckoutPayment} className="p-5 space-y-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Amount</p>
                    <p className="font-semibold text-slate-900">BDT {Number(event?.fee || 0).toLocaleString()}</p>
                  </div>
                  <CreditCard className="w-6 h-6 text-sky-600" />
                </div>

                <input
                  value={paymentForm.cardHolder}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, cardHolder: e.target.value }))}
                  placeholder="Card holder name"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5"
                  required
                />
                <input
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="Card number"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5"
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={paymentForm.expiry}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, expiry: e.target.value }))}
                    placeholder="MM/YY"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5"
                    required
                  />
                  <input
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, cvv: e.target.value }))}
                    placeholder="CVV"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5"
                    required
                  />
                </div>

                {paymentError && (
                  <p className="text-sm text-red-600">{paymentError}</p>
                )}

                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
                >
                  {paymentLoading ? "Processing..." : "Complete Payment"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
