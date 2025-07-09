// src/components/MultiImageDropzone.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MdCloudUpload, MdDelete, MdAdd } from 'react-icons/md';

interface MultiImageDropzoneProps {
  onImagesChange: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
}

interface ImagePreview {
  file: File;
  preview: string;
  id: string;
}

export const MultiImageDropzone: React.FC<MultiImageDropzoneProps> = ({
  onImagesChange,
  className = "",
  disabled = false,
  maxFiles = 10
}) => {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Generar ID único
  const generateId = () => {
    return 'img_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Archivos aceptados:', acceptedFiles);
    
    if (acceptedFiles.length === 0) return;

    // Verificar límite de archivos
    const totalFiles = images.length + acceptedFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Solo puedes subir un máximo de ${maxFiles} imágenes. Actualmente tienes ${images.length} imagen(es).`);
      return;
    }

    setIsLoading(true);

    const newImages: ImagePreview[] = [];
    let processedCount = 0;

    acceptedFiles.forEach((file) => {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        console.warn('Archivo no válido:', file.name);
        processedCount++;
        return;
      }

      // Crear preview usando FileReader
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const imagePreview: ImagePreview = {
            file,
            preview: result,
            id: generateId()
          };
          
          newImages.push(imagePreview);
          processedCount++;

          // Cuando todos los archivos han sido procesados
          if (processedCount === acceptedFiles.length) {
            setImages(prev => {
              const updated = [...prev, ...newImages];
              // Notificar al componente padre
              onImagesChange(updated.map(img => img.file));
              return updated;
            });
            setIsLoading(false);
          }
        }
      };

      reader.onerror = () => {
        console.error('Error al procesar imagen:', file.name);
        processedCount++;
        if (processedCount === acceptedFiles.length) {
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(file);
    });

  }, [images.length, maxFiles, onImagesChange]);

  // Eliminar imagen específica
  const removeImage = (imageId: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      onImagesChange(updated.map(img => img.file));
      return updated;
    });
  };

  // Limpiar todas las imágenes
  const clearAllImages = () => {
    setImages([]);
    onImagesChange([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp']
    },
    multiple: true,
    disabled: disabled || isLoading,
    onDropRejected: (fileRejections) => {
      console.log('Archivos rechazados:', fileRejections);
      alert('Algunos archivos no son válidos. Por favor selecciona solo imágenes.');
    }
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zona de drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 min-h-[150px] flex flex-col items-center justify-center
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
            <p className="text-gray-500">Procesando imágenes...</p>
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
                Suelta las imágenes aquí...
              </p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">
                  Arrastra y suelta múltiples imágenes aquí
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  o haz click para seleccionar
                </p>
                <div className="bg-orange-ms text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-orange-400 transition-colors">
                  <MdAdd size={20} />
                  Seleccionar imágenes
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-4">
              Máximo {maxFiles} imágenes • Formatos: JPG, PNG, GIF, WebP, BMP
            </p>
          </>
        )}
      </div>

      {/* Vista previa de imágenes */}
      {images.length > 0 && (
        <div className="space-y-3">
          {/* Header con contadory botón limpiar */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Imágenes seleccionadas ({images.length}/{maxFiles})
            </h3>
            <button
              type="button"
              onClick={clearAllImages}
              className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              Limpiar todas
            </button>
          </div>

          {/* Contenedor scrollable horizontal */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative flex-shrink-0 group"
                >
                  {/* Imagen preview */}
                  <div className="w-24 h-24 bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Botón eliminar */}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-0 -right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                    aria-label={`Eliminar ${image.file.name}`}
                  >
                    <MdDelete size={12} />
                  </button>
                  
                  {/* Nombre del archivo */}
                  <p className="text-xs text-gray-600 mt-1 w-24 truncate text-center">
                    {image.file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Info adicional */}
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            💡 Puedes arrastrar más imágenes para agregarlas o usar el botón "Limpiar todas" para empezar de nuevo.
          </div>
        </div>
      )}
    </div>
  );
};