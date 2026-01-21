import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, FilePlus, History, Users, LogOut, Shield, Menu, User, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { USER_ROLES } from '@/types';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
}

const bottomNavItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/cotizaciones', icon: FilePlus, label: 'Cotizaciones' },
  { to: '/historial', icon: History, label: 'Historial' },
  { to: '/reportes', icon: BarChart3, label: 'Reportes' },
];

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  title,
  showHeader = true 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { to: '/clientes', icon: Users, label: 'Clientes' },
    { to: '/perfil', icon: Settings, label: 'Mi Perfil' },
    ...(currentUser?.role === 'superadmin' 
      ? [{ to: '/superadmin', icon: Shield, label: 'Panel Admin' }] 
      : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-primary text-white px-4 py-3 safe-area-top">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-card border-r">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <SheetDescription className="sr-only">Navega por las secciones de la aplicación</SheetDescription>
                {/* Menu Header */}
                <div className="p-5 bg-primary text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{currentUser?.name}</p>
                      <Badge className="bg-white/20 text-white text-xs mt-1">
                        {currentUser && USER_ROLES[currentUser.role]?.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <nav className="p-4 space-y-2">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-md" 
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-bold">{title || 'El Melaminas'}</h1>
            
            {/* Placeholder para equilibrar el header */}
            <div className="w-10" />
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        <div className="px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to !== '/' && location.pathname.startsWith(item.to));
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive && "font-semibold"
                )}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
