import { NavLink } from "react-router";
import { Home, FileText, Users, Info, HeartPulse } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const Links = ({ onLinkClick }) => {
  const { user } = useAuth();

  const allNavItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/events', icon: FileText, label: 'Events' },
    { to: '/organization', icon: Users, label: 'Organization' },
    { to: '/blood-bank', icon: HeartPulse, label: 'Blood Bank' },
    { to: '/about', icon: Info, label: 'About' },
  ];

  const navItems = allNavItems.filter(item => 
    !item.requiresAuth || (item.requiresAuth && user)
  );

  const handleClick = (label) => {
    if (typeof onLinkClick === "function") {
      onLinkClick(label);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-1.5">
      {navItems.map(({ to, icon: Icon, label }) => (
        <li key={to} className="list-none">
          <NavLink
            to={to}
            onClick={() => handleClick(label)}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium border ${
                isActive
                  ? 'bg-gradient-to-r from-[#dff2ff] to-[#cae8ff] border-[#9bd5ff] text-slate-900 shadow-sm'
                  : 'bg-white border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200'
              }`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        </li>
      ))}
    </div>
  );
};

export default Links;