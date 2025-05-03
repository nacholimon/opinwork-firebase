import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to My App</h1>
      <p className="text-xl mb-8">A modern web application built with React and Firebase</p>
      {!currentUser && (
        <Link
          to="/login"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Get Started
        </Link>
      )}
    </div>
  );
} 