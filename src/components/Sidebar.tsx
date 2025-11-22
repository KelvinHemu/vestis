import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, Grid, LogOut, Plus} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../contexts/authStore';

const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard', badge: null },
    { icon: Plus, label: 'Create', path: '/create', badge: null },
    { icon: Grid, label: 'Projects', path: '/projects', badge: null },
    // { icon: Image, label: 'Assets', path: '/assets', badge: null },
    // { icon: History, label: 'History', path: '/history', badge: null },
];

const bottomMenuItems = [
  { icon: User, label: 'Profile', path: '/profile', badge: null },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  // Handle logout functionality
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-white flex flex-col items-center py-4 z-40">
      {/* Brand */}
      <div className="mb-8">
        <h1 className="text-gray-900 font-bold text-lg">Vestis</h1>
      </div>

      {/* Main Menu Items */}
      <nav className="flex-1 flex flex-col items-center space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative group flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>

              {/* Badge */}
              {item.badge && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-gray-600 text-white px-1 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Menu Items */}
      <div className="flex flex-col items-center space-y-3 mb-4">
        {/* Profile Button */}
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative group flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "relative group flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all duration-200",
            "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
