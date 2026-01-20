import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Building2, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig = {
  borrador: { label: 'Borrador', variant: 'secondary' as const, icon: Clock, className: '' },
  enviada: { label: 'Enviada', variant: 'default' as const, icon: Send, className: 'bg-info hover:bg-info/90' },
  aceptada: { label: 'Aceptada', variant: 'default' as const, icon: CheckCircle2, className: 'bg-success hover:bg-success/90' },
  rechazada: { label: 'Rechazada', variant: 'destructive' as const, icon: XCircle, className: '' },
};

const Dashboard: React.FC = () => {
  const { quotations, businessProfile } = useData();

  const stats = {
    total: quotations.length,
    borradores: quotations.filter(q => q.status === 'borrador').length,
    enviadas: quotations.filter(q => q.status === 'enviada').length,
    aceptadas: quotations.filter(q => q.status === 'aceptada').length,
    rechazadas: quotations.filter(q => q.status === 'rechazada').length,
    montoTotal: quotations
      .filter(q => q.status === 'aceptada')
      .reduce((sum, q) => sum + q.total, 0),
  };

  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              ¡Hola, {businessProfile.ownerName?.split(' ')[0] || 'Carpintero'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Aquí está el resumen de tus cotizaciones
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/cotizacion/nueva">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cotización
            </Link>
          </Button>
        </div>

        {/* Verificar si el perfil está configurado */}
        {!businessProfile.businessName && (
          <Card className="border-warning bg-warning/10">
            <CardContent className="flex items-center gap-4 py-4">
              <Building2 className="w-8 h-8 text-warning" />
              <div className="flex-1">
                <p className="font-medium">Configura tu perfil de negocio</p>
                <p className="text-sm text-muted-foreground">
                  Agrega tu logo y datos para que aparezcan en tus cotizaciones
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/perfil">Configurar</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Send className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.enviadas}</p>
                  <p className="text-sm text-muted-foreground">Enviadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.aceptadas}</p>
                  <p className="text-sm text-muted-foreground">Aceptadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.montoTotal)}</p>
                  <p className="text-sm text-muted-foreground">Ventas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cotizaciones recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Cotizaciones Recientes</CardTitle>
              <CardDescription>Últimas cotizaciones creadas o actualizadas</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/historial">
                Ver todas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentQuotations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No hay cotizaciones aún</p>
                <Button asChild className="mt-4">
                  <Link to="/cotizacion/nueva">Crear primera cotización</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuotations.map((quotation) => {
                  const config = statusConfig[quotation.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <Link
                      key={quotation.id}
                      to={`/cotizacion/${quotation.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0">
                          <StatusIcon className={`w-5 h-5 ${
                            quotation.status === 'aceptada' ? 'text-success' :
                            quotation.status === 'rechazada' ? 'text-destructive' :
                            quotation.status === 'enviada' ? 'text-info' :
                            'text-muted-foreground'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{quotation.folio}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {quotation.client.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="font-medium">{formatCurrency(quotation.total)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(quotation.updatedAt), "d MMM", { locale: es })}
                          </p>
                        </div>
                        <Badge 
                          variant={config.variant}
                          className={config.className}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
