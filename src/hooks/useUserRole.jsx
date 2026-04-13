import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import { useUserContext } from "../context/UserContext";
import API from "../utils/api";

const useUserRole = () => {
  const { user, loading: authLoading, obtainAccessToken } = useAuth();
  const { globalUserInfo, updateGlobalUserInfo, userUpdateKey } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (authLoading) {
        return;
      }

      if (!user?.email) {
        setLoading(false);
        return;
      }

      if (globalUserInfo && globalUserInfo.email === user.email) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await obtainAccessToken(user);

        const endpoint = `/users/role/${encodeURIComponent(user.email)}`;
        const res = await API.get(endpoint);
        updateGlobalUserInfo(res.data);
      } catch (err) {
        const message = String(err || "");

        if (message.toLowerCase().includes("unauthorized") && user) {
          try {
            await obtainAccessToken(user);
            const retryRes = await API.get(`/users/role/${encodeURIComponent(user.email)}`);
            updateGlobalUserInfo(retryRes.data);
            return;
          } catch (retryErr) {
            console.error("Error fetching user role after token refresh:", retryErr);
            setError(retryErr);
            updateGlobalUserInfo(null);
            return;
          }
        }

        console.error("Error fetching user role:", err);
        setError(err);
        updateGlobalUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.email, userUpdateKey, authLoading]);

  const refetch = () => {
    setLoading(true);
    updateGlobalUserInfo(null);
  };

  return {
    userInfo: globalUserInfo,
    loading,
    error,
    refetch,
  };
};

export default useUserRole;