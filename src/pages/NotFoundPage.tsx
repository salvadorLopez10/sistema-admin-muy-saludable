// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { MdError, MdHome } from 'react-icons/md';

export const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-white p-8">
      <div className="text-center">
        <MdError className="text-8xl text-orange-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          to="/inicio"
          className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <MdHome />
          Ir al Inicio
        </Link>
      </div>
    </div>
  );
};