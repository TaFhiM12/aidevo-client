import { BarChart3, CalendarDays, MessageSquare, PlusCircle, User, Users } from "lucide-react";

export const navigation = [
  { 
    name: "Event Management", 
    href: "/dashboard/create-event", 
    icon: PlusCircle,
    accent: "from-purple-500 to-pink-500"
  },
  { 
    name: "Event Calendar", 
    href: "/dashboard/events", 
    icon: CalendarDays,
    accent: "from-blue-500 to-cyan-500"
  },
  { 
    name: "Team Communications", 
    href: "/dashboard/chat", 
    icon: MessageSquare,
    accent: "from-green-500 to-emerald-500"
  },
  { 
    name: "Member Directory", 
    href: "/dashboard/members", 
    icon: Users,
    accent: "from-orange-500 to-red-500"
  },
  { 
    name: "Analytics & Insights", 
    href: "/dashboard/track", 
    icon: BarChart3,
    accent: "from-indigo-500 to-purple-500"
  },
  { 
    name: "Organization Profile", 
    href: "/dashboard/profile", 
    icon: User,
    accent: "from-gray-600 to-gray-800"
  },
];