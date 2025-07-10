// src/pages/marketing-suite/SaludFinancieraPage.tsx
import React, { useState } from 'react';
import { MdAdd, MdSave, MdAccountBalance, MdCancel } from 'react-icons/md';
import { SaludFinancieraSection, SaludFinancieraData } from '../../components/SaludFinancieraSection';
import { DateRangePicker } from '../../components/DateRangePicker';
import { MuySaludableApi } from '../../api/MuySaludableApi';

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

interface SaludFinancieraPayload {
  nombre: string;
  contenido: string;
  vigente_fecha_inicio: string;
  vigente_fecha_fin: string;
}

const SaludFinancieraPage: React.FC = () => {
  // Función para generar ID único compatible
  const generateId = () => {
    return 'sf_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  // Estados del formulario
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [contenidos, setContenidos] = useState<SaludFinancieraData[]>([
    {
      id: generateId(),
      titulo: '',
      contenido: '',
      imagen: null
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Agregar nueva sección
  const agregarSeccion = () => {
    const nuevaSeccion: SaludFinancieraData = {
      id: generateId(),
      titulo: '',
      contenido: '',
      imagen: null
    };
    setContenidos(prev => [...prev, nuevaSeccion]);
  };

  // Actualizar datos de una sección
  const actualizarSeccion = (id: string, field: keyof SaludFinancieraData, value: string | File | null) => {
    setContenidos(prev =>
      prev.map(seccion =>
        seccion.id === id ? { ...seccion, [field]: value } : seccion
      )
    );
  };

  // Eliminar sección
  const eliminarSeccion = (id: string) => {
    if (contenidos.length > 1) {
      setContenidos(prev => prev.filter(seccion => seccion.id !== id));
    }
  };

  // Validar formulario
  const esFormularioValido = () => {
    return (
      startDate !== '' &&
      endDate !== '' &&
      startDate <= endDate &&
      contenidos.every(seccion => 
        seccion.titulo.trim() !== '' && seccion.contenido.trim() !== ''
      )
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

      console.log('Subiendo', imagenesFiles.length, 'imágenes de salud financiera...');

      const apiInstance = MuySaludableApi();
      const response = await apiInstance.post<UploadFilesResponse>('/uploadFiles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        console.log('Imágenes de salud financiera subidas exitosamente:', response.data.files);
        return response.data.files;
      } else {
        throw new Error(response.data.message || 'Error al subir las imágenes');
      }
    } catch (error) {
      console.error('Error subiendo imágenes de salud financiera:', error);
      throw new Error('Error al subir las imágenes al servidor');
    }
  };

  // Construir contenido con formato específico
  const construirContenido = (contenidos: SaludFinancieraData[], imagenesSubidas: UploadedFile[]): string => {
    let contenidoCompleto = '';
    let indiceImagen = 0;

    contenidos.forEach((seccion) => {
      // Agregar título con tags
      contenidoCompleto += `<title>${seccion.titulo.trim()}</title>\n`;
      
      // Agregar contenido con tag
      contenidoCompleto += `<content>${seccion.contenido.trim()}`;
      
      // Agregar imagen si existe
      if (seccion.imagen && indiceImagen < imagenesSubidas.length) {
        contenidoCompleto += `<image>${imagenesSubidas[indiceImagen].publicUrl}</image>`;
        indiceImagen++;
      }
      
      contenidoCompleto += '\n';
    });

    return contenidoCompleto.trim();
  };

  // Guardar en la base de datos
  const guardarSaludFinancieraDB = async (payload: SaludFinancieraPayload): Promise<unknown> => {
    try {
      console.log('Guardando salud financiera en DB:', payload);

      const apiInstance = MuySaludableApi();
      const response = await apiInstance.post('/salud', payload);

      console.log('Salud financiera guardada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error guardando salud financiera:', error);
      throw new Error('Error al guardar la información de salud financiera en la base de datos');
    }
  };

  // Función principal para guardar
  const guardarSaludFinanciera = async () => {
    if (!esFormularioValido()) {
      alert('Por favor completa todos los campos obligatorios y verifica las fechas');
      return;
    }

    setIsLoading(true);

    try {
      // Paso 1: Separar contenidos con y sin imagen
      const contenidosConImagen = contenidos.filter(c => c.imagen !== null);
      
      // Paso 2: Subir imágenes si existen
      let imagenesSubidas: UploadedFile[] = [];
      if (contenidosConImagen.length > 0) {
        const imagenesFiles = contenidosConImagen.map(c => c.imagen!);
        imagenesSubidas = await subirImagenes(imagenesFiles);
        
        if (imagenesSubidas.length !== contenidosConImagen.length) {
          throw new Error('No se pudieron subir todas las imágenes');
        }
      }

      // Paso 3: Construir el contenido con formato específico
      const contenidoFormateado = construirContenido(contenidos, imagenesSubidas);

      // Paso 4: Preparar payload
      const payload: SaludFinancieraPayload = {
        nombre: "Financiera",
        contenido: contenidoFormateado,
        vigente_fecha_inicio: startDate,
        vigente_fecha_fin: endDate
      };

      // Paso 5: Guardar en la base de datos
      await guardarSaludFinancieraDB(payload);

      // Paso 6: Mostrar éxito y limpiar formulario
      alert(`¡Éxito! Se guardó la información de salud financiera con ${contenidos.length} contenido(s) correctamente.`);
      
      // Resetear formulario
      setStartDate('');
      setEndDate('');
      setContenidos([{
        id: generateId(),
        titulo: '',
        contenido: '',
        imagen: null
      }]);

    } catch (error) {
      console.error('Error en el proceso de guardado de salud financiera:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar la información de salud financiera';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    if (confirm('¿Estás seguro de que quieres descartar todos los cambios?')) {
      setStartDate('');
      setEndDate('');
      setContenidos([{
        id: generateId(),
        titulo: '',
        contenido: '',
        imagen: null
      }]);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-ms p-3 rounded-lg">
              <MdAccountBalance className="text-orange-ms text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Salud Financiera
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona contenido educativo sobre finanzas personales
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500">
            <span>Marketing Suite</span> / <span className="text-orange-ms font-medium">Salud Financiera</span>
          </nav>
        </div>

        {/* Formulario */}
        <form onSubmit={(e) => { e.preventDefault(); guardarSaludFinanciera(); }}>
          <div className="space-y-8">
            
            {/* Sección de Fechas */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              disabled={isLoading}
            />

            {/* Secciones de contenido */}
            <div className="space-y-6">
              {contenidos.map((seccion, index) => (
                <SaludFinancieraSection
                  key={seccion.id}
                  data={seccion}
                  index={index}
                  onChange={actualizarSeccion}
                  onRemove={eliminarSeccion}
                  showRemoveButton={contenidos.length > 1}
                />
              ))}

              {/* Botón Añadir más */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={agregarSeccion}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-orange-ms text-orange-ms rounded-lg hover:border-orange-ms hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  <MdAdd size={20} />
                  Añadir más
                </button>
              </div>
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
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>

        {/* Vista previa del contenido formateado */}
        {contenidos.some(c => c.titulo.trim() !== '' || c.contenido.trim() !== '') && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-3">👁️ Vista previa del contenido:</h3>
            <div className="bg-white p-4 rounded border text-xs font-mono text-gray-700 max-h-40 overflow-y-auto">
              {contenidos.map((seccion) => (
                seccion.titulo.trim() !== '' && (
                  <div key={seccion.id} className="mb-2">
                    <span className="text-blue-600">&lt;title&gt;</span>
                    {seccion.titulo.trim()}
                    <span className="text-blue-600">&lt;/title&gt;</span>
                    <br />
                    <span className="text-green-600">&lt;content&gt;</span>
                    {seccion.contenido.trim()}
                    {seccion.imagen && (
                      <>
                        <span className="text-purple-600">&lt;image&gt;</span>
                        <span className="text-gray-500">[URL de imagen será insertada aquí]</span>
                        <span className="text-purple-600">&lt;/image&gt;</span>
                      </>
                    )}
                    <br />
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Info adicional */}
        <div className="mt-8 bg-green-50 border border-green-ms rounded-lg p-4">
          <h3 className="font-medium text-green-ms mb-2">💡 Información importante:</h3>
          <ul className="text-sm text-green-ms space-y-1">
            <li>• Todos los contenidos se combinan en un solo registro con formato especial</li>
            <li>• Los títulos se envuelven en tags &lt;title&gt;&lt;/title&gt;</li>
            <li>• El contenido comienza con &lt;content&gt; y las imágenes van en &lt;image&gt;&lt;/image&gt;</li>
            <li>• Las fechas determinan cuándo estará disponible el contenido</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SaludFinancieraPage;