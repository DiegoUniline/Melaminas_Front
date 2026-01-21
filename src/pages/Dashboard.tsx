import React from 'react';
import { Link } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
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
  borrador: { label: 'Borrador', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
  enviada: { label: 'Enviada', icon: Send, color: 'text-info', bg: 'bg-info/10' },
  aceptada: { label: 'Aceptada', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  rechazada: { label: 'Rechazada', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const Dashboard: React.FC = () => {
  const { quotations } = useData();

  // Calcular estadísticas del mes actual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthQuotations = quotations.filter(q => {
    const date = new Date(q.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const stats = {
    total: quotations.length,
    pendientes: quotations.filter(q => q.status === 'enviada' || q.status === 'borrador').length,
    aceptadas: quotations.filter(q => q.status === 'aceptada').length,
    ingresosMes: monthQuotations
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MobileLayout title="El Melaminas">
      <div className="space-y-6">
        {/* Stats Grid - 2x2 como en la imagen */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.aceptadas}</p>
                  <p className="text-xs text-muted-foreground">Aceptadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendientes}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-bold">{formatCurrency(stats.ingresosMes)}</p>
                  <p className="text-xs text-muted-foreground">Ingresos/mes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action */}
        <Button asChild size="lg" className="w-full h-14 text-base">
          <Link to="/cotizacion/nueva">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Cotización
          </Link>
        </Button>

        {/* Recent Quotations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recientes</h2>
            <Link to="/historial" className="text-sm text-primary flex items-center">
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentQuotations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No hay cotizaciones aún</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentQuotations.map((quotation) => {
                const config = statusConfig[quotation.status];
                const StatusIcon = config.icon;
                
                return (
                  <Link
                    key={quotation.id}
                    to={`/cotizacion/${quotation.id}`}
                    className="block"
                  >
                    <Card className="hover:bg-muted/30 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                              <StatusIcon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{quotation.client.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{quotation.folio}</span>
                                <span>•</span>
                                <span>{format(new Date(quotation.updatedAt), "d MMM", { locale: es })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-semibold text-sm">{formatCurrency(quotation.total)}</p>
                            <Badge variant="outline" className={`text-xs ${config.color} border-current`}>
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
