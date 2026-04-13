import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import { useUserContext } from "../context/UserContext";
import API from "../utils/api";

const useUserRole = () => {
  const { user, loading: authLoading, obtainAccessToken } = useAuth();
  const { globalUserInfo, updateGlobalUserInfo, userUpdateKey } = useUserContext();
  const enabled = !authLoading && Boolean(user?.email);

  const query = useQuery({
    queryKey: ["user-role", user?.email, userUpdateKey],
    enabled,
    retry: (failureCount, error) => {
      if (error?.message === "AUTH_TOKEN_UNAVAILABLE") {
        return false;
      }
      return failureCount < 1;
    },
    queryFn: async () => {
      const tokenReady = await obtainAccessToken(user);
      if (!tokenReady) {
        throw new Error("AUTH_TOKEN_UNAVAILABLE");
      }

      const endpoint = `/users/role/${encodeURIComponent(user.email)}`;

      try {
        const res = await API.get(endpoint);
        return res?.data || null;
      } catch (err) {
        const statusCode = err?.status;
        const message = String(err?.message || err || "");

        if (statusCode === 401 || message.toLowerCase().includes("unauthorized")) {
          const refreshed = await obtainAccessToken(user, { forceRefresh: true });
          if (!refreshed) {
            throw new Error("AUTH_TOKEN_UNAVAILABLE");
          }
          const retryRes = await API.get(endpoint);
          return retryRes?.data || null;
        }

        throw err;
      }
    },
  });

  useEffect(() => {
    if (!enabled) {
      updateGlobalUserInfo(null);
      return;
    }

    if (query.data) {
      updateGlobalUserInfo(query.data);
    }
  }, [enabled, query.data, updateGlobalUserInfo]);

  useEffect(() => {
    if (query.error) {
      if (query.error?.message !== "AUTH_TOKEN_UNAVAILABLE") {
        console.error("Error fetching user role:", query.error);
      }
      updateGlobalUserInfo(null);
    }
  }, [query.error, updateGlobalUserInfo]);

  const refetch = () => {
    updateGlobalUserInfo(null);
    query.refetch();
  };

  return {
    userInfo: globalUserInfo,
    loading: authLoading || query.isLoading,
    error: query.error,
    refetch,
  };
};

export default useUserRole;