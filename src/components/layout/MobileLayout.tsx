import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, FilePlus, History, Users, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { USER_ROLES } from '@/types';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
}

const baseNavItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/cotizacion/nueva', icon: FilePlus, label: 'Nueva' },
  { to: '/historial', icon: History, label: 'Historial' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/perfil', icon: Settings, label: 'Perfil' },
];

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  title,
  showHeader = true 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-primary text-primary-foreground px-4 py-3 safe-area-top">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{title || 'El Melaminas'}</h1>
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs opacity-80">{currentUser.name}</p>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {USER_ROLES[currentUser.role].label}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
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
          {(() => {
            const navItems = currentUser?.role === 'superadmin' 
              ? [...baseNavItems, { to: '/superadmin', icon: Shield, label: 'Admin' }]
              : baseNavItems;
            
            return navItems.map((item) => {
              const isActive = location.pathname === item.to || 
                (item.to !== '/' && location.pathname.startsWith(item.to));
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[50px]",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive && "fill-current"
                  )} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            });
          })()}
        </div>
      </nav>
    </div>
  );
};
