import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/types';

const LoginPage: React.FC = () => {
  const { users, login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (userId: string) => {
    login(userId);
    navigate('/');
  };

  const getRoleBadge = (role: 'admin' | 'vendedor' | 'instalador') => {
    const config = USER_ROLES[role];
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center p-4">
      {/* Logo y título */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-primary-foreground">EM</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">El Melaminas</h1>
        <p className="text-muted-foreground mt-1">Sistema de Cotizaciones</p>
      </div>

      {/* Selección de usuario */}
      <div className="w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-center">Selecciona tu perfil</h2>
        
        <div className="space-y-3">
          {users.map((user) => (
            <Card 
              key={user.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleLogin(user.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="mt-1">
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost">
                    <LogIn className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Simulación de login • Datos almacenados localmente
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
