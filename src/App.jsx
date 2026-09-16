import { useState, useEffect } from 'react';
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
import AcademicianProfile from './components/Profile/AcademicianProfile';
import MySkills from './components/MySkills/MySkills';
import authService from './api/auth';
import Learning from './components/Learning/learning';
import Applications from './components/Applications/Applications';
import RecruiterPublicProfile from './components/Profile/RecruiterPublicProfile';
import './App.css';

function App() { 
  const [route, setRoute] = useState('home');
  const [user, setUser] = useState(() => authService.getUser());
  const [searchParams, setSearchParams] = useState({ query: '', selectedId: null, companyId: null });
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
      selectedId: extraParams?.selectedId || null,
      companyId: extraParams?.companyId || null,
      tab: extraParams?.tab || null
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

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-clip">
      {showNavbar && (
        <Navbar
          onRouteChange={handleRouteChange}
          user={user}
          onLogout={handleLogout}
          onSearchSubmit={handleSearchSubmit}
          onSearchSelect={handleSearchSelect}
          currentRoute={route}
        />
      )}

      <main className={`overflow-x-clip ${showNavbar ? (route === 'home' ? "pt-14" : "pt-20") : ""} ${route === 'home' ? 'h-screen overflow-hidden' : ''}`}>
        {route === 'home' && <Home onRouteChange={handleRouteChange} />}
        
        {route === 'opportunities' && (
          <Opportunities 
            onRouteChange={handleRouteChange} 
            initialSearch={searchParams.query}
            initialSelectedId={searchParams.selectedId}
            scheduledCalls={scheduledCalls}
            initialTab={searchParams.tab || 'explore'}
          />
        )}

        {(route === 'applications' || route === 'my-applications') && (
          <Applications onRouteChange={handleRouteChange} />
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
          (user?.role === 'academician' || user?.role === 'academia') ? (
            <AcademicianProfile />
          ) : (
            <Profile 
              onRouteChange={handleRouteChange}
              user={user}
              onUserUpdate={handleVerificationSuccess}
              initialTab="overview"
            />
          )
        )}
        
        {route === 'academician-profile' && <AcademicianProfile />}
        {(route === 'recruiter-profile' || route === 'recruiter') && (
          <RecruiterPublicProfile
            recruiterId={searchParams.selectedId}
            companyId={searchParams.companyId}
            onRouteChange={handleRouteChange}
          />
        )}
        {route === 'institution-analytics' && <Acadmecian onRouteChange={handleRouteChange} initialSubTab="analytics" />}
        {route === 'institution-lectures' && <Acadmecian onRouteChange={handleRouteChange} initialSubTab="lectures" />}
        {(route === 'institution-organization' || route === 'institution-governance') && <Acadmecian onRouteChange={handleRouteChange} initialSubTab="governance" />}
        {route === 'institution-compliance' && <AcademicianProfile />}
        {route === 'institution-hub' && <Acadmecian onRouteChange={handleRouteChange} />}

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
        {route === 'upload-lectures' && <Acadmecian onRouteChange={handleRouteChange} initialSubTab="lectures" />}
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