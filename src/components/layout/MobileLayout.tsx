import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Plus, History, User, Users } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
}

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/cotizacion/nueva', icon: Plus, label: 'Nueva' },
  { to: '/historial', icon: History, label: 'Historial' },
  { to: '/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/perfil', icon: User, label: 'Perfil' },
];

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  title,
  showHeader = true 
}) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-primary text-primary-foreground px-4 py-4 safe-area-top">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{title || 'El Melaminas'}</h1>
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
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to !== '/' && location.pathname.startsWith(item.to));
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-6 h-6",
                  isActive && "fill-current"
                )} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
