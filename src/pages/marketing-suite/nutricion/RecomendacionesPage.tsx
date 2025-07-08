// src/pages/marketing-suite/nutricion/RecomendacionesPage.tsx
import React, { useState } from 'react';
import { MdAdd, MdSave, MdRestaurant } from 'react-icons/md';
import { RecomendacionSection, RecomendacionData } from '../../../components/RecomendacionSection';

const RecomendacionesPage: React.FC = () => {
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

    // Guardar recomendaciones
    const guardarRecomendaciones = async () => {
        if (!esFormularioValido()) {
        alert('Por favor completa todos los campos obligatorios (título y descripción)');
        return;
        }

        setIsLoading(true);
        
        try {
        // Preparar datos para envío
        const formData = new FormData();
        
        recomendaciones.forEach((seccion, index) => {
            formData.append(`recomendaciones[${index}][titulo]`, seccion.titulo);
            formData.append(`recomendaciones[${index}][descripcion]`, seccion.descripcion);
            
            if (seccion.imagen) {
            formData.append(`recomendaciones[${index}][imagen]`, seccion.imagen);
            }
        });

        // TODO: Reemplazar con tu endpoint real
        const response = await fetch('/api/marketing-suite/nutricion/recomendaciones', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert('Recomendaciones guardadas exitosamente');
            // Opcional: resetear formulario o redirigir
        } else {
            throw new Error('Error al guardar las recomendaciones');
        }
        } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar las recomendaciones. Por favor intenta nuevamente.');
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
                <div className="bg-yellow-ms p-3 rounded-lg">
                    <MdRestaurant className="text-orange-ms text-2xl" />
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
                <span>Marketing Suite</span> / <span>Nutrición</span> / <span className="text-orange-ms font-medium">Recomendaciones</span>
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-orange-ms text-orange-ms rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
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
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">💡 Consejos:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
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