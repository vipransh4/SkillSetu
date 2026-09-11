import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Home from './components/Home/Home';
import Navbar from './components/Navbar/Navbar';
import SignIn from './components/SignIn/SignIn';
import Register from './components/SignIn/Register';
import VerifyEmail from './components/SignIn/VerifyEmail';
import Opportunities from './components/Opportunities/Opportunities';
import Students from './components/Students/Students';
import Industry from './components/Uploading/Industry';
import Acadmecian from './components/Uploading/Acadmecian';
import StudentPortfolio from './components/Uploading/StudentPortfolio';
import Profile from './components/Profile/Profile';
import MySkills from './components/MySkills/MySkills';
import authService from './api/auth';
import Learning from './components/Learning/learning';
import './App.css';

function App() { 
  const [route, setRoute] = useState('home');
  const [user, setUser] = useState(() => authService.getUser());
  const [searchParams, setSearchParams] = useState({ query: '', selectedId: null });
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [scheduledCalls, setScheduledCalls] = useState([]);
  
  const addScheduledCall = (call) => {
    setScheduledCalls((prev) => [...prev, call]);
  };
  
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      authService.getCurrentUser()
        .then((freshUser) => {
          if (freshUser) {
            setUser(freshUser);
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            authService.logout();
            setUser(null);
          }
        });
    }

    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verify_token');
    if (verifyToken) {
      authService.verifyEmail({ token: verifyToken })
        .then(() => {
          authService.getCurrentUser().then((u) => u && setUser(u));
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(() => {});
    }
  }, []);

  const handleRouteChange = (newRoute, extraParams = {}) => {
    setSearchParams({
      query: extraParams?.query || '',
      selectedId: extraParams?.selectedId || null
    });
    setRoute(newRoute);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setRoute('home');
  };

  const handleVerificationSuccess = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setRoute('home');
  };

  const handleSearchSubmit = ({ query, role }) => {
    setSearchParams({ query, selectedId: null });
    if (role === 'industry') {
      setRoute('students');
    } else {
      setRoute('opportunities');
    }
  };

  const handleSearchSelect = ({ type, item }) => {
    if (type === 'candidate') {
      setSearchParams({ query: '', selectedId: item.id });
      setRoute('students');
    } else {
      setSearchParams({ query: '', selectedId: item.id });
      setRoute('opportunities');
    }
  };

  const showNavbar = route !== 'signin' && route !== 'register';
  const isBannerVisible = showNavbar && user && !user.is_email_verified && route !== 'verify-email' && !isBannerDismissed;

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {showNavbar && (
        <Navbar
          onRouteChange={handleRouteChange}
          user={user}
          onLogout={handleLogout}
          onSearchSubmit={handleSearchSubmit}
          onSearchSelect={handleSearchSelect}
        />
      )}

      {isBannerVisible && (
        <div className="fixed top-20 left-0 right-0 z-40 flex justify-center px-4">
          <div className="w-full max-w-4xl bg-amber-500/10 backdrop-blur-md border border-amber-300 text-amber-900 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
              <p className="truncate">
                Please verify your email address (<strong>{user.email}</strong>) to complete your profile verification.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                onClick={() => handleRouteChange('verify-email')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors shrink-0 cursor-pointer shadow-sm active:scale-95"
              >
                Verify Email
              </button>
              <button
                onClick={() => setIsBannerDismissed(true)}
                className="p-1 text-amber-800/60 hover:text-amber-950 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer"
                title="Dismiss notice"
                aria-label="Dismiss notice"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className={`overflow-x-hidden ${showNavbar ? (isBannerVisible ? "pt-32" : "pt-20") : ""} ${route === 'home' ? 'h-screen overflow-hidden' : ''}`}>
        {route === 'home' && <Home onRouteChange={handleRouteChange} />}
        
        {route === 'opportunities' && (
          <Opportunities 
            onRouteChange={handleRouteChange} 
            initialSearch={searchParams.query}
            initialSelectedId={searchParams.selectedId}
            scheduledCalls={scheduledCalls}
          />
        )}

        {(route === 'students' || route === 'candidates') && (
          user?.role === 'industry' ? (
            <Students 
              onRouteChange={handleRouteChange} 
              initialSearch={searchParams.query}
              initialSelectedId={searchParams.selectedId}
            />
          ) : (
            <Opportunities 
              onRouteChange={handleRouteChange} 
              initialSearch={searchParams.query}
              initialSelectedId={searchParams.selectedId}
              scheduledCalls={scheduledCalls}
            />
          )
        )}
        
        {route === 'signin' && (
          <SignIn 
            onRouteChange={handleRouteChange} 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}
        {route === 'register' && (
          <Register 
            onRouteChange={handleRouteChange} 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}
        {route === 'verify-email' && (
          <VerifyEmail 
            user={user}
            onVerificationSuccess={handleVerificationSuccess}
            onRouteChange={handleRouteChange}
          />
        )}
        
        {route === 'profile' && (
          <Profile 
            onRouteChange={handleRouteChange}
            user={user}
            onUserUpdate={handleVerificationSuccess}
            initialTab="overview"
          />
        )}

        {route === 'settings' && (
          <Profile 
            onRouteChange={handleRouteChange}
            user={user}
            onUserUpdate={handleVerificationSuccess}
            initialTab="settings"
          />
        )}
        
        {route === 'my-skills' && (
          user?.role === 'student' ? (
            <MySkills 
              onRouteChange={handleRouteChange} 
              onSelectOpportunity={(oppId) => handleRouteChange('opportunities', { selectedId: oppId })}
              initialTab="matrix" 
            />
          ) : (
            <Opportunities 
              onRouteChange={handleRouteChange} 
              initialSearch={searchParams.query}
              initialSelectedId={searchParams.selectedId}
              scheduledCalls={scheduledCalls} 
            />
          )
        )}

        {route === 'upload-skills' && <StudentPortfolio onRouteChange={handleRouteChange} />}
        {route === 'upload-lectures' && <Acadmecian onRouteChange={handleRouteChange} />}
        {route === 'post-jobs' && <Industry onRouteChange={handleRouteChange} scheduledCalls={scheduledCalls} onScheduleCall={addScheduledCall} />}
        {route === 'learning' && <Learning onRouteChange={handleRouteChange} />}

        {route === 'opportunity' && (
          user?.role === 'academician' 
            ? <Acadmecian onRouteChange={handleRouteChange} />
            : <Opportunities 
                onRouteChange={handleRouteChange} 
                initialSearch={searchParams.query || "Opportunities"} 
                initialSelectedId={searchParams.selectedId}
                scheduledCalls={scheduledCalls} 
              />
        )}
        
        {route === 'assessment' && (
          user?.role === 'student'
            ? <MySkills 
                onRouteChange={handleRouteChange} 
                onSelectOpportunity={(oppId) => handleRouteChange('opportunities', { selectedId: oppId })}
                initialTab="assessment" 
              />
            : (user?.role === 'industry' 
                ? <Students onRouteChange={handleRouteChange} /> 
                : <Opportunities 
                    onRouteChange={handleRouteChange} 
                    initialSearch={searchParams.query || "Assessment"} 
                    initialSelectedId={searchParams.selectedId}
                    scheduledCalls={scheduledCalls} 
                  />)
        )}
      </main>
    </div>
  );
}

export default App;