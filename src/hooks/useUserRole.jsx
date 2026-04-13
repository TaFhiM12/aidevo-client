import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import { useUserContext } from "../context/UserContext";

const ACCESS_USER_INFO_KEY = "aidevo_user_info";

const readCachedUserInfo = () => {
  try {
    const raw = localStorage.getItem(ACCESS_USER_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const useUserRole = () => {
  const { user, loading: authLoading, obtainAccessToken } = useAuth();
  const { globalUserInfo, updateGlobalUserInfo, userUpdateKey } = useUserContext();
  const enabled = !authLoading && Boolean(user?.email);

  const query = useQuery({
    queryKey: ["user-role", user?.email, userUpdateKey],
    enabled,
    retry: false,
    queryFn: async () => {
      const cachedUserInfo = readCachedUserInfo();
      if (cachedUserInfo?.email === user.email) {
        return cachedUserInfo;
      }

      const tokenUser = await obtainAccessToken(user);
      if (!tokenUser) {
        throw new Error("AUTH_TOKEN_UNAVAILABLE");
      }

      return tokenUser || null;
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
      } else {
        console.warn("Role fetch delayed while waiting for backend token readiness.");
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