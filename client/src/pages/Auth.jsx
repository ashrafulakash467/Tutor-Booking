import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, LogIn, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import api from '@/api';

const demoAccounts = [
  { name: 'admin', email: 'admin@example.com', password: 'password123', photoURL: '/images/pexels-photo-5303546.jpg', role: 'admin' },
];

// Set this to true later to require 6+ characters with uppercase and lowercase letters.
const ENABLE_STRONG_PASSWORD_VALIDATION = false;

function validatePassword(password) {
  if (!ENABLE_STRONG_PASSWORD_VALIDATION) return [];

  const errors = [];
  if (password.length < 6) errors.push('Must be at least 6 characters');
  if (!/[A-Z]/.test(password)) errors.push('Must have an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Must have a lowercase letter');
  return errors;
}

export default function Auth({ onAuth }) {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', photoURL: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const completeAuthentication = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    onAuth(user);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/users/signin', loginForm);
      completeAuthentication(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Please check the server connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPasswordErrors([]);

    const { password } = signupForm;
    
    // Validate password
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setPasswordErrors(pwdErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/users/signup', signupForm);
      completeAuthentication(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('User already exists with this email');
      } else {
        setError(err.response?.data?.message || 'Unable to create the account. Please check the server connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google sign-in is not configured yet. Please use email and password.');
  };

  const handleDemoLogin = async (account) => {
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/users/signin', {
        email: account.email,
        password: account.password,
      });

      if (res.data?.user?.role !== 'admin') {
        setError('The demo account is not configured as an admin.');
        return;
      }

      completeAuthentication(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in to the demo account. Please check the server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl dark:text-white">Welcome to Tutor-Booking</CardTitle>
            <CardDescription className="dark:text-gray-400">Sign in or create an account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant={error.includes('successfully') ? 'default' : 'destructive'} className={`mb-4 ${error.includes('successfully') ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''}`}>
                <AlertDescription className={error.includes('successfully') ? 'text-green-600 dark:text-green-400' : ''}>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Google Sign-In */}
            <Button
              variant="outline"
              className="w-full mb-4 gap-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              onClick={handleGoogleLogin}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            <div className="relative mb-4">
              <Separator className="dark:bg-gray-700" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2 text-xs text-gray-400">
                OR
              </span>
            </div>

            <Tabs defaultValue="login">
              <TabsList className="w-full mb-6 dark:bg-gray-700">
                <TabsTrigger value="login" className="flex-1 dark:text-gray-300 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 dark:text-gray-300 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-white">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block dark:text-gray-200">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600" type="email" placeholder="your@email.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block dark:text-gray-200">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10 pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
                      <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block dark:text-gray-200">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Your Name" value={signupForm.name} onChange={e => setSignupForm({...signupForm, name: e.target.value})} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block dark:text-gray-200">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600" type="email" placeholder="your@email.com" value={signupForm.email} onChange={e => setSignupForm({...signupForm, email: e.target.value})} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block dark:text-gray-200">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input className="pl-10 pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600" type={showPassword ? 'text' : 'password'} placeholder={ENABLE_STRONG_PASSWORD_VALIDATION ? 'Min 6 characters' : 'Enter a password'} value={signupForm.password} onChange={e => {
                        setSignupForm({...signupForm, password: e.target.value});
                        setPasswordErrors(validatePassword(e.target.value));
                      }} required />
                      <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                    {/* Password Validation */}
                    {ENABLE_STRONG_PASSWORD_VALIDATION && signupForm.password.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          {signupForm.password.length >= 6 ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={signupForm.password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            At least 6 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {/[A-Z]/.test(signupForm.password) ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={/[A-Z]/.test(signupForm.password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            Contains uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {/[a-z]/.test(signupForm.password) ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={/[a-z]/.test(signupForm.password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            Contains lowercase letter
                          </span>
                        </div>
                      </div>
                    )}
                    {passwordErrors.length > 0 && signupForm.password.length > 0 && (
                      <div className="mt-2 text-xs text-red-500 dark:text-red-400">
                        {passwordErrors.map((err, i) => (
                          <p key={i}>• {err}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block dark:text-gray-200">Photo URL (optional)</label>
                    <Input placeholder="https://example.com/photo.jpg" value={signupForm.photoURL} onChange={e => setSignupForm({...signupForm, photoURL: e.target.value})} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || passwordErrors.length > 0}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Demo Accounts */}
            <div className="mt-6">
              <div className="relative mb-4">
                <Separator className="dark:bg-gray-700" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2 text-xs text-gray-400">
                  DEMO ACCOUNTS
                </span>
              </div>
              <div className="space-y-2">
                {demoAccounts.map((account) => (
                  <button
                    type="button"
                    key={account.email}
                    onClick={() => handleDemoLogin(account)}
                    disabled={loading}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <img src={account.photoURL} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {account.name}
                        {account.role === 'admin' && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                            <Shield className="h-3 w-3" /> Admin
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{account.email}</p>
                    </div>
                    <LogIn className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
                Password for all demo accounts: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">password123</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
