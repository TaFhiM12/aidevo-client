import { useQuery } from "@tanstack/react-query";
import API from "../utils/api";

const useDashboardOverview = (uid) => {
  return useQuery({
    queryKey: ["dashboard-overview", uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const response = await API.get(`/users/dashboard-overview/${uid}`);
      return response?.data || null;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export default useDashboardOverview;
