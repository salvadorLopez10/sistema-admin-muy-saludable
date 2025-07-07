// src/components/Sidebar.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BsArrowLeftShort, BsSearch, BsChevronDown, BsList, BsX } from "react-icons/bs";
import { MdDashboard } from "react-icons/md";
import { menuConfig, MenuItem } from "../config/menuConfig";
import logoMuySaludableMR from '../assets/logoMuySaludableMR.png';

interface SidebarProps {
  title?: string;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  title = "Muy Saludable",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [open, setOpen] = useState<boolean>(true);
  const [submenuOpen, setSubmenuOpen] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setOpen(false);
      } else {
        setMobileMenuOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Expandir submenús basado en la ruta actual
  useEffect(() => {
    const expandActiveMenus = (items: MenuItem[], path: string = location.pathname) => {
      const newSubmenuOpen: Record<string, boolean> = {};
      
      const checkAndExpand = (menuItems: MenuItem[]) => {
        menuItems.forEach(item => {
          if (item.submenuItems) {
            // Verificar si algún submenú contiene la ruta actual
            const hasActiveChild = item.submenuItems.some(subItem => 
              subItem.path === path || 
              (subItem.submenuItems && subItem.submenuItems.some(subSubItem => subSubItem.path === path))
            );
            
            if (hasActiveChild) {
              newSubmenuOpen[item.id] = true;
            }
            
            // Recursivamente verificar submenús anidados
            checkAndExpand(item.submenuItems);
          }
        });
      };
      
      checkAndExpand(items);
      setSubmenuOpen(newSubmenuOpen);
    };

    expandActiveMenus(menuConfig);
  }, [location.pathname]);

  // Función para toggle de submenús
  const toggleSubmenu = (itemId: string): void => {
    setSubmenuOpen(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Función para cerrar menú móvil
  const handleOverlayClick = (): void => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Manejar click en item del menú
  const handleMenuItemClick = (item: MenuItem): void => {
    if (item.submenu) {
      toggleSubmenu(item.id);
    } else if (item.path) {
      navigate(item.path);
      if (isMobile) {
        setMobileMenuOpen(false);
      }
    }
  };

  // Verificar si un item está activo
  const isActiveItem = (item: MenuItem): boolean => {
    return location.pathname === item.path;
  };

  // Verificar si un item tiene un hijo activo
  const hasActiveChild = (item: MenuItem): boolean => {
    if (!item.submenuItems) return false;
    
    return item.submenuItems.some(subItem => 
      subItem.path === location.pathname || 
      (subItem.submenuItems && subItem.submenuItems.some(subSubItem => subSubItem.path === location.pathname))
    );
  };

  // Renderizar items del menú recursivamente
  const renderMenuItem = (item: MenuItem, level: number = 1): JSX.Element => {
    const isActive = isActiveItem(item);
    const hasActiveChildItem = hasActiveChild(item);
    const isExpanded = submenuOpen[item.id];
    
    const paddingLeft = level === 1 ? 'pl-2' : level === 2 ? 'pl-8' : 'pl-12';
    const textSize = level === 1 ? 'text-md' : level === 2 ? 'text-sm' : 'text-xs';
    const iconSize = level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg';

    return (
      <div key={item.id}>
        <li 
          className={`
            text-white ${textSize} flex items-center gap-x-4 cursor-pointer p-2 rounded-md transition-colors
            ${paddingLeft}
            ${isActive ? 'bg-orange-ms' : hasActiveChildItem ? 'bg-orange-400' : 'hover:bg-orange-ms'}
            ${item.spacing ? "mt-9": "mt-2"}
          `}
          onClick={() => handleMenuItemClick(item)}
          role="menuitem"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleMenuItemClick(item);
            }
          }}
        >
          {level === 1 && (
            <span className={`${iconSize} block float-left flex-shrink-0`}>
              {item.icon ? item.icon : <MdDashboard />}
            </span>
          )}
          <span 
            className={`font-medium flex-1 ${!open && !isMobile && level === 1 && "hidden"}`}
          >
            {item.title}
          </span>

          {item.submenu && (open || isMobile) && (
            <BsChevronDown 
              className={`transition-transform ${isExpanded && "rotate-180"}`}
              aria-label={isExpanded ? "Colapsar submenú" : "Expandir submenú"}
            />
          )}
        </li>

        {/* Submenú con animación */}
        {item.submenu && (open || isMobile) && item.submenuItems && (
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <ul className="ml-2" role="menu">
              {item.submenuItems.map((subItem) => 
                renderMenuItem(subItem, level + 1)
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
 <>
   {/* Botón hamburguesa para móvil */}
   {isMobile && (
     <button
       className="fixed top-4 left-4 z-50 bg-orange-ms text-white p-2 rounded-md md:hidden hover:bg-orange-600 transition-colors"
       onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
       aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
     >
       {mobileMenuOpen ? <BsX size={24} /> : <BsList size={24} />}
     </button>
   )}

   {/* Overlay para móvil */}
   {isMobile && mobileMenuOpen && (
     <div 
       className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
       onClick={handleOverlayClick}
       aria-label="Cerrar menú"
     />
   )}

   {/* Sidebar - Siempre visible en desktop, solo overlay en móvil */}
   {!isMobile ? (
        <div 
        className={`
            bg-orange-ms h-screen p-5 pt-8 duration-300 relative overflow-y-auto
            ${open ? "w-72" : "w-20"}
        `}
        >
        {/* Botón para colapsar sidebar en desktop */}
            <BsArrowLeftShort
                className={`bg-white text-orange-ms text-3xl rounded-full absolute -right-2 top-5 border border-orange-ms cursor-pointer hover:bg--yellow-ms transition-colors z-10 ${!open && "rotate-180"}`}
                onClick={() => setOpen(!open)}
                aria-label={open ? "Colapsar sidebar" : "Expandir sidebar"}
            />

            {/* Logo */}
            <div className='inline-flex items-center'>
                 <img 
                    src={logoMuySaludableMR}
                    alt="Muy Saludable Logo"
                    className={`w-10 h-10 rounded cursor-pointer block float-left mr-2 duration-500 ${open && "rotate-[360deg]"}`} 
                />
                <h1 
                    className={`text-white origin-left font-medium text-xl duration-200 ${!open && "scale-0"}`}
                >
                    {title}
                </h1>
            </div>

            {/* Barra de búsqueda */}
            <div className={`flex items-center rounded-md bg-white mt-6 ${!open ? "px-2.5" : "px-4"} py-2`}>
                <BsSearch className={`text-orange-ms text-lg block float-left cursor-pointer ${open && "mr-2"}`}/>
                <input 
                type="search" 
                placeholder="Search" 
                className={`text-base bg-transparent w-full text-orange-ms focus:outline-none ${!open && "hidden"}`} 
                aria-label="Buscar"
                />
            </div>

            {/* Menú */}
            <ul className="pt-2">
                {menuConfig.map((item) => renderMenuItem(item))}
            </ul>
        </div>
    
   ) : (
     mobileMenuOpen && (
       <div 
         className="bg-orange-ms h-screen p-5 pt-8 duration-300 relative overflow-y-auto fixed left-0 top-0 z-50 w-72 shadow-lg"
       >
         {/* Logo */}
         <div className='inline-flex items-center'>
           <img 
                src={logoMuySaludableMR}
                alt="Muy Saludable Logo"
                className={`w-10 h-10 rounded cursor-pointer block float-left mr-2 duration-500 ${open && "rotate-[360deg]"}`} 
            />
           <h1 className="text-white origin-left font-medium text-2xl duration-200">
             {title}
           </h1>
         </div>

         {/* Barra de búsqueda */}
         <div className="flex items-center rounded-md bg-white mt-6 px-4 py-2">
           <BsSearch className="text-orange-800 text-lg block float-left cursor-pointer mr-2"/>
           <input 
             type="search" 
             placeholder="Search" 
             className="text-base bg-transparent w-full text-orange-800 focus:outline-none" 
             aria-label="Buscar"
           />
         </div>

         {/* Menú */}
         <ul className="pt-2">
           {menuConfig.map((item) => renderMenuItem(item))}
         </ul>
       </div>
     )
   )}
 </>
);
};