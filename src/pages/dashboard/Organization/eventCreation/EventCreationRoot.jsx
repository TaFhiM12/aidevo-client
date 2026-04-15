// // import useUserRole from "../../../../hooks/useUserRole";
// // import Loading from "../../../../components/common/Loading";
// // import EventCreationForm from "./EventCreationForm";

// import Loading from "../../../../components/common/Loading";
// import AdvancedEventCreationForm from "../../../../components/events/AdvancedEventCreationForm";
// import useUserRole from "../../../../hooks/useUserRole";

// // const EventCreationRoot = () => {
// //   const { userInfo, loading, error } = useUserRole();

// //   if (loading) {
// //     return <Loading />;
// //   }

// //   if (error) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center px-4">
// //         <div className="text-center">
// //           <h1 className="text-2xl font-bold text-red-600 mb-4">
// //             Failed to load user
// //           </h1>
// //           <p className="text-gray-600">
// //             Could not determine organization type.
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (userInfo?.role !== "organization") {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center px-4">
// //         <div className="text-center">
// //           <h1 className="text-2xl font-bold text-red-600 mb-4">
// //             Unauthorized Access
// //           </h1>
// //           <p className="text-gray-600">
// //             Only organizations can create events.
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <EventCreationForm
// //       organizationType={userInfo?.type}
// //       organizationName={userInfo?.organizationName}
// //       organizationEmail={userInfo?.email}
// //     />
// //   );
// // };

// // export default EventCreationRoot;

// // EventCreationRoot.jsx


// const EventCreationRoot = () => {
//   const { userInfo, loading, error } = useUserRole();

//   if (loading) {
//     return <Loading />;
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4">
//         <div className="text-center">
//           <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
//             <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <h1 className="text-2xl font-bold text-red-600 mb-4">
//             Failed to load user
//           </h1>
//           <p className="text-gray-600">
//             Could not determine organization type. Please try again later.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (userInfo?.role !== "organization") {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4">
//         <div className="text-center">
//           <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
//             <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//             </svg>
//           </div>
//           <h1 className="text-2xl font-bold text-red-600 mb-4">
//             Unauthorized Access
//           </h1>
//           <p className="text-gray-600">
//             Only organizations can create events. Please login with an organization account.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <AdvancedEventCreationForm
//       organizationType={userInfo?.type || userInfo?.organization?.type}
//       organizationName={userInfo?.organizationName || userInfo?.organization?.name}
//       organizationEmail={userInfo?.email}
//       roleType={userInfo?.roleType || userInfo?.organization?.roleType}
//     />
//   );
// };

// export default EventCreationRoot;


import { useEffect, useMemo, useState } from "react";
import Loading from "../../../../components/common/Loading";
import AdvancedEventCreationForm from "../../../../components/events/AdvancedEventCreationForm";
import useUserRole from "../../../../hooks/useUserRole";

const EventCreationRoot = () => {
  const { userInfo, loading, error, refetch } = useUserRole();
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  const resolvedOrganizationType = useMemo(
    () =>
      userInfo?.roleType ||
      userInfo?.organization?.roleType ||
      userInfo?.type ||
      userInfo?.organization?.type ||
      "",
    [userInfo]
  );

  useEffect(() => {
    if (
      userInfo?.role === "organization" &&
      !resolvedOrganizationType &&
      !refreshAttempted
    ) {
      setRefreshAttempted(true);
      refetch();
    }
  }, [userInfo, resolvedOrganizationType, refreshAttempted, refetch]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Failed to load user
          </h1>
          <p className="text-gray-600">
            Could not determine organization type. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (userInfo?.role !== "organization") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Unauthorized Access
          </h1>
          <p className="text-gray-600">
            Only organizations can create events. Please login with an organization account.
          </p>
        </div>
      </div>
    );
  }

  if (!resolvedOrganizationType) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-amber-700 mb-4">
            Organization Profile Incomplete
          </h1>
          <p className="text-gray-600">
            Organization type is missing from your profile. Please log out and log in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdvancedEventCreationForm
      organizationType={resolvedOrganizationType}
      organizationName={
        userInfo?.organization?.name ||
        userInfo?.organizationName ||
        userInfo?.name ||
        ""
      }
      organizationEmail={userInfo?.email || ""}
      roleType={userInfo?.roleType || userInfo?.organization?.roleType || resolvedOrganizationType}
    />
  );
};

export default EventCreationRoot;