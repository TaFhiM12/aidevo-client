import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import useUserRole from "../../../hooks/useUserRole";
import ClubProfile from "./ClubProfile";
import SocialServiceProfile from "./SocialServiceProfile";
import AssociationProfile from "./AssociationProfile";
import API from "../../../utils/api";

const OrganizationRoot = () => {
    const { user } = useAuth();
    const { userInfo } = useUserRole();
    const { data: organization = null, isLoading: loading } = useQuery({
        queryKey: ["organization-profile-root", user?.uid],
        enabled: Boolean(user?.uid && userInfo?.role === "organization"),
        queryFn: async () => {
            const response = await API.get(`/users/uid/${user.uid}`);
            return response?.data || null;
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 20,
        refetchOnWindowFocus: false,
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="app-surface p-6 animate-pulse">
                    <div className="h-8 w-56 rounded bg-gray-200 mb-3" />
                    <div className="h-4 w-96 rounded bg-gray-200" />
                </div>
                <div className="app-surface p-6 animate-pulse min-h-[520px]">
                    <div className="h-10 w-3/4 rounded bg-gray-200 mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-24 rounded-xl bg-gray-200" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (userInfo?.role !== "organization") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Unauthorized</h2>
                    <p className="mt-2 text-gray-600">Only organization accounts can view this page.</p>
                </div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Organization not found</h2>
                </div>
            </div>
        );
    }

    switch (organization.organization?.type) {
        case "Club":
            return <ClubProfile organization={organization} />;
        case "Social Service":
            return <SocialServiceProfile organization={organization} />;
        case "Association":
            return <AssociationProfile organization={organization} />;
        default:
            return <ClubProfile organization={organization} />;
    }

};

export default OrganizationRoot;