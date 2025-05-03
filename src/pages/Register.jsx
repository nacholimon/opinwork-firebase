import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const invitationId = searchParams.get('invitation');

  useEffect(() => {
    const checkInvitation = async () => {
      if (!invitationId) {
        setError('No se proporcionó invitación.');
        setLoading(false);
        return;
      }
      const invitationRef = doc(db, 'invitations', invitationId);
      const invitationSnap = await getDoc(invitationRef);
      if (!invitationSnap.exists()) {
        setError('Invitación no encontrada.');
        setLoading(false);
        return;
      }
      const data = invitationSnap.data();
      if (data.used) {
        setError('Esta invitación ya fue utilizada.');
        setLoading(false);
        return;
      }
      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        setError('Esta invitación ha expirado.');
        setLoading(false);
        return;
      }
      setLoading(false);
    };
    checkInvitation();
    // eslint-disable-next-line
  }, [invitationId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      // Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Crear usuario en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: 'user',
        createdAt: new Date(),
        active: true
      });
      // Marcar invitación como usada
      await updateDoc(doc(db, 'invitations', invitationId), {
        used: true,
        usedBy: userCredential.user.uid,
        usedAt: new Date()
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Verificar si el usuario ya existe en la colección users
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || '',
          email: user.email,
          phone: '',
          role: 'user',
          createdAt: new Date(),
          active: true
        });
      }
      // Marcar invitación como usada
      await updateDoc(doc(db, 'invitations', invitationId), {
        used: true,
        usedBy: user.uid,
        usedAt: new Date()
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Registro por invitación
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-700"
                placeholder="Nombre completo"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-700"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-700"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Teléfono (opcional)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-700"
                placeholder="Teléfono"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {submitting ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full mt-2 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={submitting}
          >
            Registrarse con Google
          </button>
        </div>
      </div>
    </div>
  );
} 