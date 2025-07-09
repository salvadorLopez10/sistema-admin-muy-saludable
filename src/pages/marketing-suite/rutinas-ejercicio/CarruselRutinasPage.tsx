// src/pages/marketing-suite/rutinas-ejercicio/CarruselRutinasPage.tsx
import React, { useState } from 'react';
import { MdSave, MdViewCarousel, MdCancel } from 'react-icons/md';
import { MultiImageDropzone } from '../../../components/MultiImageDropzone';
import { DateRangePicker } from '../../../components/DateRangePicker';
import { MuySaludableApi } from '../../../api/MuySaludableApi';

// Interfaces para las respuestas de la API
interface UploadedFile {
  originalName: string;
  fileName: string;
  publicUrl: string;
  size: number;
  type: string;
}

interface UploadFilesResponse {
  success: boolean;
  message: string;
  files: UploadedFile[];
  totalFiles: number;
}

interface CarruselRutinasPayload {
  titulo: string;
  image_url: string;
  tipo: string;
  activo: string;
  vigente_fecha_inicio: string;
  vigente_fecha_fin: string;
}

const CarruselRutinasPage: React.FC = () => {
  // Estados del formulario
  const [titulo, setTitulo] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Validar formulario
  const esFormularioValido = (): boolean => {
    return (
      titulo.trim() !== '' &&
      startDate !== '' &&
      endDate !== '' &&
      selectedImages.length > 0 &&
      startDate <= endDate
    );
  };

  // Subir imágenes al servidor
  const subirImagenes = async (imagenesFiles: File[]): Promise<UploadedFile[]> => {
    if (imagenesFiles.length === 0) {
      return [];
    }

    try {
      const formData = new FormData();
      imagenesFiles.forEach((file) => {
        formData.append('files', file);
      });

      console.log('Subiendo', imagenesFiles.length, 'imágenes del carrusel de rutinas...');

      const apiInstance = MuySaludableApi();
      const response = await apiInstance.post<UploadFilesResponse>('/uploadFiles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        console.log('Imágenes del carrusel de rutinas subidas exitosamente:', response.data.files);
        return response.data.files;
      } else {
        throw new Error(response.data.message || 'Error al subir las imágenes');
      }
    } catch (error) {
      console.error('Error subiendo imágenes del carrusel de rutinas:', error);
      throw new Error('Error al subir las imágenes al servidor');
    }
  };

  // Guardar carrusel de rutinas en la base de datos
  const guardarCarruselDB = async (carruselPayloads: CarruselRutinasPayload[]): Promise<unknown> => {
    try {
      console.log('Guardando carrusel de rutinas en DB:', carruselPayloads);

      const apiInstance = MuySaludableApi();
      
      // Enviar todas las imágenes en una sola petición al endpoint bulk
      const response = await apiInstance.post('/carousel/createBulk', carruselPayloads);
      
      console.log('Carrusel de rutinas guardado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error guardando carrusel de rutinas:', error);
      throw new Error('Error al guardar el carrusel de rutinas en la base de datos');
    }
  };

  // Función principal para guardar
  const guardarCarrusel = async () => {
    if (!esFormularioValido()) {
      alert('Por favor completa todos los campos obligatorios y selecciona al menos una imagen');
      return;
    }

    setIsLoading(true);

    try {
      // Paso 1: Subir todas las imágenes
      console.log(`Iniciando proceso de guardado del carrusel de rutinas con ${selectedImages.length} imagen(es)`);
      const imagenesSubidas = await subirImagenes(selectedImages);

      if (imagenesSubidas.length !== selectedImages.length) {
        throw new Error('No se pudieron subir todas las imágenes');
      }

      // Paso 2: Crear payload para cada imagen
      const carruselPayloads: CarruselRutinasPayload[] = imagenesSubidas.map((imagen) => ({
        titulo: titulo.trim(),
        image_url: imagen.publicUrl,
        tipo: "Rutinas",
        activo: "1",
        vigente_fecha_inicio: startDate,
        vigente_fecha_fin: endDate
      }));

      // Paso 3: Guardar en la base de datos
      await guardarCarruselDB(carruselPayloads);

      // Paso 4: Mostrar éxito y limpiar formulario
      alert(`¡Éxito! Se guardó el carrusel de rutinas "${titulo}" con ${selectedImages.length} imagen(es) correctamente.`);
      
      // Resetear formulario
      setTitulo('');
      setStartDate('');
      setEndDate('');
      setSelectedImages([]);

    } catch (error) {
      console.error('Error en el proceso de guardado del carrusel de rutinas:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar el carrusel de rutinas';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    if (confirm('¿Estás seguro de que quieres descartar todos los cambios?')) {
      setTitulo('');
      setStartDate('');
      setEndDate('');
      setSelectedImages([]);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-ms p-3 rounded-lg">
              <MdViewCarousel className="text-orange-ms text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Carrusel de Rutinas de Ejercicio
              </h1>
              <p className="text-gray-600 mt-1">
                Configura el carrusel de imágenes de rutinas con fechas de vigencia
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500">
            <span>Marketing Suite</span> / <span>Rutinas de Ejercicio</span> / <span className="text-orange-ms font-medium">Carrusel</span>
          </nav>
        </div>

        {/* Formulario */}
        <form onSubmit={(e) => { e.preventDefault(); guardarCarrusel(); }}>
          <div className="space-y-8">
            
            {/* Sección de Título */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Carrusel de Rutinas
              </h2>
              <div className="space-y-2">
                <label 
                  htmlFor="titulo-carrusel-rutinas"
                  className="block text-sm font-medium text-gray-700"
                >
                  Título del Carrusel *
                </label>
                <input
                  id="titulo-carrusel-rutinas"
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Carrusel de Rutinas de Ejercicio Enero 2025"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">
                  Este título te ayudará a identificar el carrusel de rutinas en el panel de administración
                </p>
              </div>
            </div>

            {/* Sección de Fechas */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              disabled={isLoading}
            />

            {/* Sección de Imágenes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Imágenes del Carrusel de Rutinas
              </h2>
              <MultiImageDropzone
                onImagesChange={setSelectedImages}
                maxFiles={10}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={limpiarFormulario}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdCancel size={20} />
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading || !esFormularioValido()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-ms text-white rounded-lg hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdSave size={20} />
              {isLoading ? 'Guardando...' : 'Guardar Carrusel'}
            </button>
          </div>
        </form>

        {/* Resumen del carrusel */}
        {titulo && selectedImages.length > 0 && startDate && endDate && (
          <div className="mt-8 bg-yellow-ms border border-orange-ms rounded-lg p-6">
            <h3 className="font-medium text-brown-ms mb-3">📋 Resumen del Carrusel de Rutinas:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-brown-ms">
              <div>
                <span className="font-medium">Título:</span> {titulo}
              </div>
              <div>
                <span className="font-medium">Imágenes:</span> {selectedImages.length} imagen(es)
              </div>
              <div>
                <span className="font-medium">Fecha inicio:</span> {new Date(startDate).toLocaleDateString('es-ES')}
              </div>
              <div>
                <span className="font-medium">Fecha fin:</span> {new Date(endDate).toLocaleDateString('es-ES')}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">Tipo:</span> <span className="bg-green-100 text-green-ms px-2 py-1 rounded text-xs">Rutinas</span>
              </div>
            </div>
          </div>
        )}

        {/* Info adicional */}
        <div className="mt-8 bg-green-50 border border-green-ms rounded-lg p-4">
          <h3 className="font-medium text-green-ms mb-2">💡 Información importante:</h3>
          <ul className="text-sm text-green-ms space-y-1">
            <li>• El carrusel solo será visible entre las fechas especificadas</li>
            <li>• Puedes subir hasta 10 imágenes por carrusel</li>
            <li>• Formatos soportados: JPG, PNG, GIF, WebP, BMP</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CarruselRutinasPage;