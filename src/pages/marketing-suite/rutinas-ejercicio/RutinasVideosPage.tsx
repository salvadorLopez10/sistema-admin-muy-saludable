// src/pages/marketing-suite/rutinas-ejercicio/RutinasVideosPage.tsx
import React, { useState } from 'react';
import { MdSave, MdPlayCircle, MdCancel } from 'react-icons/md';
import { VideoDropzone } from '../../../components/VideoDropzone';
import { MuySaludableApi } from '../../../api/MuySaludableApi';
import { 
  titulosRutinas, 
  nivelesRutinas, 
  diasRutinas,
  TituloRutina,
  NivelRutina,
  DiaRutina
} from '../../../config/rutinasConfig';

// Interfaces para las respuestas de la API
interface DataVideoGCloudResponse {
    originalName: string;
    fileName: string;
    publicUrl: string;
    size: number;
    sizeFormatted: string;
}
interface UploadVideoResponse {
  success: boolean;
  message: string;
  data: DataVideoGCloudResponse;
}

interface RutinaVideoPayload {
  titulo: string;
  dias: string;
  descripcion: string;
  video_url: string;
  image_url: null;
  nivel: string;
  activo: number;
}

const RutinasVideosPage: React.FC = () => {
  // Estados del formulario
  const [titulo, setTitulo] = useState<string>('');
  const [nivel, setNivel] = useState<string>('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [descripcion, setDescripcion] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");


  // Manejar selección múltiple de días
  const handleDayChange = (dia: string, isChecked: boolean) => {
    if (isChecked) {
      setDiasSeleccionados(prev => [...prev, dia]);
    } else {
      setDiasSeleccionados(prev => prev.filter(d => d !== dia));
    }
  };

  // Validar formulario
  const esFormularioValido = (): boolean => {
    return (
      titulo.trim() !== '' &&
      nivel.trim() !== '' &&
      diasSeleccionados.length > 0 &&
      descripcion.trim() !== '' &&
      selectedVideo !== null
    );
  };

  // Subir video a Google Clud
  const subirVideogGoogleCloud = async (videoFile: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      console.log('Subiendo video a Google Drive:', videoFile.name);

      const apiInstance = MuySaludableApi();
      
      const response = await apiInstance.post<UploadVideoResponse>('/uploadVideo/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        console.log('Video subido exitosamente a Google Cloude:', response.data.data.publicUrl);
        return response.data.data.publicUrl;
      } else {
        throw new Error(response.data.message || 'Error al subir el video');
      }
    } catch (error) {
      console.error('Error subiendo video a Google Drive:', error);
      throw new Error('Error al subir el video al servidor');
    }
  };

  // Guardar rutina en la base de datos
  const guardarRutinaDB = async (payload: RutinaVideoPayload): Promise<unknown> => {
    try {
      console.log('Guardando rutina de video en DB:', payload);

      const apiInstance = MuySaludableApi();
      const response = await apiInstance.post('/rutinas/reemplazaActivosPorTitulo', payload);

      console.log('Rutina de video guardada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error guardando rutina de video:', error);
      throw new Error('Error al guardar la rutina en la base de datos');
    }
  };

  // Limpiar todos los campos del formulario
  const limpiarTodosLosCampos = () => {
    setTitulo('');
    setNivel('');
    setDiasSeleccionados([]);
    setDescripcion('');
    setSelectedVideo(null);
  };

  // Función principal para guardar
  const guardarRutina = async () => {
    if (!esFormularioValido()) {
      alert('Por favor completa todos los campos obligatorios y selecciona un video');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Preparando subida de video...');

    try {
      // Paso 1: Subir video a Google Drive
      console.log('Iniciando proceso de guardado de rutina de video...');
      const videoUrl = await subirVideogGoogleCloud(selectedVideo!);

      setLoadingMessage('Preparando datos de la rutina...');

      // Paso 2: Preparar payload
      const payload: RutinaVideoPayload = {
        titulo: titulo.trim(),
        dias: diasSeleccionados.join(','),
        descripcion: descripcion.trim(),
        video_url: videoUrl,
        image_url: null,
        nivel: nivel,
        activo: 1
      };

      // Paso 3: Guardar en la base de datos
      await guardarRutinaDB(payload);

      // Paso 4: Mostrar éxito y limpiar formulario
      //alert(`¡Éxito! Se guardó la rutina de video "${titulo}" correctamente.`);
      setLoadingMessage('¡Rutina guardada exitosamente!');
      
      // Pequeña pausa para mostrar el mensaje de éxito
      setTimeout(() => {
        alert(`¡Éxito! Se guardó la rutina de video "${titulo}" correctamente.`);
        
        // Limpiar TODOS los campos incluyendo el video
        limpiarTodosLosCampos();
        
        setIsLoading(false);
        setLoadingMessage('');
      }, 1000);

    } catch (error) {
      console.error('Error en el proceso de guardado de rutina de video:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar la rutina de video';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    if (confirm('¿Estás seguro de que quieres descartar todos los cambios?')) {
      limpiarTodosLosCampos();
    }
  };

  return (

    <>

        {/* Overlay de carga que bloquea toda la pantalla */}
        {isLoading && (
            <>
                {/* Fondo con opacidad */}
                <div className="fixed inset-0 bg-black opacity-25 z-50"></div>
                
                {/* Modal sin opacidad */}
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
            <div className="max-w-4xl mx-auto py-8 px-6">
                {/* Header */}
                <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-yellow-ms p-3 rounded-lg">
                    <MdPlayCircle className="text-orange-ms text-2xl" />
                    </div>
                    <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Videos de Rutinas de Ejercicio
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Sube y gestiona videos de rutinas para tus usuarios
                    </p>
                    </div>
                </div>
                
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500">
                    <span>Marketing Suite</span> / <span>Rutinas de Ejercicio</span> / <span className="text-orange-ms font-medium">Videos</span>
                </nav>
                </div>

                {/* Formulario */}
                <form onSubmit={(e) => { e.preventDefault(); guardarRutina(); }}>
                <div className="space-y-8">
                    
                    {/* Sección de Campos Desplegables */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Configuración de la Rutina
                    </h2>
                    
                    {/* Título (centrado) */}
                    <div className="mb-6">
                        <label 
                        htmlFor="titulo-rutina"
                        className="block text-sm font-medium text-gray-700 text-center mb-2"
                        >
                        Título *
                        </label>
                        <div className="flex justify-center">
                        <select
                            id="titulo-rutina"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-ms focus:border-orange-400 transition-colors"
                            required
                            disabled={isLoading}
                        >
                            <option value="">Selecciona un título</option>
                            {titulosRutinas.map((tituloOpt: TituloRutina) => (
                            <option key={tituloOpt.value} value={tituloOpt.value}>
                                {tituloOpt.label}
                            </option>
                            ))}
                        </select>
                        </div>
                    </div>

                    {/* Nivel y Días (misma fila) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nivel */}
                        <div>
                        <label 
                            htmlFor="nivel-rutina"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Nivel *
                        </label>
                        <select
                            id="nivel-rutina"
                            value={nivel}
                            onChange={(e) => setNivel(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-ms focus:border-orange-400 transition-colors"
                            required
                            disabled={isLoading}
                        >
                            <option value="">Selecciona un nivel</option>
                            {nivelesRutinas.map((nivelOpt: NivelRutina) => (
                            <option key={nivelOpt.value} value={nivelOpt.value}>
                                {nivelOpt.label}
                            </option>
                            ))}
                        </select>
                        </div>

                        {/* Días (multiselección) */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Días de la Semana *
                        </label>
                        <div className="border border-gray-300 rounded-lg p-3 bg-white max-h-32 overflow-y-auto">
                            {diasRutinas.map((diaOpt: DiaRutina) => (
                            <label key={diaOpt.value} className="flex items-center space-x-2 mb-1 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input
                                type="checkbox"
                                checked={diasSeleccionados.includes(diaOpt.value)}
                                onChange={(e) => handleDayChange(diaOpt.value, e.target.checked)}
                                className="rounded border-gray-300 text-orange-ms focus:ring-orange-ms"
                                disabled={isLoading}
                                />
                                <span className="text-sm text-gray-700">{diaOpt.label}</span>
                            </label>
                            ))}
                        </div>
                        {diasSeleccionados.length > 0 && (
                            <p className="text-xs text-orange-ms mt-1">
                            Seleccionados: {diasSeleccionados.join(', ')}
                            </p>
                        )}
                        </div>
                    </div>
                    </div>

                    {/* Sección de Descripción */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Descripción de la Rutina
                    </h2>
                    <div className="space-y-2">
                        <label 
                        htmlFor="descripcion-rutina"
                        className="block text-sm font-medium text-gray-700"
                        >
                        Descripción *
                        </label>
                        <textarea
                            id="descripcion-rutina"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Describe los ejercicios, repeticiones, series y cualquier información relevante para la rutina..."
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-ms focus:border-orange-400 transition-colors resize-vertical"
                            required
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">
                            Incluye detalles sobre los ejercicios, repeticiones, tiempo de descanso, etc.
                        </p>
                    </div>
                    </div>

                    {/* Sección de Video */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Video de la Rutina
                        </h2>
                        <VideoDropzone
                            onVideoChange={setSelectedVideo}
                            selectedVideo={selectedVideo}
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
                        {isLoading ? 'Guardando...' : 'Guardar Rutina'}
                    </button>
                </div>
                </form>

                {/* Resumen de la rutina */}
                {titulo && nivel && diasSeleccionados.length > 0 && descripcion && selectedVideo && (
                <div className="mt-8 bg-yellow-ms border border-orange-ms rounded-lg p-6">
                    <h3 className="font-medium text-brown-ms mb-3">📋 Resumen de la Rutina:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-brown-ms">
                    <div>
                        <span className="font-medium">Título:</span> {titulo}
                    </div>
                    <div>
                        <span className="font-medium">Nivel:</span> {nivel}
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-medium">Días:</span> {diasSeleccionados.join(', ')}
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-medium">Video:</span> {selectedVideo.name} ({(selectedVideo.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                    </div>
                </div>
                )}

                {/* Info adicional */}
                <div className="mt-8 bg-green-50 border border-green-ms rounded-lg p-4">
                <h3 className="font-medium text-green-ms mb-2">💡 Información importante:</h3>
                <ul className="font-medium text-green-ms mb-2">
                    <li>• Puedes seleccionar múltiples días de la semana</li>
                    
                    <li>• Formatos soportados: MP4</li>
                </ul>
                </div>
            </div>
        </div>
    </>
  );
};

export default RutinasVideosPage;