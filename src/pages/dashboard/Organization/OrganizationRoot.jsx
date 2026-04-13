import React, { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useUserRole from "../../../hooks/useUserRole";
import ClubProfile from "./ClubProfile";
import SocialServiceProfile from "./SocialServiceProfile";
import AssociationProfile from "./AssociationProfile";
import API from "../../../utils/api";
import Loading from "../../../components/common/Loading";

const OrganizationRoot = () => {
    const { user } = useAuth();
    const { userInfo } = useUserRole();
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrganization = async () => {
            if (!user?.uid || userInfo?.role !== "organization") {
                setOrganization(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await API.get(`/users/uid/${user.uid}`);
                setOrganization(response?.data || null);
            } catch (error) {
                console.error("Error fetching organization data:", error);
                setOrganization(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganization();
    }, [user?.uid, userInfo?.role]);

    if (loading) {
        return <Loading />;
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