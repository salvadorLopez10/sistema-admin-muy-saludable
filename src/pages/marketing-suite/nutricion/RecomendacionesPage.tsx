// src/pages/marketing-suite/nutricion/RecomendacionesPage.tsx
import React, { useState } from 'react';
import { MdAdd, MdSave, MdRestaurant } from 'react-icons/md';
import { RecomendacionSection, RecomendacionData } from '../../../components/RecomendacionSection';
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

interface RecomendacionPayload {
  objetivo: string;
  titulo: string;
  descripcion: string;
  image_url: string;
  orden: number;
  visible: number;
}

const RecomendacionesPage: React.FC = () => {
  // Función para generar ID único compatible
  const generateId = () => {
    return 'rec_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const [recomendaciones, setRecomendaciones] = useState<RecomendacionData[]>([
    {
      id: generateId(),
      titulo: '',
      descripcion: '',
      imagen: null
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Agregar nueva sección
  const agregarSeccion = () => {
    const nuevaSeccion: RecomendacionData = {
      id: generateId(),
      titulo: '',
      descripcion: '',
      imagen: null
    };
    setRecomendaciones(prev => [...prev, nuevaSeccion]);
  };

  // Actualizar datos de una sección
  const actualizarSeccion = (id: string, field: keyof RecomendacionData, value: string | File | null) => {
    setRecomendaciones(prev =>
      prev.map(seccion =>
        seccion.id === id ? { ...seccion, [field]: value } : seccion
      )
    );
  };

  // Eliminar sección
  const eliminarSeccion = (id: string) => {
    if (recomendaciones.length > 1) {
      setRecomendaciones(prev => prev.filter(seccion => seccion.id !== id));
    }
  };

  // Validar formulario
  const esFormularioValido = () => {
    return recomendaciones.every(seccion => 
      seccion.titulo.trim() !== '' && seccion.descripcion.trim() !== ''
    );
  };

  // Subir imágenes al servidor
  const subirImagenes = async (imagenesFiles: File[]): Promise<UploadedFile[]> => {
    if (imagenesFiles.length === 0) {
      return [];
    }

    try {
      // Crear FormData para enviar las imágenes
      const formData = new FormData();
      
      // Agregar todas las imágenes al FormData
      imagenesFiles.forEach((file) => {
        formData.append('files', file);
      });

      console.log('Subiendo', imagenesFiles.length, 'imágenes...');

      // Realizar petición con headers específicos para FormData
      const apiInstance = MuySaludableApi();
      const response = await apiInstance.post<UploadFilesResponse>('/uploadFiles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        console.log('Imágenes subidas exitosamente:', response.data.files);
        return response.data.files;
      } else {
        throw new Error(response.data.message || 'Error al subir las imágenes');
      }
    } catch (error) {
      console.error('Error subiendo imágenes:', error);
      throw new Error('Error al subir las imágenes al servidor');
    }
  };

  // Guardar recomendaciones en la base de datos
  const guardarRecomendacionesDB = async (recomendacionesPayload: RecomendacionPayload[]): Promise<unknown> => {
    try {
      console.log('Guardando recomendaciones en DB:', recomendacionesPayload);

      const apiInstance = MuySaludableApi();
      const response = await apiInstance.post('/recomendaciones/bulk', recomendacionesPayload);

      console.log('Recomendaciones guardadas exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error guardando recomendaciones:', error);
      throw new Error('Error al guardar las recomendaciones en la base de datos');
    }
  };

  // Función principal para guardar (ejecuta todo el proceso)
  const guardarRecomendaciones = async () => {
    if (!esFormularioValido()) {
      alert('Por favor completa todos los campos obligatorios (título y descripción)');
      return;
    }

    setIsLoading(true);
    
    try {
      // Paso 1: Filtrar recomendaciones con imagen
      const recomendacionesConImagen = recomendaciones.filter(r => r.imagen !== null);
      
      // Paso 2: Subir imágenes si existen
      let imagenesSubidas: UploadedFile[] = [];
      if (recomendacionesConImagen.length > 0) {
        const imagenesFiles = recomendacionesConImagen.map(r => r.imagen!);
        imagenesSubidas = await subirImagenes(imagenesFiles);
        
        if (imagenesSubidas.length !== recomendacionesConImagen.length) {
          throw new Error('No se pudieron subir todas las imágenes');
        }
      }

      // Paso 3: Preparar payload para la base de datos
      const recomendacionesPayload: RecomendacionPayload[] = [];
      let indiceImagen = 0;

      recomendaciones.forEach((seccion, index) => {
        const payload: RecomendacionPayload = {
          objetivo: "Nutrición", // Puedes hacer esto dinámico si necesitas
          titulo: seccion.titulo.trim(),
          descripcion: seccion.descripcion.trim(),
          image_url: "", // Se asignará abajo
          orden: index + 1,
          visible: 1
        };

        // Asignar URL de imagen si existe
        if (seccion.imagen) {
          payload.image_url = imagenesSubidas[indiceImagen].publicUrl;
          indiceImagen++;
        } else {
          payload.image_url = ""; // Sin imagen
        }

        recomendacionesPayload.push(payload);
      });

      // Paso 4: Guardar en la base de datos
      await guardarRecomendacionesDB(recomendacionesPayload);

      // Paso 5: Mostrar éxito y limpiar formulario
      alert(`¡Éxito! Se guardaron ${recomendaciones.length} recomendación(es) correctamente.`);
      
      // Opcional: Resetear formulario
      setRecomendaciones([{
        id: generateId(),
        titulo: '',
        descripcion: '',
        imagen: null
      }]);

    } catch (error) {
      console.error('Error en el proceso de guardado:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudieron guardar las recomendaciones';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <MdRestaurant className="text-orange-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Recomendaciones Nutricionales
              </h1>
              <p className="text-gray-600 mt-1">
                Crea y gestiona recomendaciones para tus usuarios
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500">
            <span>Marketing Suite</span> / <span>Nutrición</span> / <span className="text-orange-600 font-medium">Recomendaciones</span>
          </nav>
        </div>

        {/* Formulario */}
        <form onSubmit={(e) => { e.preventDefault(); guardarRecomendaciones(); }}>
          <div className="space-y-6">
            {/* Secciones de recomendaciones */}
            {recomendaciones.map((seccion, index) => (
              <RecomendacionSection
                key={seccion.id}
                data={seccion}
                index={index}
                onChange={actualizarSeccion}
                onRemove={eliminarSeccion}
                showRemoveButton={recomendaciones.length > 1}
              />
            ))}

            {/* Botón Añadir más */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={agregarSeccion}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-orange-ms text-orange-ms rounded-lg hover:border-orange-ms hover:bg-orange-50 transition-colors"
              >
                <MdAdd size={20} />
                Añadir más
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres descartar los cambios?')) {
                  // Reset form
                  setRecomendaciones([{
                    id: generateId(),
                    titulo: '',
                    descripcion: '',
                    imagen: null
                  }]);
                }
              }}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading || !esFormularioValido()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-ms text-white rounded-lg hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdSave size={20} />
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>

        {/* Info adicional */}
        <div className="mt-8 bg-green-50 border border-green-ms rounded-lg p-4">
          <h3 className="font-medium text-green-ms mb-2">💡 Consejos:</h3>
          <ul className="text-sm text-green-ms space-y-1">
            <li>• Los campos de título y descripción son obligatorios</li>
            <li>• Las imágenes son opcionales pero recomendadas para mejor engagement</li>
            <li>• Puedes agregar tantas recomendaciones como necesites</li>
            <li>• Formatos de imagen soportados: JPG, PNG, GIF, WebP</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecomendacionesPage;