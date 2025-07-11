// src/components/DateRangePicker.tsx
import React from 'react';
import { MdCalendarToday } from 'react-icons/md';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
  disabled?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = "",
  disabled = false
}) => {
  // Obtener fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Validar que la fecha de fin no sea menor que la de inicio
  const handleStartDateChange = (date: string) => {
    onStartDateChange(date);
    // Si la fecha de fin es menor que la nueva fecha de inicio, actualizarla
    if (endDate && date > endDate) {
      onEndDateChange(date);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-ms p-2 rounded-lg">
            <MdCalendarToday className="text-orange-ms text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Rango de Fechas de Vigencia
            </h3>
            <p className="text-gray-600 text-sm">
              Define el rango de cuándo será visible el contenido
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fecha Desde */}
          <div className="space-y-2">
            <label 
              htmlFor="fecha-desde"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha Desde *
            </label>
            <div className="relative">
              <input
                id="fecha-desde"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                min={today}
                disabled={disabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              El contenido comenzará a mostrarse desde esta fecha
            </p>
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-2">
            <label 
              htmlFor="fecha-hasta"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha Hasta *
            </label>
            <div className="relative">
              <input
                id="fecha-hasta"
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={startDate || today}
                disabled={disabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              El contenido dejará de mostrarse después de esta fecha
            </p>
          </div>
        </div>

        {/* Información del rango seleccionado */}
        {startDate && endDate && (
          <div className="mt-4 p-3 bg-yellow-50 border border-orange-ms rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-brown-ms">
                Duración del rango:
              </span>
              <span className="text-orange-ms">
                {(() => {
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  const diffTime = Math.abs(end.getTime() - start.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                  return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
                })()}
              </span>
            </div>
            <div className="text-xs text-orange-ms mt-1">
              Desde {new Date(startDate).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} hasta {new Date(endDate).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        )}

        {/* Advertencia si las fechas son inválidas */}
        {startDate && endDate && startDate > endDate && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              ⚠️ La fecha de fin no puede ser anterior a la fecha de inicio
            </p>
          </div>
        )}
      </div>
    </div>
  );
};