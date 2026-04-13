import API from "./api";

const normalizeLimit = (limit) => {
  const parsed = Number.parseInt(limit, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 6;
  }

  return Math.min(parsed, 20);
};

const normalizeInterests = (interests = "") => {
  if (Array.isArray(interests)) {
    return interests
      .map((interest) => String(interest).trim())
      .filter(Boolean)
      .join(", ");
  }

  return String(interests || "")
    .split(",")
    .map((interest) => interest.trim())
    .filter(Boolean)
    .join(", ");
};

const getPersonalizedRecommendations = (studentId, limit = 6, requesterUid = "") => {
  const safeLimit = normalizeLimit(limit);

  const query = new URLSearchParams({
    limit: String(safeLimit),
  });

  if (requesterUid) {
    query.set("requesterUid", requesterUid);
  }

  return API.get(`/events/recommendations/${studentId}?${query.toString()}`);
};

const getTrendingEvents = (interests = "", limit = 6) => {
  const safeLimit = normalizeLimit(limit);
  const safeInterests = normalizeInterests(interests);
  const query = new URLSearchParams({
    limit: String(safeLimit),
    interests: safeInterests,
  });

  return API.get(`/events/trending?${query.toString()}`);
};

const recommendationApi = {
  getPersonalizedRecommendations,
  getTrendingEvents,
};

export default recommendationApi;
