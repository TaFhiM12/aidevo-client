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
    queryFn: async () => {
      await obtainAccessToken(user);

      const endpoint = `/users/role/${encodeURIComponent(user.email)}`;

      try {
        const res = await API.get(endpoint);
        return res?.data || null;
      } catch (err) {
        const message = String(err || "");

        if (message.toLowerCase().includes("unauthorized")) {
          await obtainAccessToken(user);
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
      console.error("Error fetching user role:", query.error);
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