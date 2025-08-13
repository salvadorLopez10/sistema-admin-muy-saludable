// src/pages/marketing-suite/PlanesAlimenticiosPage.tsx
import React, { useState, useEffect } from 'react';
import { MdDescription, MdSave, MdCancel } from 'react-icons/md';
import { MuySaludableApi } from '../../api/MuySaludableApi';

// Interfaces para los datos
interface PlanAlimenticio {
  id: number;
  nombre: string;
  resumen: string;
  descripcion_detallada: string;
  duracion_meses: string;
  precio: string;
  precio_regular: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PlanesResponse {
  elementos: PlanAlimenticio[];
}

const PlanesAlimenticiosPage: React.FC = () => {
  // Estados del formulario
  const [planes, setPlanes] = useState<PlanAlimenticio[]>([]);
  const [planesOriginales, setPlanesOriginales] = useState<PlanAlimenticio[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarPlanes();
  }, []);

  // Función para cargar planes desde el API
  const cargarPlanes = async () => {
    try {
      setIsLoadingData(true);
      console.log('Cargando planes alimenticios...');

      const apiInstance = MuySaludableApi();
      const response = await apiInstance.get<PlanesResponse>('/planesAlimenticios');

      if (response.data && response.data.elementos) {
        console.log('Planes cargados exitosamente:', response.data.elementos);
        setPlanes(response.data.elementos);
        setPlanesOriginales(JSON.parse(JSON.stringify(response.data.elementos))); // Copia profunda
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error cargando planes alimenticios:', error);
      alert('Error al cargar los planes alimenticios. Por favor recarga la página.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Función para actualizar un campo específico de un plan
  const actualizarPlan = (planId: number, campo: keyof PlanAlimenticio, valor: string) => {
    setPlanes(prev =>
      prev.map(plan =>
        plan.id === planId ? { ...plan, [campo]: valor } : plan
      )
    );
  };

  // Verificar si hay cambios
  const hayChangios = (): boolean => {
    return JSON.stringify(planes) !== JSON.stringify(planesOriginales);
  };

  // Validar que todos los campos estén completos
  const validarFormulario = (): boolean => {
    return planes.every(plan =>
      plan.nombre.trim() !== '' &&
      plan.resumen.trim() !== '' &&
      plan.descripcion_detallada.trim() !== '' &&
      plan.duracion_meses.trim() !== '' &&
      plan.precio.trim() !== '' &&
      plan.precio_regular.trim() !== ''
    );
  };

  // Función para guardar cambios
  const guardarCambios = async () => {
    if (!validarFormulario()) {
      alert('Por favor completa todos los campos obligatorios de todos los planes');
      return;
    }

    if (!hayChangios()) {
      alert('No hay cambios que guardar');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Guardando cambios en los planes...');

    try {
      const apiInstance = MuySaludableApi();
      
      // Actualizar cada plan que haya cambiado
      for (const plan of planes) {
        const planOriginal = planesOriginales.find(p => p.id === plan.id);
        
        if (planOriginal && JSON.stringify(plan) !== JSON.stringify(planOriginal)) {
          console.log(`Actualizando plan ${plan.id}:`, plan);
          
          const payload = {
            nombre: plan.nombre.trim(),
            resumen: plan.resumen.trim(),
            descripcion_detallada: plan.descripcion_detallada.trim(),
            duracion_meses: plan.duracion_meses.trim(),
            precio: plan.precio.trim(),
            precio_regular: plan.precio_regular.trim()
          };

          await apiInstance.put(`/planesAlimenticios/${plan.id}`, payload);
        }
      }

      setLoadingMessage('¡Cambios guardados exitosamente!');
      
      // Pequeña pausa para mostrar el mensaje de éxito
      setTimeout(() => {
        alert('¡Éxito! Los planes alimenticios han sido actualizados correctamente.');
        
        // Actualizar los planes originales con los nuevos datos
        setPlanesOriginales(JSON.parse(JSON.stringify(planes)));
        
        setIsLoading(false);
        setLoadingMessage('');
      }, 1000);

    } catch (error) {
      console.error('Error guardando planes alimenticios:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudieron guardar los cambios';
      alert(`Error: ${errorMessage}`);
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Función para cancelar cambios
  const cancelarCambios = () => {
    if (hayChangios()) {
      if (confirm('¿Estás seguro de que quieres descartar todos los cambios?')) {
        setPlanes(JSON.parse(JSON.stringify(planesOriginales))); // Restaurar datos originales
      }
    }
  };

  // Componente de loading inicial
  if (isLoadingData) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando...</h3>
          <p className="text-gray-600 text-sm">Obteniendo información de los planes alimenticios</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay de carga */}
      {isLoading && (
        <>
          <div className="fixed inset-0 bg-black opacity-25 z-50"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Procesando...</h3>
              <p className="text-gray-600 text-sm">{loadingMessage}</p>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="min-h-full bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-ms p-3 rounded-lg">
                <MdDescription className="text-orange-ms text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Planes Alimenticios
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona los precios y descripciones de los planes alimenticios para tus clientes.
                </p>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500">
              <span>Marketing Suite</span> / <span className="text-orange-ms font-medium">Planes Alimenticios</span>
            </nav>
          </div>

          {/* Indicador de cambios */}
          {hayChangios() && !isLoading && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-amber-600 mr-3">⚠️</div>
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Cambios sin guardar</h3>
                  <p className="text-sm text-amber-700">Tienes cambios pendientes. No olvides guardar antes de salir.</p>
                </div>
              </div>
            </div>
          )}

          {/* Planes alimenticios */}
          <div className="space-y-8">
            {planes.map((plan, index) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Plan {index + 1}
                  </h2>

                  {/* <p className="text-sm text-gray-500 mt-1">
                    ID: {plan.id}
                  </p> */}
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <label 
                    htmlFor={`nombre-plan-${plan.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombre *
                  </label>
                  <input
                    id={`nombre-plan-${plan.id}`}
                    type="text"
                    value={plan.nombre}
                    onChange={(e) => actualizarPlan(plan.id, 'nombre', e.target.value)}
                    placeholder="Ingresa el nombre del plan alimenticio disponible para compra"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={true}
                  />
                </div>

                {/* Resumen */}
                <div className="space-y-2">
                  <label 
                    htmlFor={`resumen-${plan.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Resumen *
                  </label>
                  <textarea
                    id={`resumen-${plan.id}`}
                    value={plan.resumen}
                    onChange={(e) => actualizarPlan(plan.id, 'resumen', e.target.value)}
                    placeholder="Ingresa un resumen breve del plan alimenticio"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-vertical"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Descripción detallada */}
                <div className="space-y-2">
                  <label 
                    htmlFor={`descripcion-${plan.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Descripción *
                  </label>
                  <textarea
                    id={`descripcion-${plan.id}`}
                    value={plan.descripcion_detallada}
                    onChange={(e) => actualizarPlan(plan.id, 'descripcion_detallada', e.target.value)}
                    placeholder="Ingresa la descripción completa del plan alimenticio"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-vertical"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Campos en fila */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Duración */}
                  <div className="space-y-2">
                    <label 
                      htmlFor={`periodo-plan-${plan.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Periodo del plan *
                    </label>
                    <input
                      id={`periodo-plan-${plan.id}`}
                      type="text"
                      value={plan.duracion_meses}
                      onChange={(e) => actualizarPlan(plan.id, 'duracion_meses', e.target.value)}
                      placeholder="Ej: 1, 2, 12"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                      Cantidad de meses que dura el plan alimenticio
                    </p>
                  </div>

                  {/* Precio regular */}
                  <div className="space-y-2">
                    <label 
                      htmlFor={`precio-regular-${plan.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Precio Regular *
                    </label>
                    <input
                      id={`precio-regular-${plan.id}`}
                      type="text"
                      value={plan.precio_regular}
                      onChange={(e) => actualizarPlan(plan.id, 'precio_regular', e.target.value)}
                      placeholder="Ej: 500.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                      Precio regular del plan alimenticio sin descuento
                    </p>
                  </div>

                  {/* Precio promocional */}
                  <div className="space-y-2">
                    <label 
                      htmlFor={`precio-promocional-${plan.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Precio Promocional *
                    </label>
                    <input
                      id={`precio-promocional-${plan.id}`}
                      type="text"
                      value={plan.precio}
                      onChange={(e) => actualizarPlan(plan.id, 'precio', e.target.value)}
                      placeholder="Ej: 250.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                      Precio promocional del plan alimenticio con descuento aplicado
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={cancelarCambios}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdCancel size={20} />
              Cancelar
            </button>
            
            <button
              type="button"
              onClick={guardarCambios}
              disabled={isLoading || !validarFormulario() || !hayChangios()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-ms text-white rounded-lg hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdSave size={20} />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

          {/* Info adicional */}
          <div className="mt-8 bg-green-50 border border-green-ms rounded-lg p-4">
            <h3 className="font-medium text-green-ms mb-2">💡 Información importante:</h3>
            <ul className="text-sm text-green-ms space-y-1">
              <li>• La información que se gestiona en esta sección refleja los precios y contenido de los planes disponibles para los usuarios</li>
              <li>• Puedes actualizar los precios y descripciones de cada plan según sea necesario</li>
              <li>• Asegúrate de que los cambios sean claros y concisos para evitar confusiones</li>
              <li>• Los cambios se guardan automáticamente solo para los planes que hayan sido modificados</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanesAlimenticiosPage;