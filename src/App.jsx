import { useState } from 'react';
import Home from './components/Home/Home';
import Navbar from './components/Navbar/Navbar';
import SignIn from './components/SignIn/SignIn';
import Register from './components/SignIn/Register';
import Opportunities from './components/Opportunities/Opportunities';
import Industry from './components/Uploading/Industry';
import Acadmecian from './components/Uploading/Acadmecian';
import StudentPortfolio from './components/Uploading/StudentPortfolio';
import './App.css';

function App() { 
  const [route, setRoute] = useState('home');
  const [user, setUser] = useState(null);

  const handleRouteChange = (newRoute) => {
    setRoute(newRoute);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData); // Saves role & user details
    setRoute('home');   // Switches back home
  };

  const handleLogout = () => {
    setUser(null);
    setRoute('home');
  };

  // Only hide navbar when signing in or registering
  const showNavbar = route !== 'signin' && route !== 'register';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* GLOBAL NAVBAR: Receives user state directly */}
      {showNavbar && (
        <Navbar
          onRouteChange={handleRouteChange}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <main className={showNavbar ? "pt-20" : ""}>
        {route === 'home' && <Home onRouteChange={handleRouteChange} />}
        {route === 'opportunities' && <Opportunities onRouteChange={handleRouteChange} />}
        
        {/* Pass handleLoginSuccess to both */}
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
        
        {/* Upload Views */}
        {route === 'upload-skills' && <StudentPortfolio onRouteChange={handleRouteChange} />}
        {route === 'upload-lectures' && <Acadmecian onRouteChange={handleRouteChange} />}
        {route === 'post-jobs' && <Industry onRouteChange={handleRouteChange} />}
      </main>
    </div>
  );
}

export default App;