import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FirstAdmin from './pages/FirstAdmin';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import Register from './pages/Register';
import CreditSimulator from './pages/CreditSimulator';
import HousingCatalog from './pages/HousingCatalog';
import Landing from './pages/Landing';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function SplashOrRedirect() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (currentUser) {
        await getDoc(doc(db, 'users', currentUser.uid));
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    checkRole();
  }, [currentUser]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  if (!currentUser) return <Landing />;
  return <Navigate to="/dashboard" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              <Routes>
                <Route path="/" element={<SplashOrRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/admin-users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/first-admin" element={<FirstAdmin />} />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/register" element={<Register />} />
                <Route path="/credit-simulator" element={<PrivateRoute><CreditSimulator /></PrivateRoute>} />
                <Route path="/housing-catalog" element={<PrivateRoute><HousingCatalog /></PrivateRoute>} />
              </Routes>
            </main>
          </div>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
