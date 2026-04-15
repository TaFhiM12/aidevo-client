import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  HeartPulse,
  MapPin,
  LocateFixed,
  Phone,
  User,
  Droplets,
  AlertCircle,
  Filter,
  ShieldCheck,
  Hospital,
  Search,
  Siren,
  Clock3,
  Users,
  ListFilter,
  RefreshCcw,
  Copy,
  PhoneCall,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../utils/api";
import useUserRole from "../../hooks/useUserRole";
import useInfiniteScrollSlice from "../../hooks/useInfiniteScrollSlice";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = ["critical", "high", "medium"];
const URGENCY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
};

const URGENCY_BADGE_STYLES = {
  critical: "bg-red-600 text-white",
  high: "bg-amber-500 text-white",
  medium: "bg-sky-600 text-white",
};

const BLOOD_BANK_TABS = ["emergency", "forms", "donors", "admin"];

const normalizeTab = (tab, isAdmin) => {
  if (!tab || !BLOOD_BANK_TABS.includes(tab)) {
    return "emergency";
  }

  if (tab === "admin" && !isAdmin) {
    return "emergency";
  }

  return tab;
};

const toRadians = (degree) => (degree * Math.PI) / 180;

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const buildMapEmbedUrl = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const bbox = `${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
};

const formatTimeAgo = (dateLike) => {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "just now";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const BloodBank = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userInfo } = useUserRole();
  const isAdmin = userInfo?.role === "super-admin" || userInfo?.role === "superAdmin";
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [sortMode, setSortMode] = useState("latest");
  const [donorSearch, setDonorSearch] = useState("");
  const [viewerLocation, setViewerLocation] = useState({ latitude: null, longitude: null });
  const activeSection = useMemo(
    () => normalizeTab(searchParams.get("tab"), isAdmin),
    [searchParams, isAdmin]
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
    address: "",
    note: "",
    latitude: "",
    longitude: "",
  });

  const [requestForm, setRequestForm] = useState({
    patientName: "",
    phone: "",
    bloodGroup: "",
    hospitalAddress: "",
    note: "",
    urgencyLevel: "high",
    latitude: "",
    longitude: "",
  });

  const mapReady = useMemo(
    () =>
      form.latitude &&
      form.longitude &&
      !Number.isNaN(Number(form.latitude)) &&
      !Number.isNaN(Number(form.longitude)),
    [form.latitude, form.longitude]
  );

  const requestMapReady = useMemo(
    () =>
      requestForm.latitude &&
      requestForm.longitude &&
      !Number.isNaN(Number(requestForm.latitude)) &&
      !Number.isNaN(Number(requestForm.longitude)),
    [requestForm.latitude, requestForm.longitude]
  );

  const mapEmbedUrl = useMemo(
    () => (mapReady ? buildMapEmbedUrl(form.latitude, form.longitude) : ""),
    [mapReady, form.latitude, form.longitude]
  );

  const requestMapEmbedUrl = useMemo(
    () =>
      requestMapReady
        ? buildMapEmbedUrl(requestForm.latitude, requestForm.longitude)
        : "",
    [requestMapReady, requestForm.latitude, requestForm.longitude]
  );

  const {
    data: donors = [],
    isLoading: donorsLoading,
  } = useQuery({
    queryKey: ["blood-bank-donors"],
    queryFn: async () => {
      const response = await API.get("/blood-bank/donors?limit=20");
      return Array.isArray(response?.data) ? response.data : [];
    },
  });

  const {
    data: urgentRequests = [],
    isLoading: requestsLoading,
    refetch: refetchUrgentRequests,
  } = useQuery({
    queryKey: ["blood-bank-urgent-requests"],
    queryFn: async () => {
      const response = await API.get("/blood-bank/requests?limit=20");
      return Array.isArray(response?.data) ? response.data : [];
    },
    refetchInterval: 25000,
  });

  const {
    data: moderationQueue = { pendingDonors: [], urgentRequests: [] },
    isLoading: moderationQueueLoading,
  } = useQuery({
    queryKey: ["blood-bank-moderation-queue", isAdmin],
    enabled: isAdmin,
    queryFn: async () => {
      const response = await API.get("/blood-bank/admin/queue");
      return {
        pendingDonors: Array.isArray(response?.data?.pendingDonors)
          ? response.data.pendingDonors
          : [],
        urgentRequests: Array.isArray(response?.data?.urgentRequests)
          ? response.data.urgentRequests
          : [],
      };
    },
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRequestChange = (key, value) => {
    setRequestForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUseCurrentLocation = (mode = "donor") => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      return;
    }

    const toastId = mode === "donor" ? "geo-donor" : mode === "request" ? "geo-request" : "geo-nearby";
    toast.loading("Detecting location...", { id: toastId });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        if (mode === "donor") {
          setForm((prev) => ({ ...prev, latitude: String(lat), longitude: String(lng) }));
        } else if (mode === "request") {
          setRequestForm((prev) => ({ ...prev, latitude: String(lat), longitude: String(lng) }));
        } else {
          setViewerLocation({ latitude: lat, longitude: lng });
          setSortMode("nearest");
        }

        toast.success("Location detected", { id: toastId });
      },
      () => {
        toast.error("Could not detect location", { id: toastId });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitDonor = async (e) => {
    e.preventDefault();

    if (!mapReady) {
      toast.error("Please provide a valid map location");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/blood-bank/donors", {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });

      toast.success(response?.message || "Donor information submitted");
      setForm({
        name: "",
        phone: "",
        bloodGroup: "",
        address: "",
        note: "",
        latitude: "",
        longitude: "",
      });
      queryClient.invalidateQueries({ queryKey: ["blood-bank-donors"] });
      queryClient.invalidateQueries({ queryKey: ["blood-bank-moderation-queue"] });
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to submit donor info");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUrgentRequest = async (e) => {
    e.preventDefault();

    if (!requestMapReady) {
      toast.error("Please provide valid hospital location");
      return;
    }

    try {
      setRequestLoading(true);
      const response = await API.post("/blood-bank/requests", {
        ...requestForm,
        latitude: Number(requestForm.latitude),
        longitude: Number(requestForm.longitude),
      });

      toast.success(response?.message || "Urgent request submitted");
      setRequestForm({
        patientName: "",
        phone: "",
        bloodGroup: "",
        hospitalAddress: "",
        note: "",
        urgencyLevel: "high",
        latitude: "",
        longitude: "",
      });
      queryClient.invalidateQueries({ queryKey: ["blood-bank-urgent-requests"] });
      queryClient.invalidateQueries({ queryKey: ["blood-bank-moderation-queue"] });
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to submit urgent request");
    } finally {
      setRequestLoading(false);
    }
  };

  const filteredDonors = useMemo(() => {
    let list = [...donors];
    const searchText = donorSearch.trim().toLowerCase();

    if (selectedBloodGroup !== "all") {
      list = list.filter((donor) => donor.bloodGroup === selectedBloodGroup);
    }

    if (searchText) {
      list = list.filter((donor) => {
        const haystack = `${donor.name || ""} ${donor.address || ""}`.toLowerCase();
        return haystack.includes(searchText);
      });
    }

    if (
      sortMode === "nearest" &&
      viewerLocation.latitude !== null &&
      viewerLocation.longitude !== null
    ) {
      list = list
        .map((donor) => ({
          ...donor,
          _distanceKm: calculateDistanceKm(
            viewerLocation.latitude,
            viewerLocation.longitude,
            Number(donor.latitude),
            Number(donor.longitude)
          ),
        }))
        .sort((a, b) => a._distanceKm - b._distanceKm);
    } else {
      list = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [
    donors,
    donorSearch,
    selectedBloodGroup,
    sortMode,
    viewerLocation.latitude,
    viewerLocation.longitude,
  ]);

  const prioritizedRequests = useMemo(() => {
    let list = [...urgentRequests]
      .sort((a, b) => {
        const urgencyDelta = (URGENCY_ORDER[a.urgencyLevel] ?? 99) - (URGENCY_ORDER[b.urgencyLevel] ?? 99);
        if (urgencyDelta !== 0) return urgencyDelta;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .map((request) => ({
        ...request,
        _urgencyRank: URGENCY_ORDER[request.urgencyLevel] ?? 99,
      }));

    if (selectedUrgency !== "all") {
      list = list.filter((request) => request.urgencyLevel === selectedUrgency);
    }

    return list;
  }, [urgentRequests, selectedUrgency]);

  const {
    visibleItems: visibleDonors,
    hasMore: hasMoreDonors,
    loadMoreRef: donorsLoadMoreRef,
  } = useInfiniteScrollSlice(filteredDonors, {
    pageSize: 18,
    resetDeps: [selectedBloodGroup, sortMode, donorSearch, filteredDonors.length],
  });

  const {
    visibleItems: visibleRequests,
    hasMore: hasMoreRequests,
    loadMoreRef: requestsLoadMoreRef,
  } = useInfiniteScrollSlice(prioritizedRequests, {
    pageSize: 12,
    resetDeps: [selectedUrgency, prioritizedRequests.length],
  });

  const stats = useMemo(() => {
    const critical = urgentRequests.filter((r) => r.urgencyLevel === "critical").length;
    const high = urgentRequests.filter((r) => r.urgencyLevel === "high").length;
    const medium = urgentRequests.filter((r) => r.urgencyLevel === "medium").length;
    return {
      donorCount: donors.length,
      totalActiveRequests: urgentRequests.length,
      critical,
      high,
      medium,
    };
  }, [donors.length, urgentRequests]);

  const handleTabChange = (nextTab) => {
    const normalizedTab = normalizeTab(nextTab, isAdmin);
    const nextParams = new URLSearchParams(searchParams);

    if (normalizedTab === "emergency") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", normalizedTab);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const resetDonorFilters = () => {
    setSelectedBloodGroup("all");
    setSortMode("latest");
    setDonorSearch("");
  };

  const handleModerateDonor = async (donorId, status) => {
    try {
      await API.patch(`/blood-bank/admin/donors/${donorId}/status`, { status });
      toast.success(`Donor marked as ${status}`);
      queryClient.invalidateQueries({ queryKey: ["blood-bank-moderation-queue"] });
      queryClient.invalidateQueries({ queryKey: ["blood-bank-donors"] });
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to update donor status");
    }
  };

  const handleModerateRequest = async (requestId, status) => {
    try {
      await API.patch(`/blood-bank/admin/requests/${requestId}/status`, { status });
      toast.success(`Request marked as ${status}`);
      queryClient.invalidateQueries({ queryKey: ["blood-bank-moderation-queue"] });
      queryClient.invalidateQueries({ queryKey: ["blood-bank-urgent-requests"] });
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to update request status");
    }
  };

  const handleCallNow = (phone) => {
    if (!phone) {
      toast.error("Phone number is unavailable");
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  const handleCopyPhone = async (phone) => {
    if (!phone) {
      toast.error("Phone number is unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(phone);
      toast.success("Phone number copied");
    } catch {
      toast.error("Could not copy phone number");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-slate-50 pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="app-surface p-6 md:p-8 border border-red-100">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Aidevo Blood Bank Network</h1>
                <p className="text-slate-600 mt-2 max-w-3xl">
                  Emergency-first blood request board, verified donor discovery, map-based location support, and admin moderation in one place.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="relative lg:col-span-4 rounded-2xl overflow-hidden border border-red-200 bg-gradient-to-br from-red-500 via-rose-500 to-red-600 text-white p-4 md:p-5">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/20 blur-xl" />
                <p className="text-xs uppercase tracking-wider text-red-100 font-semibold">Live Critical Cases</p>
                <div className="mt-3 flex items-end justify-between">
                  <p className="text-4xl md:text-5xl font-extrabold leading-none">{stats.critical}</p>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-white/20 text-xs font-semibold">
                    <Siren className="w-3.5 h-3.5" />
                    Immediate Action
                  </span>
                </div>
                <p className="mt-3 text-xs text-red-100">Prioritized at the top of the emergency board.</p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3 md:p-4">
                  <p className="text-xs font-semibold text-amber-700">High Priority</p>
                  <p className="mt-2 text-3xl font-bold text-amber-700">{stats.high}</p>
                  <p className="text-[11px] text-amber-700/80 mt-1">Need response soon</p>
                </div>

                <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-3 md:p-4">
                  <p className="text-xs font-semibold text-sky-700">Medium Priority</p>
                  <p className="mt-2 text-3xl font-bold text-sky-700">{stats.medium}</p>
                  <p className="text-[11px] text-sky-700/80 mt-1">Monitor and prepare</p>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-3 md:p-4">
                  <p className="text-xs font-semibold text-rose-700">Active Requests</p>
                  <p className="mt-2 text-3xl font-bold text-rose-700">{stats.totalActiveRequests}</p>
                  <p className="text-[11px] text-rose-700/80 mt-1">Across all urgency levels</p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-3 md:p-4">
                  <p className="text-xs font-semibold text-emerald-700">Available Donors</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-700">{stats.donorCount}</p>
                  <p className="text-[11px] text-emerald-700/80 mt-1">Ready in searchable list</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="app-surface p-3 md:p-4 border border-slate-200 sticky top-20 z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleTabChange("emergency")}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 border transition-colors ${
                activeSection === "emergency"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-red-200"
              }`}
            >
              <Siren className="w-4 h-4" />
              Emergency Board
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("forms")}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 border transition-colors ${
                activeSection === "forms"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-red-200"
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              Submit Forms
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("donors")}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 border transition-colors ${
                activeSection === "donors"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-red-200"
              }`}
            >
              <Users className="w-4 h-4" />
              Donor List
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => handleTabChange("admin")}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 border transition-colors ${
                  activeSection === "admin"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-red-200"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </button>
            )}
          </div>
        </section>

        <AnimatePresence mode="sync" initial={false}>
        {activeSection === "emergency" && (
        <motion.section
          key="tab-emergency"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="app-surface p-6 border border-red-200 bg-gradient-to-r from-red-50 to-rose-50"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="section-title-md text-slate-900 inline-flex items-center gap-2">
                <Siren className="w-5 h-5 text-red-600" />
                Emergency Request Board
              </h2>
              <p className="text-sm text-slate-600 mt-1">Critical cases are always listed first to speed up donor response.</p>
              <p className="text-xs text-slate-500 mt-1">Board refreshes automatically every 25 seconds.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm bg-white"
              >
                <option value="all">All urgency levels</option>
                {URGENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <button
                onClick={() => refetchUrgentRequests()}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-sm inline-flex items-center gap-1"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {requestsLoading ? (
            <p className="text-slate-500">Loading urgent requests...</p>
          ) : prioritizedRequests.length === 0 ? (
            <p className="text-slate-500">No active urgent requests for the selected filter.</p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {visibleRequests.map((request) => (
                <div
                  key={String(request._id)}
                  className="rounded-xl border border-slate-200 p-4 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{request.patientName}</p>
                      <p className="text-sm text-slate-600">{request.hospitalAddress}</p>
                      <p className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1">
                        <Clock3 className="w-3.5 h-3.5" />
                        {formatTimeAgo(request.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        {request.bloodGroup}
                      </span>
                      <p className="mt-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase ${URGENCY_BADGE_STYLES[request.urgencyLevel] || "bg-slate-700 text-white"}`}
                        >
                          {request.urgencyLevel}
                        </span>
                      </p>
                    </div>
                  </div>

                  {request.note && <p className="text-sm text-slate-600 mt-2">{request.note}</p>}

                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-slate-500">Phone: {request.phone || request.phoneMasked || "Hidden"}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleCallNow(request.phone)}
                        className="text-sm bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 hover:bg-emerald-200"
                      >
                        <PhoneCall className="w-4 h-4" />
                        Call now
                      </button>
                      <button
                        onClick={() => handleCopyPhone(request.phone)}
                        className="text-sm bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 hover:bg-slate-200"
                      >
                        <Copy className="w-4 h-4" />
                        Copy phone
                      </button>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${request.latitude}&mlon=${request.longitude}#map=14/${request.latitude}/${request.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-sky-700 hover:text-sky-800 inline-flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        View hospital map
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              {hasMoreRequests && (
                <div ref={requestsLoadMoreRef} className="py-2 text-center text-xs text-slate-500">
                  Loading more requests...
                </div>
              )}
            </div>
          )}
        </motion.section>
        )}

        {activeSection === "forms" && (
        <motion.div
          key="tab-forms"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <section className="app-surface p-6">
            <h2 className="section-title-md text-slate-900 mb-1">Become a Donor</h2>
            <p className="text-sm text-slate-500 mb-4">Submit your profile so people can find compatible blood quickly.</p>
            <form onSubmit={handleSubmitDonor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5"
                    placeholder="Full name"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5"
                    placeholder="Phone"
                  />
                </div>
              </div>

              <div className="relative">
                <Droplets className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={form.bloodGroup}
                  onChange={(e) => handleChange("bloodGroup", e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 bg-white"
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <textarea
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                placeholder="Address"
              />

              <textarea
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                placeholder="Availability note"
              />

              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800 inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Donor Location
                  </p>
                  <button
                    type="button"
                    onClick={() => handleUseCurrentLocation("donor")}
                    className="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 inline-flex items-center gap-1"
                  >
                    <LocateFixed className="w-4 h-4" />
                    Use Current Location
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={form.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    required
                    placeholder="Latitude"
                    className="rounded-xl border border-slate-200 px-3 py-2.5"
                  />
                  <input
                    value={form.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    required
                    placeholder="Longitude"
                    className="rounded-xl border border-slate-200 px-3 py-2.5"
                  />
                </div>

                {!mapReady && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Add coordinates to preview map.
                  </p>
                )}

                {mapReady && (
                  <iframe
                    title="Donor map preview"
                    src={mapEmbedUrl}
                    className="w-full h-48 rounded-xl border border-slate-200"
                    loading="lazy"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full app-btn-primary py-3 disabled:opacity-60"
              >
                {loading ? "Submitting donor profile..." : "Register as Blood Donor"}
              </button>
              <p className="text-xs text-slate-500">New donor entries are auto-approved for now and should appear in blood-group filters immediately.</p>
            </form>
          </section>

          <section className="app-surface p-6">
            <h2 className="section-title-md text-slate-900 mb-1">Create Emergency Request</h2>
            <p className="text-sm text-slate-500 mb-4">Requests appear immediately on the emergency board with urgency priority.</p>
            <form onSubmit={handleSubmitUrgentRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={requestForm.patientName}
                  onChange={(e) => handleRequestChange("patientName", e.target.value)}
                  required
                  className="rounded-xl border border-slate-200 px-3 py-2.5"
                  placeholder="Patient name"
                />
                <input
                  value={requestForm.phone}
                  onChange={(e) => handleRequestChange("phone", e.target.value)}
                  required
                  className="rounded-xl border border-slate-200 px-3 py-2.5"
                  placeholder="Emergency phone"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={requestForm.bloodGroup}
                  onChange={(e) => handleRequestChange("bloodGroup", e.target.value)}
                  required
                  className="rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
                >
                  <option value="">Required blood group</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <select
                  value={requestForm.urgencyLevel}
                  onChange={(e) => handleRequestChange("urgencyLevel", e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
                >
                  {URGENCY_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <textarea
                value={requestForm.hospitalAddress}
                onChange={(e) => handleRequestChange("hospitalAddress", e.target.value)}
                required
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                placeholder="Hospital / clinic address"
              />

              <textarea
                value={requestForm.note}
                onChange={(e) => handleRequestChange("note", e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                placeholder="Additional clinical note"
              />

              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800 inline-flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-red-500" />
                    Hospital Map Location
                  </p>
                  <button
                    type="button"
                    onClick={() => handleUseCurrentLocation("request")}
                    className="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 inline-flex items-center gap-1"
                  >
                    <LocateFixed className="w-4 h-4" />
                    Use Current Location
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={requestForm.latitude}
                    onChange={(e) => handleRequestChange("latitude", e.target.value)}
                    required
                    placeholder="Latitude"
                    className="rounded-xl border border-slate-200 px-3 py-2.5"
                  />
                  <input
                    value={requestForm.longitude}
                    onChange={(e) => handleRequestChange("longitude", e.target.value)}
                    required
                    placeholder="Longitude"
                    className="rounded-xl border border-slate-200 px-3 py-2.5"
                  />
                </div>

                {requestMapReady && (
                  <iframe
                    title="Urgent request map preview"
                    src={requestMapEmbedUrl}
                    className="w-full h-48 rounded-xl border border-slate-200"
                    loading="lazy"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={requestLoading}
                className="w-full app-btn-primary py-3 disabled:opacity-60"
              >
                {requestLoading ? "Publishing request..." : "Publish Urgent Blood Request"}
              </button>
            </form>
          </section>
        </motion.div>
        )}

        {activeSection === "donors" && (
        <motion.div
          key="tab-donors"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="grid grid-cols-1 gap-6"
        >
          <section className="app-surface p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="section-title-md text-slate-900">Available Donors</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Filter & Sort
                </span>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    placeholder="Search donor or area"
                    className="rounded-lg border border-slate-200 pl-8 pr-2 py-1.5 text-sm"
                  />
                </div>
                <select
                  value={selectedBloodGroup}
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                >
                  <option value="all">All Groups</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                >
                  <option value="latest">Latest</option>
                  <option value="nearest">Nearest</option>
                </select>
                <button
                  onClick={() => handleUseCurrentLocation("nearby")}
                  className="rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 px-2 py-1.5 text-sm"
                >
                  Detect Nearby
                </button>
                <button
                  onClick={resetDonorFilters}
                  className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1.5 text-sm inline-flex items-center gap-1"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {BLOOD_GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedBloodGroup(group)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${selectedBloodGroup === group ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}
                >
                  {group}
                </button>
              ))}
              <button
                onClick={() => setSelectedBloodGroup("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${selectedBloodGroup === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200"}`}
              >
                All
              </button>
            </div>

            {donorsLoading ? (
              <p className="text-slate-500">Loading donors...</p>
            ) : filteredDonors.length === 0 ? (
              <p className="text-slate-500">No donors available for this filter.</p>
            ) : (
              <div className="space-y-3 max-h-[620px] overflow-auto pr-1">
                  {visibleDonors.map((donor) => (
                  <div key={String(donor._id)} className="rounded-xl border border-slate-200 p-4 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{donor.name}</p>
                        <p className="text-sm text-slate-600">{donor.address}</p>
                        <p className="text-xs text-slate-500 mt-1">Phone: {donor.phoneMasked || "Hidden"}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        {donor.bloodGroup}
                      </span>
                    </div>
                    <div className="mt-3">
                      {donor._distanceKm !== undefined && (
                        <p className="text-xs text-slate-500 mb-1">Approx {donor._distanceKm.toFixed(1)} km away</p>
                      )}
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${donor.latitude}&mlon=${donor.longitude}#map=14/${donor.latitude}/${donor.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-sky-700 hover:text-sky-800 inline-flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        Open donor location
                      </a>
                    </div>
                  </div>
                ))}
                {hasMoreDonors && (
                  <div ref={donorsLoadMoreRef} className="py-2 text-center text-xs text-slate-500">
                    Loading more donors...
                  </div>
                )}
              </div>
            )}
          </section>

        </motion.div>
        )}

        {isAdmin && activeSection === "admin" && (
          <motion.section
            key="tab-admin"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="app-surface p-6"
          >
            <h2 className="section-title-md text-slate-900 mb-4 inline-flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              Admin Moderation
            </h2>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs text-slate-600">Pending Donor Profiles</p>
                <p className="text-xl font-semibold text-slate-900">{moderationQueue.pendingDonors.length}</p>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                <p className="text-xs text-red-700">Active Emergency Requests</p>
                <p className="text-xl font-semibold text-red-700">{moderationQueue.urgentRequests.length}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                <p className="text-xs text-emerald-700">Donors Live Publicly</p>
                <p className="text-xl font-semibold text-emerald-700">{donors.length}</p>
              </div>
            </div>
            {moderationQueueLoading ? (
              <p className="text-slate-500">Loading moderation queue...</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="section-title-md text-slate-800 mb-3">Pending Donor Submissions</h3>
                  <div className="space-y-2">
                    {moderationQueue.pendingDonors.length === 0 && (
                      <p className="text-sm text-slate-500">No pending donor submissions.</p>
                    )}
                    {moderationQueue.pendingDonors.map((donor) => (
                      <div key={String(donor._id)} className="rounded-lg border border-slate-200 p-3">
                        <p className="font-medium text-slate-900 inline-flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          {donor.name} ({donor.bloodGroup})
                        </p>
                        <p className="text-xs text-slate-500">{donor.address}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleModerateDonor(donor._id, "approved")}
                            className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700"
                          >
                            Approve For Public List
                          </button>
                          <button
                            onClick={() => handleModerateDonor(donor._id, "hidden")}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
                          >
                            Reject / Hide
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="section-title-md text-slate-800 mb-3">Active Urgent Requests</h3>
                  <div className="space-y-2">
                    {moderationQueue.urgentRequests.length === 0 && (
                      <p className="text-sm text-slate-500">No active urgent requests.</p>
                    )}
                    {moderationQueue.urgentRequests.map((request) => (
                      <div key={String(request._id)} className="rounded-lg border border-slate-200 p-3">
                        <p className="font-medium text-slate-900">{request.patientName} ({request.bloodGroup})</p>
                        <p className="text-xs text-slate-500">{request.hospitalAddress}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleModerateRequest(request._id, "resolved")}
                            className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700"
                          >
                            Mark As Fulfilled
                          </button>
                          <button
                            onClick={() => handleModerateRequest(request._id, "hidden")}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
                          >
                            Remove From Board
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BloodBank;
