import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Users, 
  MapPin, 
  Building2, 
  Globe, 
  Phone, 
  Mail,
  Clock,
  UserCheck,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogIn,
  Bookmark,
  BookmarkCheck,
  ArrowUpDown,
  Clock3,
  CalendarClock
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ApplicationModal from '../../components/layouts/ApplicationModal';
import PaginationControls from '../../components/common/PaginationControls';
import useAuth from '../../hooks/useAuth';
import useUserRole from '../../hooks/useUserRole';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Organization = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { userInfo, loading: roleLoading } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedOrgIds, setSavedOrgIds] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const parsedPage = Number.parseInt(searchParams.get('page') || '1', 10);
    return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  });

  const ITEMS_PER_PAGE = 9;

  const orgTypes = ['all', 'Club', 'NGO', 'Department', 'Community', 'Society', 'Association'];
  const campuses = ['all', 'Main Campus', 'North Campus', 'South Campus', 'City Campus', 'Online'];
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'deadline-first', label: 'Deadline First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
  ];

  const organizationsQuery = useQuery({
    queryKey: ['organizations-directory'],
    queryFn: async () => {
      let organizationsData = [];
      let eventsData = [];

      try {
        const [response, eventsResponse] = await Promise.all([
          API.get('/organizations/with-applications'),
          API.get('/events'),
        ]);

        organizationsData = Array.isArray(response?.data) ? response.data : [];
        eventsData = Array.isArray(eventsResponse?.data) ? eventsResponse.data : [];
      } catch {
        const [response, eventsResponse] = await Promise.all([
          API.get('/organizations'),
          API.get('/events').catch(() => ({ data: [] })),
        ]);

        const basicOrganizations = Array.isArray(response?.data) ? response.data : [];
        eventsData = Array.isArray(eventsResponse?.data) ? eventsResponse.data : [];
        organizationsData = basicOrganizations.map((org) => ({
          ...org,
          applicationCount: 0,
        }));
      }

      const now = Date.now();

      const getNextDeadline = (org) => {
        const orgEmail = String(org?.email || '').toLowerCase();
        const orgName = String(org?.organization?.name || '').toLowerCase();

        const matchingEvents = eventsData.filter((event) => {
          const eventOrgEmail = String(event?.organizationEmail || '').toLowerCase();
          const eventOrgName = String(event?.organization || '').toLowerCase();
          return eventOrgEmail === orgEmail || eventOrgName === orgName;
        });

        const candidateDeadlines = matchingEvents
          .map((event) => event?.registrationDeadline || event?.paymentDeadline || event?.startAt)
          .filter(Boolean)
          .map((date) => new Date(date).getTime())
          .filter((ts) => Number.isFinite(ts) && ts >= now)
          .sort((a, b) => a - b);

        return candidateDeadlines[0] || null;
      };

      return organizationsData.map((org) => {
        const nextDeadlineTs = getNextDeadline(org);
        return {
          ...org,
          nextDeadlineTs,
          closingSoon: nextDeadlineTs
            ? nextDeadlineTs - now <= 7 * 24 * 60 * 60 * 1000
            : false,
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  const applicationsQuery = useQuery({
    queryKey: ['student-applications', user?.uid],
    enabled: Boolean(user?.uid && userInfo?.role === 'student'),
    queryFn: async () => {
      const response = await API.get(`/students/${user.uid}/applications`);
      return Array.isArray(response?.data) ? response.data : [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const organizations = useMemo(
    () => organizationsQuery.data ?? [],
    [organizationsQuery.data]
  );
  const userApplications = applicationsQuery.data || [];
  const loading = organizationsQuery.isLoading;
  const applicationsLoading = applicationsQuery.isLoading;
  const error = organizationsQuery.error ? 'Failed to load organizations. Please try again.' : '';

  const pendingApplications = userApplications.filter((app) => app.status === 'pending').length;
  const approvedApplications = userApplications.filter((app) => app.status === 'approved').length;

  const filteredOrganizations = useMemo(() => {
    let filtered = organizations;

    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organization?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organization?.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organization?.campus?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(org => org.organization?.type === selectedType);
    }

    if (selectedCampus !== 'all') {
      filtered = filtered.filter(org => org.organization?.campus === selectedCampus);
    }

    if (savedOnly) {
      filtered = filtered.filter((org) => savedOrgIds.includes(String(org._id)));
    }

    if (sortBy === 'deadline-first') {
      filtered = [...filtered].sort((a, b) => {
        const aDeadline = Number(a.nextDeadlineTs || Number.MAX_SAFE_INTEGER);
        const bDeadline = Number(b.nextDeadlineTs || Number.MAX_SAFE_INTEGER);
        return aDeadline - bDeadline;
      });
    } else if (sortBy === 'popular') {
      filtered = [...filtered].sort(
        (a, b) => Number(b.applicationCount || 0) - Number(a.applicationCount || 0)
      );
    } else if (sortBy === 'name-asc') {
      filtered = [...filtered].sort((a, b) =>
        String(a.organization?.name || '').localeCompare(String(b.organization?.name || ''))
      );
    } else if (sortBy === 'name-desc') {
      filtered = [...filtered].sort((a, b) =>
        String(b.organization?.name || '').localeCompare(String(a.organization?.name || ''))
      );
    }

    return filtered;
  }, [organizations, searchTerm, selectedType, selectedCampus, savedOnly, savedOrgIds, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedCampus, sortBy, savedOnly]);

  useEffect(() => {
    const parsedPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const pageFromUrl = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams, currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrganizations.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const currentQueryPage = searchParams.get('page');
    const targetQueryPage = currentPage > 1 ? String(currentPage) : null;

    if ((currentQueryPage || null) === targetQueryPage) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (targetQueryPage) {
      nextParams.set('page', targetQueryPage);
    } else {
      nextParams.delete('page');
    }
    setSearchParams(nextParams, { replace: true });
  }, [currentPage, searchParams, setSearchParams]);

  const paginatedOrganizations = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredOrganizations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrganizations, currentPage, totalPages]);

  const currentPageSafe = Math.min(currentPage, totalPages);
  const showingStart =
    filteredOrganizations.length === 0 ? 0 : (currentPageSafe - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(currentPageSafe * ITEMS_PER_PAGE, filteredOrganizations.length);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('saved_org_ids');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedOrgIds(parsed.map((id) => String(id)));
      }
    } catch {
      setSavedOrgIds([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('saved_org_ids', JSON.stringify(savedOrgIds));
  }, [savedOrgIds]);

  const getUserApplicationStatus = (organizationId) => {
    if (!user || userInfo?.role !== 'student') return null;
    
    const application = userApplications.find(app => 
      app.organizationId === organizationId.toString()
    );

    return application ? application.status : null;
  };

  const getRecruitmentStatus = (organization) => {
    const recruitment = organization?.organization?.recruitment || {};
    const isOpen = recruitment?.isOpen === true;
    const deadlineTs = recruitment?.deadline
      ? new Date(recruitment.deadline).getTime()
      : null;
    const deadlinePassed =
      Number.isFinite(deadlineTs) && deadlineTs < Date.now();

    return {
      isOpen: isOpen && !deadlinePassed,
      headline: recruitment?.headline || "",
      description: recruitment?.description || "",
      deadline: recruitment?.deadline || "",
      deadlinePassed,
    };
  };

  const handleApply = (organization) => {
    const recruitment = getRecruitmentStatus(organization);
    if (!recruitment.isOpen) {
      toast.error("Recruitment is currently closed for this organization");
      return;
    }

    setSelectedOrganization(organization);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async () => {
    setShowApplicationModal(false);
    setSelectedOrganization(null);

    organizationsQuery.refetch();
    if (user && userInfo?.role === 'student') {
      applicationsQuery.refetch();
    }
  };

  const toggleSavedOrganization = (organizationId, orgName) => {
    const normalizedId = String(organizationId);
    setSavedOrgIds((prev) => {
      const exists = prev.includes(normalizedId);
      const next = exists
        ? prev.filter((id) => id !== normalizedId)
        : [...prev, normalizedId];

      toast.success(
        exists
          ? `${orgName || 'Organization'} removed from saved list`
          : `${orgName || 'Organization'} saved for later`
      );

      return next;
    });
  };

  const getButtonConfig = (organization) => {
    const recruitment = getRecruitmentStatus(organization);
    const applicationStatus = getUserApplicationStatus(organization._id);

    if (!recruitment.isOpen) {
      return {
        text: recruitment.deadlinePassed ? 'Recruitment Closed (Deadline Passed)' : 'Recruitment Closed',
        disabled: true,
        buttonClass: 'app-btn-secondary bg-slate-200 border-slate-200 text-slate-600 cursor-not-allowed',
        icon: AlertCircle,
        helperText: 'This organization is not accepting applications right now.'
      };
    }

    if (!user) {
      return {
        text: 'Sign In to Apply',
        disabled: true,
        buttonClass: 'app-btn-secondary bg-slate-200 border-slate-200 text-slate-600 cursor-not-allowed',
        icon: LogIn,
        helperText: 'Please sign in with a student account to submit an application.'
      };
    }

    if (roleLoading || applicationsLoading) {
      return {
        text: 'Loading...',
        disabled: true,
        buttonClass: 'app-btn-secondary bg-slate-200 border-slate-200 text-slate-600 cursor-not-allowed',
        icon: Clock,
        helperText: 'Checking your eligibility...'
      };
    }

    if (userInfo?.role !== 'student') {
      return {
        text: 'Students Only',
        disabled: true,
        buttonClass: 'app-btn-secondary bg-slate-200 border-slate-200 text-slate-600 cursor-not-allowed',
        icon: AlertCircle,
        helperText: 'Only student accounts can apply to organizations.'
      };
    }

    if (applicationStatus) {
      const statusConfig = {
        pending: {
          text: 'Application Pending',
          buttonClass: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold cursor-default',
          icon: Clock,
          helperText: 'You have already applied to this organization.'
        },
        approved: {
          text: 'Approved ✓',
          buttonClass: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold cursor-default',
          icon: CheckCircle,
          helperText: 'You have already applied to this organization.'
        },
        rejected: {
          text: 'Application Rejected',
          buttonClass: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold cursor-default',
          icon: XCircle,
          helperText: 'You have already applied to this organization.'
        }
      };
      return { ...statusConfig[applicationStatus], disabled: true };
    }

    return {
      text: 'Apply Now',
      disabled: false,
      buttonClass: 'app-btn-primary',
      icon: Users,
      helperText: 'Join this organization and be part of the community.'
    };
  };

  const getStatusBadge = (organization) => {
    const applicationStatus = getUserApplicationStatus(organization._id);
    
    if (!applicationStatus) return null;

    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pending Review',
        icon: Clock
      },
      approved: {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Approved Member',
        icon: CheckCircle
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Application Rejected',
        icon: XCircle
      }
    };

    const config = statusConfig[applicationStatus];
    const Icon = config.icon;

    return (
      <div className={`absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color} z-10`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </div>
    );
  };

  const activeOrganizations = organizations.filter(
    (org) => String(org?.status || "").toLowerCase() === "active"
  ).length;
  const availableTypes = new Set(
    organizations
      .map((org) => org?.organization?.type)
      .filter(Boolean)
  ).size;
  const availableCampuses = new Set(
    organizations
      .map((org) => org?.organization?.campus)
      .filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen  py-8 px-4 mt-14">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="app-surface p-6 md:p-8 mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-700 uppercase tracking-wide mb-2">
                Organization Directory
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Find the right campus organization for your goals
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-3xl">
                Explore verified student organizations, review their focus areas, and apply where your skills and interests match.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3 min-w-[280px]">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-center">
                <p className="text-lg font-bold text-slate-900">{activeOrganizations}</p>
                <p className="text-xs text-slate-600">Active</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-center">
                <p className="text-lg font-bold text-slate-900">{availableTypes}</p>
                <p className="text-xs text-slate-600">Types</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-center">
                <p className="text-lg font-bold text-slate-900">{availableCampuses}</p>
                <p className="text-xs text-slate-600">Campuses</p>
              </div>
            </div>
          </div>

          {userInfo?.role === 'student' && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-700">Pending Applications</p>
                  <p className="text-xl font-bold text-amber-900">{pendingApplications}</p>
                </div>
                <Clock3 className="w-5 h-5 text-amber-600" />
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-700">Approved</p>
                  <p className="text-xl font-bold text-emerald-900">{approvedApplications}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-sky-700">Saved Organizations</p>
                  <p className="text-xl font-bold text-sky-900">{savedOrgIds.length}</p>
                </div>
                <BookmarkCheck className="w-5 h-5 text-sky-600" />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-10 rounded-xl bg-gray-200" />
                ))}
              </div>
              <div className="mt-4 h-9 w-64 rounded-xl bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="app-surface p-6 animate-pulse min-h-[380px]">
                  <div className="h-16 w-16 rounded-xl bg-gray-200 mb-4" />
                  <div className="h-6 w-2/3 rounded bg-gray-200 mb-3" />
                  <div className="h-4 w-1/2 rounded bg-gray-200 mb-2" />
                  <div className="h-4 w-3/4 rounded bg-gray-200 mb-6" />
                  <div className="h-10 w-full rounded-xl bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
              >
                {orgTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Campus Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
              >
                {campuses.map(campus => (
                  <option key={campus} value={campus}>
                    {campus === 'all' ? 'All Campuses' : campus}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSavedOnly((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                savedOnly
                  ? 'bg-sky-50 border-sky-200 text-sky-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {savedOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {savedOnly ? 'Showing saved only' : 'Show saved organizations only'}
            </button>
            <p className="text-xs text-slate-500">Sorted by: {sortOptions.find((o) => o.value === sortBy)?.label}</p>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {paginatedOrganizations.map((organization) => {
              const buttonConfig = getButtonConfig(organization);
              const recruitmentStatus = getRecruitmentStatus(organization);
              const ButtonIcon = buttonConfig.icon;
              const statusBadge = getStatusBadge(organization);

              return (
                <div
                  key={organization._id}
                  className="app-surface overflow-hidden hover:shadow-md transition-all duration-300 relative flex flex-col h-full min-h-[610px]"
                >
                  <button
                    type="button"
                    onClick={() => toggleSavedOrganization(organization._id, organization.organization?.name)}
                    className="absolute top-4 left-4 z-10 h-8 w-8 rounded-full bg-white/90 border border-slate-200 shadow-sm inline-flex items-center justify-center text-slate-600 hover:text-sky-600"
                    aria-label="Save organization"
                  >
                    {savedOrgIds.includes(String(organization._id)) ? (
                      <BookmarkCheck className="w-4 h-4 text-sky-600" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  {/* Application Status Badge */}
                  {statusBadge}

                    <div className={`absolute ${statusBadge ? 'top-14' : 'top-4'} right-4 z-10`}>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${recruitmentStatus.isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {recruitmentStatus.isOpen ? 'Recruiting' : 'Closed'}
                      </span>
                    </div>

                  {/* Organization Header */}
                  <div className="p-6 border-b border-gray-100 min-h-[180px]">
                    <div className="flex items-start space-x-4">
                      <img
                        src={organization.photoURL || `https://ui-avatars.com/api/?name=${organization.organization?.name}&background=4bbeff&color=fff`}
                        alt={organization.organization?.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {organization.organization?.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-600 font-medium">
                            {organization.organization?.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {organization.organization?.campus}
                          </span>
                        </div>
                        {organization.nextDeadlineTs && (
                          <div className="flex items-center gap-2 mt-1">
                            <CalendarClock className={`w-4 h-4 ${organization.closingSoon ? 'text-amber-600' : 'text-slate-500'}`} />
                            <span className={`text-xs font-medium ${organization.closingSoon ? 'text-amber-700' : 'text-slate-600'}`}>
                              Next deadline: {new Date(organization.nextDeadlineTs).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tagline */}
                    {organization.organization?.tagline && (
                      <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                        {organization.organization.tagline}
                      </p>
                    )}

                    {recruitmentStatus.headline && (
                      <p className="text-xs text-emerald-700 mt-2 line-clamp-1 font-medium">
                        {recruitmentStatus.headline}
                      </p>
                    )}
                  </div>

                  {/* Organization Details */}
                  <div className="p-6 space-y-3 flex-1 flex flex-col">
                    {/* Mission Preview */}
                    {organization.organization?.mission && (
                      <div className="min-h-[68px]">
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {organization.organization.mission}
                        </p>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 min-h-[98px]">
                      {organization.organization?.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={organization.organization.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-500 transition-colors truncate"
                          >
                            {organization.organization.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      {organization.organization?.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{organization.organization.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{organization.email}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{organization.applicationCount || 0} members</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <UserCheck className="w-4 h-4" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Link
                        to={`/organizations/${organization._id}`}
                        className="app-btn-secondary w-full justify-center"
                      >
                        <Building2 className="w-5 h-5" />
                        Details
                      </Link>

                      {user && (
                        <button
                          onClick={() => !buttonConfig.disabled && handleApply(organization)}
                          disabled={buttonConfig.disabled}
                          className={`w-full ${buttonConfig.buttonClass}`}
                        >
                          <ButtonIcon className="w-5 h-5" />
                          {buttonConfig.text}
                        </button>
                      )}
                    </div>
                    
                    <div className="min-h-10 mt-2">
                      {recruitmentStatus.deadline && recruitmentStatus.isOpen && (
                        <p className="text-xs text-slate-500 text-center mb-1">
                          Deadline: {new Date(recruitmentStatus.deadline).toLocaleDateString()}
                        </p>
                      )}

                      {!user ? (
                        <p className="text-xs text-gray-500 text-center">
                          Sign in to unlock the apply button
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 text-center">
                          {buttonConfig.helperText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredOrganizations.length > 0 && (
          <div className="mt-8 space-y-3">
            <p className="text-sm text-slate-600 text-center">
              Showing {showingStart}-{showingEnd} of {filteredOrganizations.length} organizations
            </p>
            <PaginationControls
              currentPage={currentPageSafe}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Empty State */}
        {filteredOrganizations.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {organizations.length === 0 ? 'No organizations available' : 'No organizations found'}
            </h3>
            <p className="text-gray-500">
              {organizations.length === 0 
                ? 'There are no organizations registered yet.' 
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
          </div>
        )}
          </>
        )}
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {showApplicationModal && selectedOrganization && (
          <ApplicationModal
            organization={selectedOrganization}
            onClose={() => {
              setShowApplicationModal(false);
              setSelectedOrganization(null);
            }}
            onSubmit={handleApplicationSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Organization;