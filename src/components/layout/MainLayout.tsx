import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Building2, FileText, History, Plus, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useData } from '@/contexts/DataContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/perfil', icon: Building2, label: 'Mi Negocio' },
  { to: '/cotizacion/nueva', icon: Plus, label: 'Nueva Cotización' },
  { to: '/historial', icon: History, label: 'Historial' },
];

const NavContent: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const location = useLocation();
  const { businessProfile } = useData();

  return (
    <div className="flex flex-col h-full">
      {/* Logo y nombre del negocio */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3" onClick={onItemClick}>
          {businessProfile.logo ? (
            <img 
              src={businessProfile.logo} 
              alt={businessProfile.businessName}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sidebar-foreground truncate text-sm">
              {businessProfile.businessName || 'Mi Carpintería'}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              Sistema de Cotizaciones
            </p>
          </div>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          Cotizaciones Pro v1.0
        </p>
      </div>
    </div>
  );
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border hidden lg:block">
        <NavContent />
      </aside>

      {/* Header móvil */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-40 flex items-center px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-3">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar">
            <NavContent onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        
        <span className="font-semibold text-foreground">Cotizaciones Pro</span>
      </header>

      {/* Contenido principal */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
