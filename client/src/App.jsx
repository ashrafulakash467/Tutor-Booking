import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, BookOpen, GraduationCap, ChevronDown } from 'lucide-react';
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

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {}
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
    if (tab === 'tutor' && params?.id) {
      window.location.hash = `tutor/${params.id}`;
    } else {
      window.location.hash = tab;
    }
    setActiveTab(tab);
    if (tab === 'tutor' && params?.id) setTutorId(params.id);
    setMobileMenu(false);
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

  const navItems = [
    { label: 'Home', tab: 'home' },
    { label: 'Find Tutors', tab: 'find-tutors' },
    { label: 'Become a Tutor', tab: 'add-tutor' },
  ];

  const isActive = (tab) => activeTab === tab;

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home navigate={navigate} />;
      case 'find-tutors':
        return <FindTutors navigate={navigate} />;
      case 'tutor':
        return <TutorDetails navigate={navigate} user={user} tutorId={tutorId} />;
      case 'auth':
        return <Auth onAuth={handleAuth} />;
      case 'add-tutor':
        return <AddTutor user={user} navigate={navigate} />;
      case 'my-bookings':
        return <MyBookings user={user} navigate={navigate} />;
      case 'my-tutors':
        return <MyTutors user={user} navigate={navigate} />;
      default:
        return <NotFound navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate('home')} className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Tutor<span className="text-blue-600">Booking</span></span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => navigate(item.tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.tab)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* User Controls */}
            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('my-bookings')}>
                      <BookOpen className="h-4 w-4 mr-2" /> My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('my-tutors')}>
                      <GraduationCap className="h-4 w-4 mr-2" /> My Tutors
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate('auth')} variant="default" size="sm">
                  <User className="h-4 w-4 mr-2" /> Sign In
                </Button>
              )}
              <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
                {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenu && (
            <div className="md:hidden border-t py-4 space-y-1">
              {navItems.map((item) => (
                <button key={item.tab} onClick={() => navigate(item.tab)}
                  className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive(item.tab) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  {item.label}
                </button>
              ))}
              {user && (
                <>
                  <button onClick={() => navigate('my-bookings')}
                    className="block w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">My Bookings</button>
                  <button onClick={() => navigate('my-tutors')}
                    className="block w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">My Tutors</button>
                  <button onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold text-white">TutorBooking</span>
              </div>
              <p className="text-sm text-gray-400">Find your perfect tutor and start learning today.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Services</h4>
              <ul className="space-y-2 text-sm">
                <li>One-on-One Tutoring</li>
                <li>Group Sessions</li>
                <li>Test Preparation</li>
                <li>Homework Help</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>hello@tutorbooking.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Education St, NY</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="hover:text-blue-400 transition-colors">Twitter</a>
                <a href="#" className="hover:text-blue-400 transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            &copy; 2026 TutorBooking. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}