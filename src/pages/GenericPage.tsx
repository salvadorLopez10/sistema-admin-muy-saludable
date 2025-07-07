// src/pages/GenericPage.tsx
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getBreadcrumbs, menuConfig } from '../config/menuConfig';

interface GenericPageProps {
  title?: string;
  path?: string;
  icon?: ReactNode;
}

export const GenericPage: React.FC<GenericPageProps> = ({ 
  title = "Página",
  path,
  icon 
}) => {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname, menuConfig);

  return (
    <div className="p-8 bg-white min-h-full">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.id} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <span className={index === breadcrumbs.length - 1 ? 'text-orange-600 font-medium' : 'hover:text-orange-600'}>
                  {crumb.title}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {icon && (
            <div className="text-4xl text-orange-600">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">Ruta: {path || location.pathname}</p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Contenido de {title}
        </h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 mb-4">
            Esta es una página genérica para <strong>{title}</strong>. 
            Aquí puedes agregar el contenido específico para esta sección.
          </p>
          
          <div className="bg-white p-4 rounded border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Información de la página:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>Título:</strong> {title}</li>
              <li><strong>Ruta:</strong> {path || location.pathname}</li>
              <li><strong>Breadcrumbs:</strong> {breadcrumbs.map(b => b.title).join(' > ')}</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-medium text-orange-900 mb-2">🚀 Próximos pasos:</h3>
            <p className="text-orange-800 text-sm">
              Reemplaza este contenido genérico con los componentes específicos para esta página.
              Puedes crear componentes dedicados en la carpeta <code>src/pages/</code> para cada sección.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};