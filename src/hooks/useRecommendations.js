import { useState, useEffect } from 'react';
import recommendationApi from '../utils/recommendationApi';

export const useEventRecommendations = (studentId, limit = 6, requesterUid = "") => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) {
      setRecommendations([]);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchRecommendations = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const response = await recommendationApi.getPersonalizedRecommendations(
          studentId,
          limit,
          requesterUid
        );

        if (isMounted) {
          setRecommendations(response.success ? response.data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err || "Failed to fetch recommendations");
          setRecommendations([]);
        }

        console.error("Error fetching recommendations:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, [studentId, limit, requesterUid]);

  return { recommendations, loading, error };
};

export const useTrendingEvents = (interests = "", limit = 6) => {
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTrendingEvents = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const response = await recommendationApi.getTrendingEvents(interests, limit);

        if (isMounted) {
          setTrendingEvents(response.success ? response.data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err || "Failed to fetch trending events");
          setTrendingEvents([]);
        }

        console.error("Error fetching trending events:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTrendingEvents();

    return () => {
      isMounted = false;
    };
  }, [interests, limit]);

  return { trendingEvents, loading, error };
};
