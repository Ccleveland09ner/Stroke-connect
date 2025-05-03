import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  Home, 
  Users, 
  Calendar, 
  Bell, 
  User,
  Activity,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../utils/cn';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const { role } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['neurologist', 'technician', 'patient'] },
  ];

  if (role === 'neurologist' || role === 'technician') {
    navigation.push(
      { name: 'Patients', href: '/patients', icon: Users, roles: ['neurologist', 'technician'] },
      { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['neurologist', 'technician'] }
    );
  }

  if (role === 'neurologist') {
    navigation.push(
      { name: 'Appointments', href: '/appointments', icon: Calendar, roles: ['neurologist'] }
    );
  }

  if (role === 'patient') {
    navigation.push(
      { name: 'My Record', href: '/my-record', icon: FileText, roles: ['patient'] }
    );
  }

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(role as string)
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-800">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <Activity className="h-8 w-8 text-white" />
                    <span className="ml-2 text-white text-xl font-bold">StrokeConnect</span>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    {filteredNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          location.pathname === item.href
                            ? 'bg-primary-900 text-white'
                            : 'text-white hover:bg-primary-700',
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <item.icon className="mr-3 h-6 w-6 text-primary-300" aria-hidden="true" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 bg-primary-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Activity className="h-8 w-8 text-white" />
                <span className="ml-2 text-white text-xl font-bold">StrokeConnect</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      location.pathname === item.href
                        ? 'bg-primary-900 text-white'
                        : 'text-white hover:bg-primary-700',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <item.icon className="mr-3 h-6 w-6 text-primary-300" aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;