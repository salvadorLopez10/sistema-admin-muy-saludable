// src/config/rutinasConfig.ts

export interface TituloRutina {
  value: string;
  label: string;
}

export interface NivelRutina {
  value: string;
  label: string;
}

export interface DiaRutina {
  value: string;
  label: string;
}

// Configuración de títulos de rutinas
export const titulosRutinas: TituloRutina[] = [
  { value: 'CARDIOVASCULAR', label: 'CARDIOVASCULAR' },
  { value: 'FUERZA', label: 'FUERZA' },
  { value: 'ABDOMEN', label: 'ABDOMEN' }
];

// Configuración de niveles
export const nivelesRutinas: NivelRutina[] = [
  { value: 'PRINCIPIANTE', label: 'PRINCIPIANTE' },
  { value: 'INTERMEDIO', label: 'INTERMEDIO' },
  { value: 'AVANZADO', label: 'AVANZADO' }
];

// Configuración de días de la semana
export const diasRutinas: DiaRutina[] = [
  { value: 'LUNES', label: 'LUNES' },
  { value: 'MARTES', label: 'MARTES' },
  { value: 'MIÉRCOLES', label: 'MIÉRCOLES' },
  { value: 'JUEVES', label: 'JUEVES' },
  { value: 'VIERNES', label: 'VIERNES' },
  { value: 'SÁBADO', label: 'SÁBADO' },
  { value: 'DOMINGO', label: 'DOMINGO' }
];

// Función para agregar nuevos títulos (para futura expansión)
export const agregarTitulo = (nuevoTitulo: TituloRutina) => {
  if (!titulosRutinas.find(t => t.value === nuevoTitulo.value)) {
    titulosRutinas.push(nuevoTitulo);
  }
};

// Función para obtener label por value
export const obtenerLabelTitulo = (value: string): string => {
  return titulosRutinas.find(t => t.value === value)?.label || value;
};

export const obtenerLabelNivel = (value: string): string => {
  return nivelesRutinas.find(n => n.value === value)?.label || value;
};

export const obtenerLabelDia = (value: string): string => {
  return diasRutinas.find(d => d.value === value)?.label || value;
};