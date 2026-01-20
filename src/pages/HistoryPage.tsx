import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, Send, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig = {
  borrador: { label: 'Borrador', variant: 'secondary' as const, icon: Clock, className: '' },
  enviada: { label: 'Enviada', variant: 'default' as const, icon: Send, className: 'bg-info hover:bg-info/90' },
  aceptada: { label: 'Aceptada', variant: 'default' as const, icon: CheckCircle2, className: 'bg-success hover:bg-success/90' },
  rechazada: { label: 'Rechazada', variant: 'destructive' as const, icon: XCircle, className: '' },
};

const HistoryPage: React.FC = () => {
  const { quotations } = useData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const sortedQuotations = [...quotations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Historial de Cotizaciones</h1>
            <p className="text-muted-foreground mt-1">Todas tus cotizaciones en un solo lugar</p>
          </div>
          <Button asChild>
            <Link to="/cotizacion/nueva">
              <Plus className="w-4 h-4 mr-2" />
              Nueva
            </Link>
          </Button>
        </div>

        {sortedQuotations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay cotizaciones aún</p>
              <Button asChild className="mt-4">
                <Link to="/cotizacion/nueva">Crear primera cotización</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedQuotations.map((q) => {
              const config = statusConfig[q.status];
              return (
                <Card key={q.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold">{q.folio}</p>
                        <p className="text-sm text-muted-foreground">{q.client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(q.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(q.total)}</p>
                        <Badge variant={config.variant} className={config.className}>
                          {config.label}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/cotizacion/${q.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HistoryPage;
