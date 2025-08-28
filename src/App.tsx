// src/App.tsx
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { AppRoutes } from './routes/AppRoutes';
import './index.css';

// Función para obtener el basename según el ambiente
const getBasename = () => {
  const env = import.meta.env.VITE_APP_ENV;
  console.log('Entorno actual (VITE_APP_ENV):', env);
  if (env === 'production') return '/sistema_admin';
  if (env === 'development') return '/sistema_admin_qa';
  return ''; // Para desarrollo local (localhost)
};


function App() {
  return (
    <AuthProvider>
      <Router basename={getBasename()}>
        <ProtectedRoute>
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 overflow-y-auto w-full">
              <AppRoutes />
            </div>
          </div>
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;