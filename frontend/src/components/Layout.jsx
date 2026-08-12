import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  History,
  UserCheck,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Building2,
  ShieldCheck
} from 'lucide-react';
import cgstLogo from '../assets/CGST LOGO.png';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('cgst_user') || '{"email":"","role":"","name":"Guest"}');

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'receptionist'] },
    { name: 'Visitor Entry', href: '/entry', icon: UserPlus, roles: ['admin', 'receptionist'] },
    { name: 'Visitor History', href: '/history', icon: History, roles: ['admin', 'receptionist'] },
    { name: 'Visitor Exit', href: '/exit', icon: UserCheck, roles: ['admin', 'receptionist'] },
    { name: 'Settings & Integrations', href: '/settings', icon: SettingsIcon, roles: ['admin'] },
  ];

  const handleLogout = () => {
    localStorage.removeItem('cgst_token');
    localStorage.removeItem('cgst_user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Filter navigation items by role
  const visibleNavItems = navigation.filter(item => item.roles.includes(user.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-700 w-64 border-r border-slate-200">
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3 px-4 h-16 bg-slate-50 border-b border-slate-200">
        <img src={cgstLogo} alt="Logo" className="h-10 w-10 object-contain" />
        <div>
          <h1 className="font-extrabold text-sm tracking-wider text-slate-900 leading-tight">CGST BHAWAN</h1>
          <span className="text-[8px] text-corporate-600 font-bold uppercase tracking-widest mt-0.5 block leading-none">GHAZIABAD , UTTAR PRADESH</span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-250 ${active
                ? 'bg-corporate-600 text-white shadow-md shadow-corporate-700/30'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Session Badge & Logout Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-corporate-600" />
              <p className="text-[11px] font-semibold text-corporate-600 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border border-slate-250 bg-white text-slate-650 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center h-10 w-10 rounded-full text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-corporate-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content body wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white text-slate-800 border-b border-slate-200 shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <img src={cgstLogo} alt="Logo" className="h-8 w-8 object-contain" />
            <span className="font-extrabold text-xs tracking-wider uppercase">CGST Bhawan</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-md text-slate-400 hover:text-white focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Dynamic page contents */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
