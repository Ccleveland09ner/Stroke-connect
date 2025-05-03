import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  notificationCount: number;
}

const Header: React.FC<HeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen,
  notificationCount
}) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-2xl font-bold text-primary-600">StrokeConnect</h1>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              to="/notifications"
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 relative"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {notificationCount}
                </span>
              )}
            </Link>

            <div className="ml-3 relative flex items-center">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="ml-4 p-2 rounded-full text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Log out</span>
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;