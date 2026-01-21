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

const HistoryPage: React.FC = () => {
  const { quotations } = useData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sortedQuotations = [...quotations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <MobileLayout title="Historial">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{quotations.length} cotizaciones</p>
          </div>
          <Button asChild size="sm">
            <Link to="/cotizacion/nueva">
              <Plus className="w-4 h-4 mr-1" />
              Nueva
            </Link>
          </Button>
        </div>

        {/* Lista de cotizaciones */}
        {sortedQuotations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-1">Sin cotizaciones</p>
              <p className="text-muted-foreground mb-4">Crea tu primera cotización</p>
              <Button asChild>
                <Link to="/cotizacion/nueva">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cotización
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {sortedQuotations.map((quotation) => {
              const config = statusConfig[quotation.status];
              const StatusIcon = config.icon;
              
              return (
                <Link
                  key={quotation.id}
                  to={`/cotizacion/${quotation.id}`}
                  className="block"
                >
                  <Card className="hover:bg-muted/30 transition-colors active:scale-[0.98]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                            <StatusIcon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{quotation.client.name}</p>
                            <p className="text-sm text-muted-foreground">{quotation.folio}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(quotation.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3 flex items-center gap-2">
                          <div>
                            <p className="font-semibold">{formatCurrency(quotation.total)}</p>
                            <Badge variant="outline" className={`${config.color} border-current`}>
                              {config.label}
                            </Badge>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
    </MobileLayout>
  );
};

export default HistoryPage;
