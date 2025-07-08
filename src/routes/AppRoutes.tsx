// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { getFlatRoutes, menuConfig } from '../config/menuConfig';

// Páginas genéricas
import { GenericPage } from '../pages/GenericPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Páginas específicas
import RecomendacionesPage from '../pages/marketing-suite/nutricion/RecomendacionesPage';

export const AppRoutes = () => {
  const flatRoutes = getFlatRoutes(menuConfig);

  return (
    <Routes>
      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      
      {/* Ruta específica para Recomendaciones */}
      <Route 
        path="/marketing-suite/nutricion/recomendaciones" 
        element={<RecomendacionesPage />} 
      />
      
      {/* Rutas dinámicas basadas en la configuración del menú */}
      {flatRoutes
        .filter(route => route.path !== '/marketing-suite/nutricion/recomendaciones')
        .map((route) => (
          <Route
            key={route.id}
            path={route.path}
            element={
              <GenericPage 
                title={route.title}
                path={route.path}
                icon={route.icon}
              />
            }
          />
        ))}
      
      {/* Ruta 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};