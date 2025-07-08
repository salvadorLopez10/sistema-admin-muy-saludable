// src/components/ImageDropzone.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { MdCloudUpload, MdDelete, MdImage } from 'react-icons/md';


interface ImageDropzoneProps {
  onImageChange: (file: File | null) => void;
  initialImage?: string | null;
  className?: string;
  disabled?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageChange,
  initialImage = null,
  className = "",
  disabled = false
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(initialImage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Archivos aceptados:', acceptedFiles); // Debug
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log('Archivo seleccionado:', file); // Debug
      
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona solo archivos de imagen');
        return;
      }

      setIsLoading(true);
      setSelectedFile(file);

      // Método 1: FileReader (más compatible)
      const reader = new FileReader();
      
      reader.onload = (e) => {
        console.log('FileReader onload ejecutado'); // Debug
        const result = e.target?.result as string;
        if (result) {
          console.log('Resultado del FileReader:', result.substring(0, 50) + '...'); // Debug
          setPreviewImage(result);
          setIsLoading(false);
          onImageChange(file);
        }
      };

      reader.onerror = (e) => {
        console.error('Error en FileReader:', e); // Debug
        setIsLoading(false);
        alert('Error al procesar la imagen');
      };

      reader.readAsDataURL(file);
    }
  }, [onImageChange]);

  const removeImage = () => {
    console.log('Removiendo imagen'); // Debug
    setPreviewImage(null);
    setSelectedFile(null);
    onImageChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp']
    },
    multiple: false,
    disabled,
    onDropRejected: (fileRejections) => {
      console.log('Archivos rechazados:', fileRejections); // Debug
      alert('Archivo no válido. Por favor selecciona una imagen.');
    },
    onError: (err) => {
      console.error('Error en dropzone:', err); // Debug
    }
  });

  // Debug: Log cuando cambia previewImage
  useEffect(() => {
    console.log('Preview image actualizada:', previewImage ? 'Tiene imagen' : 'Sin imagen');
  }, [previewImage]);

  return (
    <div className={`relative ${className}`}>
      {previewImage ? (
        // Vista previa de la imagen
        <div className="relative group">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white dropzone-container">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                <p className="text-gray-500 text-sm">Cargando imagen...</p>
              </div>
            ) : (
              <img
                src={previewImage}
                //src={logoMuySaludableMR}
                alt="Vista previa"
                className="dropzone-image"
                onLoad={() => {
                  console.log('Imagen cargada exitosamente');
                  setIsLoading(false);
                }}
                onError={(e) => {
                  console.error('Error al cargar imagen:', e);
                  setPreviewImage(null);
                  setIsLoading(false);
                  alert('Error al mostrar la imagen');
                }}
              />
            )}
          </div>
          
          {/* Botón para eliminar imagen */}
          {!isLoading && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
              aria-label="Eliminar imagen"
            >
              <MdDelete size={16} />
            </button>
          )}
          
          {/* Overlay para cambiar imagen */}
          {!isLoading && (
            <div
              {...getRootProps()}
              className="absolute inset-0  group-hover:bg-opacity-30 transition-all duration-200 rounded-lg cursor-pointer flex items-center justify-center"
            >
              <input {...getInputProps()} />
              <div className="text-brown-ms opacity-0 group-hover:opacity-100 transition-opacity text-center">
                <MdImage size={24} className="mx-auto mb-1" />
                <p className="text-sm">Cambiar imagen</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Zona de drop sin imagen
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 min-h-[200px] flex flex-col items-center justify-center
            ${isDragActive 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
              <p className="text-gray-500">Procesando imagen...</p>
            </div>
          ) : (
            <>
              <MdCloudUpload 
                size={48} 
                className={`mx-auto mb-4 ${
                  isDragActive ? 'text-orange-500' : 'text-gray-400'
                }`} 
              />
              
              {isDragActive ? (
                <p className="text-orange-600 font-medium">
                  Suelta la imagen aquí...
                </p>
              ) : (
                <div>
                  <p className="text-gray-600 font-medium mb-2">
                    Arrastra y suelta una imagen aquí
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    o haz click para seleccionar
                  </p>
                  <div className="bg-orange-ms text-white px-4 py-2 rounded-lg inline-block hover:bg-orange-400 transition-colors">
                    Seleccionar imagen
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-4">
                Formatos: JPG, PNG, GIF, WebP, BMP (máx. 10MB)
              </p>
            </>
          )}
        </div>
      )}
      
      {/* Info de debug (remover en producción) */}
      {selectedFile && (
        <div className="mt-2 text-xs text-gray-500">
          Archivo: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}
    </div>
  );
};