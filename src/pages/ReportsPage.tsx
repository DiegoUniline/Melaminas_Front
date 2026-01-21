import React, { useState, useMemo, useEffect } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  FileText, 
  Users as UsersIcon, 
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  PieChart,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { USER_ROLES, Quotation } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, subMonths, isAfter, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['hsl(340, 30%, 45%)', 'hsl(200, 80%, 50%)', 'hsl(145, 60%, 40%)', 'hsl(0, 70%, 55%)'];

const ReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { quotations, clients, isLoading, refreshQuotations } = useData();
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [period, setPeriod] = useState<string>('6');

  // Refresh data on mount
  useEffect(() => {
    refreshQuotations();
  }, []);

  // Filter quotations based on selected user and period
  const filteredQuotations = useMemo(() => {
    const monthsAgo = subMonths(new Date(), parseInt(period));
    
    return quotations.filter(q => {
      const inPeriod = isAfter(new Date(q.createdAt), monthsAgo);
      if (!isSuperAdmin) return inPeriod;
      if (selectedUser === 'all') return inPeriod;
      // In a real app, quotations would have a userId field
      return inPeriod;
    });
  }, [quotations, selectedUser, period, isSuperAdmin]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredQuotations.length;
    const accepted = filteredQuotations.filter(q => q.status === 'aceptada').length;
    const pending = filteredQuotations.filter(q => q.status === 'enviada').length;
    const rejected = filteredQuotations.filter(q => q.status === 'rechazada').length;
    const draft = filteredQuotations.filter(q => q.status === 'borrador').length;
    
    const revenue = filteredQuotations
      .filter(q => q.status === 'aceptada')
      .reduce((sum, q) => sum + q.total, 0);
    
    const avgTicket = accepted > 0 ? revenue / accepted : 0;
    const conversionRate = total > 0 ? ((accepted / total) * 100) : 0;

    return { total, accepted, pending, rejected, draft, revenue, avgTicket, conversionRate };
  }, [filteredQuotations]);

  // Chart data - Status distribution
  const statusChartData = useMemo(() => [
    { name: 'Aceptadas', value: stats.accepted, color: COLORS[2] },
    { name: 'Enviadas', value: stats.pending, color: COLORS[1] },
    { name: 'Borradores', value: stats.draft, color: COLORS[0] },
    { name: 'Rechazadas', value: stats.rejected, color: COLORS[3] },
  ].filter(d => d.value > 0), [stats]);

  // Chart data - Monthly revenue
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; revenue: number; count: number }> = {};
    const monthsCount = parseInt(period);
    
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const key = format(date, 'yyyy-MM');
      const label = format(date, 'MMM', { locale: es });
      months[key] = { month: label, revenue: 0, count: 0 };
    }

    filteredQuotations.forEach(q => {
      if (q.status === 'aceptada') {
        const key = format(new Date(q.createdAt), 'yyyy-MM');
        if (months[key]) {
          months[key].revenue += q.total;
          months[key].count += 1;
        }
      }
    });

    return Object.values(months);
  }, [filteredQuotations, period]);

  // Note: Users are not loaded from API yet, so we show a placeholder
  const activeUsersCount = 1; // Current user

  if (isLoading) {
    return (
      <ResponsiveLayout title="Reportes">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout title="Reportes">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* User filter disabled - not loading users from API yet */}
          {/* {isSuperAdmin && (
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
              </SelectContent>
            </Select>
          )} */}
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Último mes</SelectItem>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="text-2xl font-bold">${stats.revenue.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-success" />
                <span>Cotizaciones aceptadas</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cotizaciones</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                  {stats.accepted} aceptadas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                  <p className="text-2xl font-bold">${stats.avgTicket.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-info" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <span>Por cotización aceptada</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversión</p>
                  <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <span>Tasa de cierre</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Ingresos por Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="hsl(340, 30%, 45%)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Distribución de Cotizaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom"
                      formatter={(value) => <span className="text-sm">{value}</span>}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumen por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.accepted}</p>
                  <p className="text-xs text-muted-foreground">Aceptadas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-info" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Enviadas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.draft}</p>
                  <p className="text-xs text-muted-foreground">Borradores</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.rejected}</p>
                  <p className="text-xs text-muted-foreground">Rechazadas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients summary - for superadmin */}
        {isSuperAdmin && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Resumen General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border">
                  <p className="text-3xl font-bold text-primary">{activeUsersCount}</p>
                  <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <p className="text-3xl font-bold text-info">{clients.length}</p>
                  <p className="text-sm text-muted-foreground">Clientes Totales</p>
                </div>
                <div className="text-center p-4 rounded-lg border sm:col-span-1 col-span-2">
                  <p className="text-3xl font-bold text-success">{quotations.length}</p>
                  <p className="text-sm text-muted-foreground">Cotizaciones Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default ReportsPage;
