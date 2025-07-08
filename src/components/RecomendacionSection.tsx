import React from 'react';
import { MdDelete } from 'react-icons/md';
import { ImageDropzone } from './ImageDropzone';

export interface RecomendacionData {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: File | null;
}

export interface RecomendacionSectionProps {
    data: RecomendacionData;
    index: number;
    onChange: (id: string, field: keyof RecomendacionData, value: string | File | null) => void;
    onRemove?: (id: string) => void;
    showRemoveButton?: boolean;
}

export const RecomendacionSection: React.FC<RecomendacionSectionProps> = ({
  data,
  index,
  onChange,
  onRemove,
  showRemoveButton = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header de la sección */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Recomendación {index + 1}
        </h3>
        {showRemoveButton && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(data.id)}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
            aria-label="Eliminar recomendación"
          >
            <MdDelete size={20} />
          </button>
        )}
      </div>

      {/* Campo de título */}
      <div className="space-y-2">
        <label 
          htmlFor={`titulo-${data.id}`}
          className="block text-sm font-medium text-gray-700"
        >
          Título *
        </label>
        <input
          id={`titulo-${data.id}`}
          type="text"
          value={data.titulo}
          onChange={(e) => onChange(data.id, 'titulo', e.target.value)}
          placeholder="Ingresa el título de la recomendación"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          required
        />
      </div>

      {/* Campo de descripción */}
      <div className="space-y-2">
        <label 
          htmlFor={`descripcion-${data.id}`}
          className="block text-sm font-medium text-gray-700"
        >
          Descripción *
        </label>
        <textarea
          id={`descripcion-${data.id}`}
          value={data.descripcion}
          onChange={(e) => onChange(data.id, 'descripcion', e.target.value)}
          placeholder="Describe la recomendación nutricional..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-vertical"
          required
        />
      </div>

      {/* Campo de imagen */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Imagen
        </label>
        <ImageDropzone
          onImageChange={(file) => onChange(data.id, 'imagen', file)}
          className="w-full"
        />
      </div>
    </div>
  );
};