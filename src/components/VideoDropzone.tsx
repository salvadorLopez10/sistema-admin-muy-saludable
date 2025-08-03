// src/components/VideoDropzone.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MdCloudUpload, MdDelete, MdVideoLibrary, MdPlayCircle } from 'react-icons/md';

interface VideoDropzoneProps {
  onVideoChange: (file: File | null) => void;
  selectedVideo?: File | null;
  className?: string;
  disabled?: boolean;
}

export const VideoDropzone: React.FC<VideoDropzoneProps> = ({
  onVideoChange,
  selectedVideo = null,
  className = "",
  disabled = false
}) => {
  //const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Videos aceptados:', acceptedFiles);
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log('Video seleccionado:', file);
      
      // Validar que sea un video
      if (!file.type.startsWith('video/')) {
        alert('Por favor selecciona solo archivos de video');
        return;
      }

      // Validar tamaño (máximo 100MB)
      /*
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        alert('El video es demasiado grande. Máximo permitido: 100MB');
        return;
      }
        */

      setIsLoading(true);
      //setSelectedVideo(file);
      onVideoChange(file);
      
      // Simular tiempo de procesamiento
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [onVideoChange]);

  const removeVideo = () => {
    console.log('Removiendo video');
    //setSelectedVideo(null);
    onVideoChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    },
    multiple: false,
    disabled,
    onDropRejected: (fileRejections) => {
      console.log('Videos rechazados:', fileRejections);
      alert('Archivo no válido. Por favor selecciona solo videos.');
    },
    onError: (err) => {
      console.error('Error en dropzone de video:', err);
    }
  });

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`relative ${className}`}>
      {selectedVideo ? (
        // Vista previa del video
        <div className="relative group">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <div className="flex items-center space-x-4">
              {/* Icono de video */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-yellow-ms rounded-lg flex items-center justify-center">
                  <MdVideoLibrary className="text-orange-ms text-2xl" />
                </div>
              </div>
              
              {/* Información del video */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-brown-ms truncate">
                  {selectedVideo.name}
                </h4>
                <p className="text-sm text-brown-ms">
                  Tamaño: {formatFileSize(selectedVideo.size)}
                </p>
                <p className="text-sm text-brown-ms">
                  Tipo: {selectedVideo.type}
                </p>
                <div className="mt-2 flex items-center text-green-ms">
                  <MdPlayCircle className="mr-1" size={16} />
                  <span className="text-xs">Video listo para subir</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botón para eliminar video */}
          <button
            type="button"
            onClick={removeVideo}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
            aria-label="Eliminar video"
          >
            <MdDelete size={16} />
          </button>
          
          {/* Overlay para cambiar video */}
          <div
            {...getRootProps()}
            className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-30 transition-all duration-200 rounded-lg cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <input {...getInputProps()} />
            <div className="text-white text-center">
              <MdVideoLibrary size={24} className="mx-auto mb-1" />
              <p className="text-sm">Cambiar video</p>
            </div>
          </div>
        </div>
      ) : (
        // Zona de drop sin video
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 min-h-[200px] flex flex-col items-center justify-center
            ${isDragActive 
              ? 'border-orange-ms bg-orange-50' 
              : 'border-gray-300 hover:border-orange-ms hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-ms mb-2"></div>
              <p className="text-gray-500">Procesando video...</p>
            </div>
          ) : (
            <>
              <MdCloudUpload 
                size={48} 
                className={`mx-auto mb-4 ${
                  isDragActive ? 'text-orange-ms' : 'text-gray-400'
                }`} 
              />
              
              {isDragActive ? (
                <p className="text-orange-ms font-medium">
                  Suelta el video aquí...
                </p>
              ) : (
                <div>
                  <p className="text-gray-600 font-medium mb-2">
                    Arrastra y suelta un video aquí
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    o haz click para seleccionar
                  </p>
                  <div className="bg-orange-ms text-white px-4 py-2 rounded-lg inline-block hover:bg-orange-400 transition-colors">
                    Seleccionar video
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-4">
                Formatos: MP4, AVI, MOV, WMV, FLV, WebM, MKV (máx. 100MB)
              </p>
            </>
          )}
        </div>
      )}
      
      {/* Info de debug (remover en producción) */}
      {selectedVideo && (
        <div className="mt-2 text-xs text-gray-500">
          Archivo: {selectedVideo.name} ({formatFileSize(selectedVideo.size)})
        </div>
      )}
    </div>
  );
};