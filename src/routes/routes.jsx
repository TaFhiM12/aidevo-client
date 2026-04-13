import { createBrowserRouter } from "react-router";
import RootLayout from "../root/RootLayout";
import Home from "../pages/public/Home";
import Blog from "../pages/public/Events";
import Organization from "../pages/public/Organization";
import OrganizationDetails from "../pages/public/OrganizationDetails";
import About from "../pages/public/About";
import BloodBank from "../pages/public/BloodBank";
import Error from "../components/common/Error";
import SignUp from "../pages/auth/SignUp";
import SignIn from "../pages/auth/SignIn";
import EventCreation from "../pages/dashboard/Organization/EventCreation";
import PrivateRoute from "./PrivateRoute";
import EventDetails from "../pages/private/EventDetails";
import CombinedDashboard from "../pages/dashboard/Dashboard";
import OrganizationProfile from '../pages/dashboard/Organization/OrganizationProfile';
import MyOrganization from '../pages/dashboard/student/MyOrganization';
import MyApplications from '../pages/dashboard/student/MyApplications';
import MyEnrolledEvents from '../pages/dashboard/student/MyEnrolledEvents';
import MychatList from '../pages/dashboard/student/MychatList';
import OrganizationEvents from '../pages/dashboard/Organization/OrganizationEvents';
import OrganizationMembers from '../pages/dashboard/Organization/OrganizationMembers';
import OrganizationApplicants from '../pages/dashboard/Organization/OrganizationApplicants';
import OrganizationCommunication from '../pages/dashboard/Organization/OrganizationCommunication';
import OrganizationAnalytics from '../pages/dashboard/Organization/OrganizationAnalytics';
import OrganizationPayments from '../pages/dashboard/Organization/OrganizationPayments';
import OrganizationSettings from '../pages/dashboard/Organization/OrganizationSettings';
import OrganizationsManagement from "../pages/dashboard/superAdmin/OrganizationsManagement";
import UserManagement from "../pages/dashboard/superAdmin/UserManagement";
import AllAnalytics from "../pages/dashboard/superAdmin/AllAnalytics";
import Reports from "../pages/dashboard/superAdmin/Reports";
import AdminProfile from "../pages/dashboard/superAdmin/AdminProfile";
import MyProfile from "../pages/dashboard/student/MyProfile";
import OrganizationRoot from "../pages/dashboard/Organization/OrganizationRoot";
import EventCreationRoot from "../pages/dashboard/Organization/eventCreation/EventCreationRoot";
import RecommendationPage from "../pages/dashboard/student/RecommendationPage";
import DashboardHome from "../pages/dashboard/shared/DashboardHome";
import StudentSettings from "../pages/dashboard/student/StudentSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout/>,
    errorElement: <Error/>,
    children:[
        {
            index: true, element: <Home/>
        },
        {
            path: 'events' , element: <Blog/>
        },
        {
            path:'events/:id' , element: <PrivateRoute>
                <EventDetails/>
            </PrivateRoute>
        },
        {
            path: 'organization' , element: <Organization/>
        },
        {
            path: 'organizations/:id',
            element: <PrivateRoute>
                <OrganizationDetails/>
            </PrivateRoute>
        },
        {
            path: 'about' , element: <About/>
        },
        {
            path: 'blood-bank', element: <BloodBank/>
        },
        {
            path: 'signin', element: <SignIn/>
        },
        {
            path: 'signup', element: <SignUp/>
        }
    ]
  },
  {
    path: 'dashboard',
    element: <PrivateRoute>
        <CombinedDashboard/>
    </PrivateRoute>,
    children: [
        {
            index: true, element: <DashboardHome/>
        },
        // Student Routes
        {
            path: 'my-organizations' , element: <MyOrganization/>
        },
        {
            path: 'my-applications', element: <MyApplications/>
        },
        {
            path: 'my-events', element: <MyEnrolledEvents/>
        },
        {
            path: 'my-chat', element: <MychatList/>
        },
        {
            path: 'my-recommendations', element: <RecommendationPage/>
        },
        {
            path: 'student-profile', element: <MyProfile/>
        },
        {
            path: 'student-settings', element: <StudentSettings/>
        },
        
        // Organization Routes
        {
            path:'org-create-event' , element: <EventCreationRoot/>
        },
        {
            path: 'org-profile', element: <OrganizationRoot/>
        },
        {
            path: 'org-events', element: <OrganizationEvents/>
        },
        {
            path: 'org-members', element: <OrganizationMembers/>
        },
        {
            path: 'org-applications', element: <OrganizationApplicants/>
        },
        {
            path: 'org-chat', element: <OrganizationCommunication/>
        },
        {
            path: 'org-analytics', element: <OrganizationAnalytics/>
        },
        {
            path: 'org-payments', element: <OrganizationPayments/>
        },
        {
            path: 'org-settings', element: <OrganizationSettings/>
        },
        
        // Admin Routes
        {
            path: 'admin-organizations', element: <OrganizationsManagement/>
        },
        {
            path: 'admin-users', element: <UserManagement/>
        },
        {
            path: 'admin-analytics', element: <AllAnalytics/>
        },
        {
            path: 'admin-reports', element: <Reports/>
        },
        {
            path: 'admin-profile', element: <AdminProfile/>
        },
        {
            path: 'admin-settings', element: <div>Admin Settings</div>
        }
    ]
  }
]);