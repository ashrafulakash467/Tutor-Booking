import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, GraduationCap, ChevronDown, Sun, Moon, PlusCircle, List, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Home from '@/pages/Home';
import FindTutors from '@/pages/FindTutors';
import TutorDetails from '@/pages/TutorDetails';
import Auth from '@/pages/Auth';
import AddTutor from '@/pages/AddTutor';
import MyBookings from '@/pages/MyBookings';
import MyTutors from '@/pages/MyTutors';
import NotFound from '@/pages/NotFound';

function getTabFromHash() {
  const hash = window.location.hash.replace('#', '') || 'home';
  return hash;
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => getTabFromHash());
  const [user, setUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [tutorId, setTutorId] = useState(null);
  const [editTutor, setEditTutor] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const isAdmin = user?.role === 'admin';

  // Dynamic page title
  useEffect(() => {
    const titles = {
      'home': 'MediQueue - Find Your Perfect Tutor',
      'find-tutors': 'Find Tutors - MediQueue',
      'tutor': 'Tutor Details - MediQueue',
      'auth': 'Sign In - MediQueue',
      'add-tutor': 'Add Tutor - MediQueue',
      'my-bookings': 'My Bookings - MediQueue',
      'my-tutors': 'My Tutors - MediQueue',
    };
    document.title = titles[activeTab] || 'MediQueue - Tutor Booking';
  }, [activeTab]);

  // Dark mode class management
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { 
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // If user is logged in and on auth page, redirect to home
        const currentHash = window.location.hash.replace('#', '');
        if (currentHash === 'auth' || !currentHash) {
          window.location.hash = 'home';
          setActiveTab('home');
        }
      } catch { /* ignore parse errors */ }
    }
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('tutor/')) {
        setTutorId(hash.replace('tutor/', ''));
        setActiveTab('tutor');
      } else {
        setActiveTab(hash || 'home');
        setTutorId(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (tab, params) => {
    // Private route protection
    const privateRoutes = ['add-tutor', 'my-bookings', 'my-tutors'];
    if (privateRoutes.includes(tab) && !user) {
      window.location.hash = 'auth';
      setActiveTab('auth');
      setMobileMenu(false);
      return;
    }

    // Admin-only routes: Add Tutor and My Tutors (manage all tutors)
    const adminRoutes = ['add-tutor', 'my-tutors'];
    if (adminRoutes.includes(tab) && user?.role !== 'admin') {
      window.location.hash = 'find-tutors';
      setActiveTab('find-tutors');
      setMobileMenu(false);
      return;
    }

    if (tab === 'tutor' && params?.id) {
      window.location.hash = `tutor/${params.id}`;
    } else if (tab === 'add-tutor' && params?.editTutor) {
      setEditTutor(params.editTutor);
      window.location.hash = 'add-tutor';
    } else {
      window.location.hash = tab;
    }
    setActiveTab(tab);
    if (tab === 'tutor' && params?.id) setTutorId(params.id);
    if (tab !== 'add-tutor') setEditTutor(null);
    setMobileMenu(false);
  };

  const onCancelEdit = () => {
    setEditTutor(null);
    navigate('my-tutors');
  };

  const handleAuth = (userData) => {
    setUser(userData);
    window.location.hash = 'home';
    setActiveTab('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.hash = 'home';
    setActiveTab('home');
  };

  // Nav items for all users (non-admin)
  const publicNavItems = [
    { label: 'Home', tab: 'home' },
    { label: 'Find Tutors', tab: 'find-tutors' },
  ];

  // Logged-in nav items added dynamically
  // Admin can see: My Bookings, My Tutors (all tutors), Add Tutor
  // Regular users can see: My Bookings only
  const loggedInNavItems = user ? [
    { label: 'My Bookings', tab: 'my-bookings', icon: Calendar },
    ...(user.role === 'admin' ? [
      { label: 'My Tutors', tab: 'my-tutors', icon: List },
      { label: 'Add Tutor', tab: 'add-tutor', icon: PlusCircle },
    ] : []),
  ] : [];

  const allNavItems = [...publicNavItems, ...loggedInNavItems];

  const isActive = (tab) => activeTab === tab;

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home navigate={navigate} user={user} />;
      case 'find-tutors':
        return <FindTutors navigate={navigate} />;
      case 'tutor':
        return <TutorDetails navigate={navigate} user={user} tutorId={tutorId} isAdmin={isAdmin} />;
      case 'auth':
        return <Auth onAuth={handleAuth} />;
      case 'add-tutor':
        return <AddTutor user={user} navigate={navigate} editTutor={editTutor} onCancelEdit={onCancelEdit} isAdmin={isAdmin} />;
      case 'my-bookings':
        return <MyBookings user={user} navigate={navigate} />;
      case 'my-tutors':
        return <MyTutors user={user} navigate={navigate} />;
      default:
        return <NotFound navigate={navigate} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-b'}`}>
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate('home')} className="flex items-center gap-2 group">
              <GraduationCap className="h-8 w-8 text-blue-600 transition-transform group-hover:scale-110" />
              <span className={`text-xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>Medi<span className="text-blue-600">Queue</span></span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {allNavItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => navigate(item.tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.tab)
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : `${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* User Controls */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <Avatar className="h-8 w-8 ring-2 ring-blue-500/30">
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`hidden sm:block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{user.name}</span>
                      <ChevronDown className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={`w-56 ${darkMode ? 'dark bg-gray-800 border-gray-700' : ''}`}>
                    <DropdownMenuItem onClick={() => navigate('my-bookings')} className={darkMode ? 'text-gray-200 focus:bg-gray-700' : ''}>
                      <Calendar className="h-4 w-4 mr-2" /> My Booked Sessions
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('my-tutors')} className={darkMode ? 'text-gray-200 focus:bg-gray-700' : ''}>
                          <List className="h-4 w-4 mr-2" /> All Tutors
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('add-tutor')} className={darkMode ? 'text-gray-200 focus:bg-gray-700' : ''}>
                          <PlusCircle className="h-4 w-4 mr-2" /> Add Tutor
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className={darkMode ? 'bg-gray-700' : ''} />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className={`${darkMode ? 'focus:bg-gray-700' : ''} text-red-600`}>
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate('auth')} variant="default" size="sm" className="animate-pulse-subtle">
                  <User className="h-4 w-4 mr-2" /> Sign In
                </Button>
              )}
              <button className={`md:hidden p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`} onClick={() => setMobileMenu(!mobileMenu)}>
                {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenu && (
            <div className={`md:hidden border-t py-4 space-y-1 animate-slide-down ${darkMode ? 'border-gray-700' : ''}`}>
              {allNavItems.map((item) => (
                <button key={item.tab} onClick={() => navigate(item.tab)}
                  className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.tab) 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                      : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
                  }`}>
                  {item.label}
                </button>
              ))}
              {user && (
                <>
                  <button onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Sign Out</button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 animate-fade-in">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className={`transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-gray-400' : 'bg-gray-900 text-gray-300'}`}>
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold text-white">MediQueue</span>
              </div>
              <p className="text-sm">Find your perfect tutor and start learning today. Quality education tailored to your needs.</p>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <h4 className="font-semibold text-white mb-3">Tutor Services</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-blue-400 transition-colors cursor-pointer">One-on-One Tutoring</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Group Sessions</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Test Preparation</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Homework Help</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Online Learning</li>
              </ul>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">📧 hello@mediqueue.com</li>
                <li className="flex items-center gap-2">📞 +1 (555) 123-4567</li>
                <li className="flex items-center gap-2">📍 123 Education St, NY</li>
              </ul>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <h4 className="font-semibold text-white mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="hover:text-blue-400 transition-colors" aria-label="X (Twitter)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className={`border-t mt-8 pt-8 text-center text-sm ${darkMode ? 'border-gray-800' : 'border-gray-800'}`}>
            &copy; 2026 MediQueue. All rights reserved. | Empowering students through quality tutoring.
          </div>
        </div>
      </footer>
    </div>
  );
}