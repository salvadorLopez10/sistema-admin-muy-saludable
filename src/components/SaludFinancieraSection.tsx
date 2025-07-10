// src/components/SaludFinancieraSection.tsx
import React from 'react';
import { MdDelete } from 'react-icons/md';
import { ImageDropzone } from './ImageDropzone';

export interface SaludFinancieraData {
  id: string;
  titulo: string;
  contenido: string;
  imagen: File | null;
}

interface SaludFinancieraSectionProps {
  data: SaludFinancieraData;
  index: number;
  onChange: (id: string, field: keyof SaludFinancieraData, value: string | File | null) => void;
  onRemove?: (id: string) => void;
  showRemoveButton?: boolean;
}

export const SaludFinancieraSection: React.FC<SaludFinancieraSectionProps> = ({
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
          Contenido {index + 1}
        </h3>
        {showRemoveButton && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(data.id)}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
            aria-label="Eliminar contenido"
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
          placeholder="Ej: 3 TIPS PARA EL AHORRO"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          required
        />
      </div>

      {/* Campo de contenido */}
      <div className="space-y-2">
        <label 
          htmlFor={`contenido-${data.id}`}
          className="block text-sm font-medium text-gray-700"
        >
          Contenido *
        </label>
        <textarea
          id={`contenido-${data.id}`}
          value={data.contenido}
          onChange={(e) => onChange(data.id, 'contenido', e.target.value)}
          placeholder="Ej: 1. Separa una parte de tu sueldo para ahorros en cuanto lo recibas.&#10;2. Lleva un registro de tus gastos para saber en qué se va tu dinero.&#10;3. Antes de comprar algo, pregúntate si realmente lo necesitas."
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-vertical"
          required
        />
        <p className="text-xs text-gray-500">
          Escribe el contenido del tip o consejo financiero
        </p>
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