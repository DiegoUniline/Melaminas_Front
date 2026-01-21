import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FilePlus, 
  History, 
  Users, 
  Settings, 
  LogOut, 
  Shield, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { USER_ROLES } from '@/types';
import { useState } from 'react';

interface DesktopLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/cotizaciones', icon: FilePlus, label: 'Cotizaciones' },
  { to: '/historial', icon: History, label: 'Historial' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/reportes', icon: BarChart3, label: 'Reportes' },
];

const adminItems = [
  { to: '/perfil', icon: Settings, label: 'Mi Perfil' },
];

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ 
  children, 
  title 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col transition-all duration-200 z-50",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground truncate">El Melaminas</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive(item.to)
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}

          <Separator className="my-3" />

          {adminItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive(item.to)
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}

          {currentUser?.role === 'superadmin' && (
            <Link
              to="/superadmin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive('/superadmin')
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Panel Admin</span>}
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.name}</p>
                <Badge variant="secondary" className="text-xs mt-0.5">
                  {currentUser && USER_ROLES[currentUser.role]?.label}
                </Badge>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn(
              "w-full text-destructive hover:text-destructive hover:bg-destructive/10",
              collapsed ? "px-0 justify-center" : "justify-start"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Cerrar Sesión</span>}
          </Button>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-200",
          collapsed ? "ml-16" : "ml-60"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border px-6 py-4">
          <h1 className="text-xl font-semibold text-foreground">{title || 'El Melaminas'}</h1>
        </header>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
