// src/config/menuConfig.ts
import { ReactNode } from 'react';
import { 
  MdDashboard, 
  MdStorage, 
  MdCampaign, 
  MdCode, 
  MdPeople, 
  MdBusiness,
  MdNotifications,
  MdRestaurant,
  MdFitnessCenter,
  MdPsychology,
  MdAccountBalance,
  MdPlayCircle,
  MdViewCarousel,
  MdRecommend,
  MdDescription
} from 'react-icons/md';

export interface MenuItem {
  id: string;
  title: string;
  icon?: ReactNode;
  path?: string;
  spacing?: boolean;
  submenu?: boolean;
  submenuItems?: MenuItem[];
  level?: number;
}

export const menuConfig: MenuItem[] = [
  {
    id: 'inicio',
    title: 'Inicio',
    path: '/inicio',
    level: 1,
    icon: <MdDashboard />
  },
  {
    id: 'data',
    title: 'Data',
    icon: <MdStorage />,
    path: '/data',
    level: 1
  },
  {
    id: 'marketing-suite',
    title: 'Marketing Suite',
    icon: <MdCampaign />,
    submenu: true,
    level: 1,
    submenuItems: [
      {
        id: 'nutricion',
        title: 'Nutrición',
        icon: <MdRestaurant />,
        submenu: true,
        level: 2,
        submenuItems: [
          {
            id: 'planes-generados',
            title: 'Planes generados',
            icon: <MdDescription />,
            path: '/marketing-suite/nutricion/planes-generados',
            level: 3
          },
          {
            id: 'recomendaciones',
            title: 'Recomendaciones',
            icon: <MdRecommend />,
            path: '/marketing-suite/nutricion/recomendaciones',
            level: 3
          },
          {
            id: 'carrusel-nutricion',
            title: 'Carrusel',
            icon: <MdViewCarousel />,
            path: '/marketing-suite/nutricion/carrusel',
            level: 3
          }
        ]
      },
      {
        id: 'rutinas-ejercicio',
        title: 'Rutinas de ejercicio',
        icon: <MdFitnessCenter />,
        submenu: true,
        level: 2,
        submenuItems: [
          {
            id: 'videos',
            title: 'Videos',
            icon: <MdPlayCircle />,
            path: '/marketing-suite/rutinas-ejercicio/videos',
            level: 3
          },
          {
            id: 'carrusel-ejercicio',
            title: 'Carrusel',
            icon: <MdViewCarousel />,
            path: '/marketing-suite/rutinas-ejercicio/carrusel',
            level: 3
          }
        ]
      },
      {
        id: 'salud-mental',
        title: 'Salud Mental',
        icon: <MdPsychology />,
        path: '/marketing-suite/salud-mental',
        level: 2
      },
      {
        id: 'salud-financiera',
        title: 'Salud Financiera',
        icon: <MdAccountBalance />,
        path: '/marketing-suite/salud-financiera',
        level: 2
      }
    ]
  },
  {
    id: 'generador-codigos',
    title: 'Generador de Códigos',
    icon: <MdCode />,
    path: '/generador-codigos',
    level: 1
  },
  {
    id: 'usuarios',
    title: 'Usuarios',
    icon: <MdPeople />,
    path: '/usuarios',
    level: 1
  },
  {
    id: 'clientes',
    title: 'Clientes',
    icon: <MdBusiness />,
    path: '/clientes',
    level: 1
  },
  {
    id: 'campañas',
    title: 'Campañas',
    icon: <MdNotifications />,
    path: '/campañas',
    spacing: true,
    level: 1
  }
];

// Función utilitaria para obtener rutas planas
export const getFlatRoutes = (items: MenuItem[]): MenuItem[] => {
  const flatRoutes: MenuItem[] = [];
  
  const flatten = (menuItems: MenuItem[]) => {
    menuItems.forEach(item => {
      if (item.path) {
        flatRoutes.push(item);
      }
      if (item.submenuItems) {
        flatten(item.submenuItems);
      }
    });
  };
  
  flatten(items);
  return flatRoutes;
};

// Función para obtener breadcrumbs
export const getBreadcrumbs = (path: string, items: MenuItem[]): MenuItem[] => {
  const breadcrumbs: MenuItem[] = [];
  
  const findPath = (menuItems: MenuItem[], currentPath: MenuItem[] = []): boolean => {
    for (const item of menuItems) {
      const newPath = [...currentPath, item];
      
      if (item.path === path) {
        breadcrumbs.push(...newPath);
        return true;
      }
      
      if (item.submenuItems && findPath(item.submenuItems, newPath)) {
        return true;
      }
    }
    return false;
  };
  
  findPath(items);
  return breadcrumbs;
};