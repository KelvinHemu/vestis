import { Link, useLocation } from 'react-router-dom';
import { Home, User, Grid, Zap, Plus, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../contexts/authStore';
import userService from '../services/userService';
import type { User as UserType } from '../types/user';

const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard', badge: null },
    { icon: Plus, label: 'Create', path: '/create', badge: null },
    { icon: Grid, label: 'Projects', path: '/projects', badge: null },
    { icon: CreditCard, label: 'Payment', path: '/payment', badge: null },
    // { icon: Image, label: 'Assets', path: '/assets', badge: null },
    // { icon: History, label: 'History', path: '/history', badge: null },
];

export function Sidebar() {
  const location = useLocation();
  const { token } = useAuthStore();
  const [user, setUser] = useState<UserType | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;

      try {
        const response = await userService.getCurrentUser(token);
        setUser(response.user);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchUserData();
  }, [token]);

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
        {/* Profile Button with Avatar */}
        <Link
          to="/profile"
          className="relative group transition-all duration-200"
        >
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              className="w-9 h-9 rounded-lg object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </Link>

        {/* Credits Display */}
        <Link
          to="/payment"
          className="flex flex-col items-center justify-center w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer"
          title="Buy credits"
        >
          <Zap className="w-3 h-3 fill-gray-900 text-gray-900 mb-0.5" />
          <span className="text-xs font-bold text-gray-900 leading-none">{user?.credits ?? 0}</span>
        </Link>
      </div>
    </aside>
  );
}
