import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  User, 
  Package, 
  Trash2, 
  Edit2, 
  Save, 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  ArrowLeft,
  Search,
  Settings,
  X,
  ImageIcon,
  ChevronRight,
  Eye
} from 'lucide-react';
import { ClientSelector } from '@/components/quotation/ClientSelector';
import { FurnitureItemForm } from '@/components/quotation/FurnitureItemForm';
import { FurnitureItemDetailModal } from '@/components/quotation/FurnitureItemDetailModal';
import { QuotationActions } from '@/components/quotation/QuotationActions';
import { useData } from '@/contexts/DataContext';
import { Client, FurnitureItem, QuotationStatus, Quotation } from '@/types';
import { downloadQuotationPDF } from '@/utils/pdfGenerator';
import { shareToClientWhatsApp } from '@/utils/whatsappShare';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig = {
  borrador: { label: 'Borrador', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
  enviada: { label: 'Enviada', icon: Send, color: 'text-info', bg: 'bg-info/10' },
  aceptada: { label: 'Aceptada', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  rechazada: { label: 'Rechazada', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const QuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const { quotations, addQuotation, updateQuotation, getQuotationById, businessProfile } = useData();
  
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [furnitureFormOpen, setFurnitureFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FurnitureItem | null>(null);
  const [detailItem, setDetailItem] = useState<FurnitureItem | null>(null);
  
  const [conditions, setConditions] = useState({
    deliveryDays: '15',
    validityDays: '30',
    paymentTerms: '50% anticipo, 50% contra entrega',
    advancePercentage: '50',
    observations: '',
  });

  const [discount, setDiscount] = useState({
    amount: '',
    type: 'percentage' as 'percentage' | 'fixed',
  });

  // Handle URL params for editing
  useEffect(() => {
    if (id && id !== 'nueva') {
      const quotation = getQuotationById(id);
      if (quotation) {
        loadQuotation(quotation);
        setView('detail');
        setEditingQuotationId(id);
      }
    } else if (id === 'nueva') {
      resetForm();
      setView('detail');
      setEditingQuotationId(null);
    }
  }, [id]);

  const loadQuotation = (quotation: Quotation) => {
    setSelectedClient(quotation.client);
    setItems(quotation.items);
    setConditions({
      deliveryDays: quotation.deliveryDays.toString(),
      validityDays: quotation.validityDays.toString(),
      paymentTerms: quotation.paymentTerms,
      advancePercentage: quotation.advancePercentage?.toString() || '',
      observations: quotation.observations || '',
    });
    if (quotation.discount) {
      setDiscount({
        amount: quotation.discount.toString(),
        type: quotation.discountType || 'percentage',
      });
    } else {
      setDiscount({ amount: '', type: 'percentage' });
    }
  };

  const resetForm = () => {
    setSelectedClient(null);
    setItems([]);
    setConditions({
      deliveryDays: '15',
      validityDays: '30',
      paymentTerms: '50% anticipo, 50% contra entrega',
      advancePercentage: '50',
      observations: '',
    });
    setDiscount({ amount: '', type: 'percentage' });
  };

  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConditions(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async (item: FurnitureItem) => {
    // Actualizar estado local primero
    let updatedItems: FurnitureItem[];
    if (editingItem) {
      updatedItems = items.map(i => i.id === item.id ? item : i);
      setItems(updatedItems);
      setEditingItem(null);
    } else {
      updatedItems = [...items, item];
      setItems(updatedItems);
    }

    // Guardar a la API inmediatamente
    try {
      if (editingQuotationId) {
        // Cotización existente - actualizar items
        console.log('[QuotationsPage] Guardando items a cotización existente:', editingQuotationId);
        const success = await updateQuotation(editingQuotationId, { items: updatedItems });
        if (success) {
          toast.success(editingItem ? 'Mueble actualizado' : 'Mueble agregado y guardado');
        }
      } else if (selectedClient) {
        // Cotización nueva - crearla primero con los items
        console.log('[QuotationsPage] Creando nueva cotización con items...');
        const quotationData = {
          clientId: selectedClient.id,
          client: selectedClient,
          items: updatedItems,
          subtotal: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
          total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
          deliveryDays: parseInt(conditions.deliveryDays) || 15,
          validityDays: parseInt(conditions.validityDays) || 30,
          paymentTerms: conditions.paymentTerms,
          advancePercentage: conditions.advancePercentage ? parseInt(conditions.advancePercentage) : undefined,
          observations: conditions.observations || undefined,
          status: 'borrador' as QuotationStatus,
        };
        
        const newQuotation = await addQuotation(quotationData);
        if (newQuotation) {
          setEditingQuotationId(newQuotation.id);
          navigate(`/cotizaciones/${newQuotation.id}`, { replace: true });
          toast.success(`Cotización ${newQuotation.folio} creada con mueble`);
        }
      } else {
        // No hay cliente seleccionado - solo guardar localmente
        toast.success(editingItem ? 'Mueble actualizado' : 'Mueble agregado (selecciona cliente para guardar)');
      }
    } catch (error) {
      console.error('[QuotationsPage] Error al guardar item:', error);
      toast.error('Error al guardar mueble');
    }
  };

  const handleEditItem = (item: FurnitureItem) => {
    setEditingItem(item);
    setFurnitureFormOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    const updatedItems = items.filter(i => i.id !== itemId);
    setItems(updatedItems);
    
    // Si hay cotización existente, actualizar en API
    if (editingQuotationId) {
      try {
        await updateQuotation(editingQuotationId, { items: updatedItems });
        toast.success('Mueble eliminado y guardado');
      } catch (error) {
        console.error('[QuotationsPage] Error al eliminar item:', error);
        toast.error('Error al eliminar mueble');
      }
    } else {
      toast.success('Mueble eliminado');
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = discount.amount
    ? discount.type === 'percentage'
      ? subtotal * (parseFloat(discount.amount) / 100)
      : parseFloat(discount.amount)
    : 0;
  const total = subtotal - discountAmount;

  const handleSave = async (status: QuotationStatus = 'borrador') => {
    if (!selectedClient) {
      toast.error('Selecciona un cliente');
      return;
    }
    if (items.length === 0) {
      toast.error('Agrega al menos un mueble');
      return;
    }

    const quotationData = {
      clientId: selectedClient.id,
      client: selectedClient,
      items,
      subtotal,
      discount: discount.amount ? parseFloat(discount.amount) : undefined,
      discountType: discount.amount ? discount.type : undefined,
      total,
      deliveryDays: parseInt(conditions.deliveryDays) || 15,
      validityDays: parseInt(conditions.validityDays) || 30,
      paymentTerms: conditions.paymentTerms,
      advancePercentage: conditions.advancePercentage ? parseInt(conditions.advancePercentage) : undefined,
      observations: conditions.observations || undefined,
      status,
    };

    if (editingQuotationId) {
      await updateQuotation(editingQuotationId, quotationData);
      toast.success('Cotización actualizada');
    } else {
      const newQuotation = await addQuotation(quotationData);
      if (newQuotation) {
        toast.success(`Cotización ${newQuotation.folio} creada`);
      } else {
        toast.error('Error al crear cotización');
        return;
      }
    }
    
    handleBackToList();
  };

  const handleGeneratePDF = async () => {
    if (!selectedClient) {
      toast.error('Selecciona un cliente');
      return;
    }
    if (items.length === 0) {
      toast.error('Agrega al menos un mueble');
      return;
    }

    const quotationData = {
      clientId: selectedClient.id,
      client: selectedClient,
      items,
      subtotal,
      discount: discount.amount ? parseFloat(discount.amount) : undefined,
      discountType: discount.amount ? discount.type : undefined,
      total,
      deliveryDays: parseInt(conditions.deliveryDays) || 15,
      validityDays: parseInt(conditions.validityDays) || 30,
      paymentTerms: conditions.paymentTerms,
      advancePercentage: conditions.advancePercentage ? parseInt(conditions.advancePercentage) : undefined,
      observations: conditions.observations || undefined,
      status: 'enviada' as QuotationStatus,
    };

    let quotation;
    if (editingQuotationId) {
      await updateQuotation(editingQuotationId, quotationData);
      quotation = { ...getQuotationById(editingQuotationId)!, ...quotationData };
    } else {
      const newQuotation = await addQuotation(quotationData);
      if (!newQuotation) {
        toast.error('Error al crear cotización');
        return;
      }
      quotation = newQuotation;
    }

    try {
      downloadQuotationPDF(quotation, businessProfile);
      toast.success('PDF generado');
      handleBackToList();
    } catch (error) {
      toast.error('Error al generar PDF');
    }
  };

  const handleNewQuotation = () => {
    resetForm();
    setEditingQuotationId(null);
    setView('detail');
    navigate('/cotizaciones/nueva');
  };

  const handleEditQuotation = (quotation: Quotation) => {
    loadQuotation(quotation);
    setEditingQuotationId(quotation.id);
    setView('detail');
    navigate(`/cotizaciones/${quotation.id}`);
  };

  const handleBackToList = () => {
    setView('list');
    setEditingQuotationId(null);
    resetForm();
    navigate('/cotizaciones');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredQuotations = quotations.filter(q =>
    q.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.folio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedQuotations = [...filteredQuotations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Mobile view - redirect to old pages
  if (isMobile) {
    if (view === 'detail' || id) {
      return <MobileQuotationDetail 
        editingQuotationId={editingQuotationId}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        items={items}
        conditions={conditions}
        discount={discount}
        subtotal={subtotal}
        discountAmount={discountAmount}
        total={total}
        furnitureFormOpen={furnitureFormOpen}
        setFurnitureFormOpen={setFurnitureFormOpen}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        handleConditionChange={handleConditionChange}
        handleAddItem={handleAddItem}
        handleEditItem={handleEditItem}
        handleDeleteItem={handleDeleteItem}
        handleSave={handleSave}
        handleGeneratePDF={handleGeneratePDF}
        setDiscount={setDiscount}
        handleBackToList={handleBackToList}
        detailItem={detailItem}
        setDetailItem={setDetailItem}
      />;
    }
    return <MobileQuotationList 
      sortedQuotations={sortedQuotations}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filteredQuotations={filteredQuotations}
      handleNewQuotation={handleNewQuotation}
      handleEditQuotation={handleEditQuotation}
      formatCurrency={formatCurrency}
    />;
  }

  // Desktop view - Odoo style
  return (
    <ResponsiveLayout title="Cotizaciones">
      {view === 'list' ? (
        <DesktopQuotationList 
          sortedQuotations={sortedQuotations}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredQuotations={filteredQuotations}
          handleNewQuotation={handleNewQuotation}
          handleEditQuotation={handleEditQuotation}
          formatCurrency={formatCurrency}
        />
      ) : (
        <DesktopQuotationDetail 
          editingQuotationId={editingQuotationId}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          items={items}
          conditions={conditions}
          discount={discount}
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
          furnitureFormOpen={furnitureFormOpen}
          setFurnitureFormOpen={setFurnitureFormOpen}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          handleConditionChange={handleConditionChange}
          handleAddItem={handleAddItem}
          handleEditItem={handleEditItem}
          handleDeleteItem={handleDeleteItem}
          handleSave={handleSave}
          handleGeneratePDF={handleGeneratePDF}
          setDiscount={setDiscount}
          handleBackToList={handleBackToList}
          detailItem={detailItem}
          setDetailItem={setDetailItem}
        />
      )}
    </ResponsiveLayout>
  );
};

// Desktop List View
interface ListProps {
  sortedQuotations: Quotation[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredQuotations: Quotation[];
  handleNewQuotation: () => void;
  handleEditQuotation: (quotation: Quotation) => void;
  formatCurrency: (amount: number) => string;
}

const DesktopQuotationList: React.FC<ListProps> = ({
  sortedQuotations,
  searchTerm,
  setSearchTerm,
  filteredQuotations,
  handleNewQuotation,
  handleEditQuotation,
  formatCurrency,
}) => {
  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente o folio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {filteredQuotations.length} cotizaciones
          </Badge>
        </div>
        <Button onClick={handleNewQuotation}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cotización
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-32">Folio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="w-40">Fecha</TableHead>
              <TableHead className="w-32 text-right">Total</TableHead>
              <TableHead className="w-32 text-center">Estado</TableHead>
              <TableHead className="w-24 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="w-10 h-10 opacity-50" />
                    <p>No hay cotizaciones</p>
                    <Button size="sm" variant="outline" onClick={handleNewQuotation}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear primera cotización
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedQuotations.map((quotation) => {
                const config = statusConfig[quotation.status];
                const StatusIcon = config.icon;
                
                return (
                  <TableRow 
                    key={quotation.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditQuotation(quotation)}
                  >
                    <TableCell className="font-medium">{quotation.folio}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{quotation.client.name}</p>
                        <p className="text-sm text-muted-foreground">{quotation.client.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(quotation.createdAt), "d MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(quotation.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`${config.color} border-current`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <QuotationActions quotation={quotation} variant="icon" />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// Desktop Detail View with Tabs
interface DetailProps {
  editingQuotationId: string | null;
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  items: FurnitureItem[];
  conditions: {
    deliveryDays: string;
    validityDays: string;
    paymentTerms: string;
    advancePercentage: string;
    observations: string;
  };
  discount: {
    amount: string;
    type: 'percentage' | 'fixed';
  };
  subtotal: number;
  discountAmount: number;
  total: number;
  furnitureFormOpen: boolean;
  setFurnitureFormOpen: (open: boolean) => void;
  editingItem: FurnitureItem | null;
  setEditingItem: (item: FurnitureItem | null) => void;
  handleConditionChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAddItem: (item: FurnitureItem) => void;
  handleEditItem: (item: FurnitureItem) => void;
  handleDeleteItem: (itemId: string) => void;
  handleSave: (status: QuotationStatus) => void;
  handleGeneratePDF: () => void;
  setDiscount: React.Dispatch<React.SetStateAction<{ amount: string; type: 'percentage' | 'fixed' }>>;
  handleBackToList: () => void;
  // New: Detail modal
  detailItem: FurnitureItem | null;
  setDetailItem: (item: FurnitureItem | null) => void;
}

const DesktopQuotationDetail: React.FC<DetailProps> = ({
  editingQuotationId,
  selectedClient,
  setSelectedClient,
  items,
  conditions,
  discount,
  subtotal,
  discountAmount,
  total,
  furnitureFormOpen,
  setFurnitureFormOpen,
  editingItem,
  setEditingItem,
  handleConditionChange,
  handleAddItem,
  handleEditItem,
  handleDeleteItem,
  handleSave,
  handleGeneratePDF,
  setDiscount,
  handleBackToList,
  detailItem,
  setDetailItem,
}) => {
  return (
    <>
    <FurnitureItemDetailModal
      open={!!detailItem}
      onOpenChange={(open) => !open && setDetailItem(null)}
      item={detailItem}
    />
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h2 className="text-xl font-semibold">
            {editingQuotationId ? 'Editar Cotización' : 'Nueva Cotización'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGeneratePDF}>
            <FileText className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Main content with tabs */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left side - Tabs */}
        <div className="col-span-2">
          <Card>
            <Tabs defaultValue="cliente-muebles" className="w-full">
              <CardHeader className="pb-0 border-b">
                <TabsList className="w-full justify-start gap-4 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="cliente-muebles" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Cliente y Muebles
                  </TabsTrigger>
                  <TabsTrigger 
                    value="condiciones" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Condiciones
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <TabsContent value="cliente-muebles" className="mt-0">
                <CardContent className="p-6 space-y-6">
                  {/* Cliente Section */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Cliente
                    </h3>
                    <ClientSelector
                      selectedClient={selectedClient}
                      onSelectClient={setSelectedClient}
                    />
                  </div>

                  {/* Muebles Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Muebles
                      </h3>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingItem(null);
                          setFurnitureFormOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Mueble
                      </Button>
                    </div>
                    
                    {items.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No hay muebles agregados</p>
                        <p className="text-sm text-muted-foreground mb-4">Haz clic en "Agregar Mueble" para comenzar</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Foto</TableHead>
                            <TableHead>Mueble</TableHead>
                            <TableHead>Material</TableHead>
                            <TableHead>Medidas</TableHead>
                            <TableHead className="text-center">Cant.</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {item.imageUrl ? (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{item.name}</p>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                )}
                              </TableCell>
                              <TableCell>
                                <p>{item._materialName || item.material}</p>
                                <p className="text-sm text-muted-foreground">{item._colorName || item.sheetColor}</p>
                              </TableCell>
                              <TableCell>
                                {item.height && item.width && (
                                  <span className="text-sm">
                                    {item.height}x{item.width}{item.depth ? `x${item.depth}` : ''} {item.measureUnit}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">
                                ${item.unitPrice.toLocaleString('es-MX')}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${item.subtotal.toLocaleString('es-MX')}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDetailItem(item)}
                                    title="Ver detalles"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditItem(item)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}

                    {/* Design CTA Button */}
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full border-dashed border-primary text-primary hover:bg-primary/5"
                        onClick={() => window.open('https://wa.me/525540718923?text=Hola, necesito un diseño para mi mueble', '_blank')}
                      >
                        ✨ ¿Necesitas el diseño? Nosotros te lo hacemos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="condiciones" className="mt-0">
                <CardContent className="p-6 space-y-6">
                  {/* Descuento */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Descuento</h3>
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="discountAmount">Cantidad</Label>
                        <Input
                          id="discountAmount"
                          type="number"
                          value={discount.amount}
                          onChange={(e) => setDiscount(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={discount.type}
                          onValueChange={(value: 'percentage' | 'fixed') => 
                            setDiscount(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border shadow-lg z-50">
                            <SelectItem value="percentage">Porcentaje %</SelectItem>
                            <SelectItem value="fixed">Monto fijo $</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Condiciones */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Condiciones de Entrega</h3>
                    <div className="grid grid-cols-2 gap-4 max-w-2xl">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryDays">Días de entrega</Label>
                        <Input
                          id="deliveryDays"
                          name="deliveryDays"
                          type="number"
                          value={conditions.deliveryDays}
                          onChange={handleConditionChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="validityDays">Vigencia (días)</Label>
                        <Input
                          id="validityDays"
                          name="validityDays"
                          type="number"
                          value={conditions.validityDays}
                          onChange={handleConditionChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Forma de pago */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Método de Pago</h3>
                    <div className="grid grid-cols-2 gap-4 max-w-2xl">
                      <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Forma de pago</Label>
                        <Select
                          value={conditions.paymentTerms}
                          onValueChange={(value) => handleConditionChange({ target: { name: 'paymentTerms', value } } as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border shadow-lg z-50">
                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                            <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                            <SelectItem value="Mixto">Mixto</SelectItem>
                            <SelectItem value="50% anticipo, 50% contra entrega">50% anticipo, 50% contra entrega</SelectItem>
                            <SelectItem value="100% anticipo">100% anticipo</SelectItem>
                            <SelectItem value="Pago contra entrega">Pago contra entrega</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="advancePercentage">Porcentaje de anticipo</Label>
                        <Input
                          id="advancePercentage"
                          name="advancePercentage"
                          type="number"
                          value={conditions.advancePercentage}
                          onChange={handleConditionChange}
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Observaciones</h3>
                    <Textarea
                      id="observations"
                      name="observations"
                      value={conditions.observations}
                      onChange={handleConditionChange}
                      placeholder="Notas adicionales para la cotización..."
                      rows={4}
                      className="max-w-2xl"
                    />
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right side - Summary */}
        <div className="col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cliente info */}
              {selectedClient && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedClient.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                  <p className="text-sm text-muted-foreground">{selectedClient.address}</p>
                </div>
              )}

              {/* Items count */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Muebles</span>
                <span className="font-medium">{items.length}</span>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Descuento</span>
                    <span>-${discountAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="pt-4 space-y-2">
                <Button className="w-full" onClick={async () => {
                  await handleSave('enviada');
                  // Auto-send to WhatsApp after saving
                  if (selectedClient?.whatsapp) {
                    const quotation = {
                      id: editingQuotationId || 'temp',
                      folio: 'Nueva',
                      clientId: selectedClient.id,
                      client: selectedClient,
                      items,
                      subtotal,
                      total,
                      discount: discount.amount ? parseFloat(discount.amount) : undefined,
                      discountType: discount.amount ? discount.type : undefined,
                      deliveryDays: parseInt(conditions.deliveryDays) || 15,
                      validityDays: parseInt(conditions.validityDays) || 30,
                      paymentTerms: conditions.paymentTerms,
                      advancePercentage: conditions.advancePercentage ? parseInt(conditions.advancePercentage) : undefined,
                      observations: conditions.observations || undefined,
                      status: 'enviada' as const,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                    shareToClientWhatsApp(quotation, null);
                  }
                }}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
                <Button variant="outline" className="w-full" onClick={handleGeneratePDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Furniture Form Modal */}
      <FurnitureItemForm
        open={furnitureFormOpen}
        onOpenChange={setFurnitureFormOpen}
        onSave={handleAddItem}
        editItem={editingItem}
      />
    </div>
    </>
  );
};

// Mobile List View (same as before)
const MobileQuotationList: React.FC<ListProps> = ({
  sortedQuotations,
  searchTerm,
  setSearchTerm,
  filteredQuotations,
  handleNewQuotation,
  handleEditQuotation,
  formatCurrency,
}) => {
  return (
    <ResponsiveLayout title="Cotizaciones">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button size="sm" onClick={handleNewQuotation}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <Badge variant="secondary" className="px-3 py-1">
          {filteredQuotations.length} cotizaciones
        </Badge>

        {sortedQuotations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-1">Sin cotizaciones</p>
              <Button size="sm" onClick={handleNewQuotation}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {sortedQuotations.map((quotation) => {
              const config = statusConfig[quotation.status];
              const StatusIcon = config.icon;
              
              return (
                <Card 
                  key={quotation.id} 
                  className="cursor-pointer hover:bg-muted/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-3 min-w-0 flex-1"
                        onClick={() => handleEditQuotation(quotation)}
                      >
                        <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                          <StatusIcon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{quotation.client.name}</p>
                          <p className="text-sm text-muted-foreground">{quotation.folio}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right" onClick={() => handleEditQuotation(quotation)}>
                          <p className="font-semibold">{formatCurrency(quotation.total)}</p>
                          <Badge variant="outline" className={`${config.color} border-current`}>
                            {config.label}
                          </Badge>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <QuotationActions quotation={quotation} variant="dropdown" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

// Mobile Detail View with Step-by-Step Tabs
const MobileQuotationDetail: React.FC<DetailProps> = ({
  editingQuotationId,
  selectedClient,
  setSelectedClient,
  items,
  conditions,
  discount,
  subtotal,
  discountAmount,
  total,
  furnitureFormOpen,
  setFurnitureFormOpen,
  editingItem,
  setEditingItem,
  handleConditionChange,
  handleAddItem,
  handleEditItem,
  handleDeleteItem,
  handleSave,
  handleGeneratePDF,
  setDiscount,
  handleBackToList,
  detailItem,
  setDetailItem,
}) => {
  const [activeTab, setActiveTab] = React.useState('cliente');
  
  // Auto-advance to muebles when client is selected
  React.useEffect(() => {
    if (selectedClient && activeTab === 'cliente') {
      // Small delay to show the selection before advancing
      const timer = setTimeout(() => setActiveTab('muebles'), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedClient]);

  const getStepStatus = (step: string) => {
    if (step === 'cliente') return selectedClient ? 'complete' : 'current';
    if (step === 'muebles') return items.length > 0 ? 'complete' : (selectedClient ? 'current' : 'pending');
    if (step === 'condiciones') return items.length > 0 ? 'current' : 'pending';
    return 'pending';
  };

  return (
    <>
    <FurnitureItemDetailModal
      open={!!detailItem}
      onOpenChange={(open) => !open && setDetailItem(null)}
      item={detailItem}
    />
    <ResponsiveLayout 
      title={editingQuotationId ? 'Editar Cotización' : 'Nueva Cotización'}
    >
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={handleBackToList} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4 px-2">
          {[
            { id: 'cliente', label: 'Cliente', icon: User, num: 1 },
            { id: 'muebles', label: 'Muebles', icon: Package, num: 2 },
            { id: 'condiciones', label: 'Condiciones', icon: Settings, num: 3 },
          ].map((step, idx) => {
            const status = getStepStatus(step.id);
            const isActive = activeTab === step.id;
            const StepIcon = step.icon;
            
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveTab(step.id)}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    isActive ? 'scale-105' : ''
                  }`}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${status === 'complete' ? 'bg-success text-success-foreground' : ''}
                    ${isActive && status !== 'complete' ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : ''}
                    ${!isActive && status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                    ${!isActive && status === 'current' ? 'bg-primary/20 text-primary' : ''}
                  `}>
                    {status === 'complete' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </button>
                {idx < 2 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    getStepStatus(['cliente', 'muebles', 'condiciones'][idx + 1]) !== 'pending' 
                      ? 'bg-success' 
                      : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'cliente' && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3 bg-primary/5">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                Selecciona un Cliente
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Elige un cliente existente o crea uno nuevo
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <ClientSelector
                selectedClient={selectedClient}
                onSelectClient={setSelectedClient}
              />
              {selectedClient && (
                <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 text-success mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium text-sm">Cliente seleccionado</span>
                  </div>
                  <p className="font-medium">{selectedClient.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                  <Button 
                    className="w-full mt-3" 
                    onClick={() => setActiveTab('muebles')}
                  >
                    Continuar a Muebles
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'muebles' && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                    Agrega Muebles
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Añade los productos a cotizar
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => {
                    setEditingItem(null);
                    setFurnitureFormOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {!selectedClient && (
                <div className="text-center py-6 bg-muted/50 rounded-lg">
                  <User className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Primero selecciona un cliente</p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('cliente')}>
                    Ir a Cliente
                  </Button>
                </div>
              )}
              {selectedClient && items.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Package className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-3">No hay muebles agregados</p>
                  <Button
                    onClick={() => {
                      setEditingItem(null);
                      setFurnitureFormOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Mueble
                  </Button>
                </div>
              )}
              {items.length > 0 && (
                <>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex gap-3 flex-1">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded bg-background flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item._materialName || item.material} • {item._colorName || item.sheetColor}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.subtotal.toLocaleString('es-MX')}</p>
                            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" className="h-8" onClick={() => setDetailItem(item)}>
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8" onClick={() => handleEditItem(item)}>
                            <Edit2 className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setEditingItem(null);
                        setFurnitureFormOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Otro Mueble
                    </Button>
                    <Button className="flex-1" onClick={() => setActiveTab('condiciones')}>
                      Continuar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  {/* Design CTA Button */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-primary text-primary hover:bg-primary/5 text-sm"
                      onClick={() => window.open('https://wa.me/525540718923?text=Hola, necesito un diseño para mi mueble', '_blank')}
                    >
                      ✨ ¿Necesitas el diseño? Nosotros te lo hacemos
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'condiciones' && (
          <>
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3 bg-primary/5">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                  Condiciones
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Define los términos de la cotización
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Días entrega</Label>
                    <Input name="deliveryDays" type="number" value={conditions.deliveryDays} onChange={handleConditionChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vigencia</Label>
                    <Input name="validityDays" type="number" value={conditions.validityDays} onChange={handleConditionChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Método de pago</Label>
                  <Select value={conditions.paymentTerms} onValueChange={(value) => handleConditionChange({ target: { name: 'paymentTerms', value } } as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                      <SelectItem value="Mixto">Mixto</SelectItem>
                      <SelectItem value="50% anticipo, 50% contra entrega">50% anticipo, 50% contra entrega</SelectItem>
                      <SelectItem value="100% anticipo">100% anticipo</SelectItem>
                      <SelectItem value="Pago contra entrega">Pago contra entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea 
                    name="observations" 
                    value={conditions.observations} 
                    onChange={handleConditionChange}
                    placeholder="Notas adicionales..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Total Summary */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="py-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Subtotal ({items.length} muebles)</span>
                    <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm opacity-80">
                      <span>Descuento</span>
                      <span>-${discountAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold pt-2 border-t border-primary-foreground/20">
                    <span>Total</span>
                    <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={async () => {
                    await handleSave('enviada');
                    // Auto-send to WhatsApp after saving
                    if (selectedClient?.whatsapp) {
                      const quotation = {
                        id: editingQuotationId || 'temp',
                        folio: 'Nueva',
                        clientId: selectedClient.id,
                        client: selectedClient,
                        items,
                        subtotal,
                        total,
                        discount: discount.amount ? parseFloat(discount.amount) : undefined,
                        discountType: discount.amount ? discount.type : undefined,
                        deliveryDays: parseInt(conditions.deliveryDays) || 15,
                        validityDays: parseInt(conditions.validityDays) || 30,
                        paymentTerms: conditions.paymentTerms,
                        advancePercentage: conditions.advancePercentage ? parseInt(conditions.advancePercentage) : undefined,
                        observations: conditions.observations || undefined,
                        status: 'enviada' as const,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      };
                      shareToClientWhatsApp(quotation, null);
                    }
                  }}>
                    <Send className="w-4 h-4 mr-1" />
                    Enviar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <FurnitureItemForm
        open={furnitureFormOpen}
        onOpenChange={setFurnitureFormOpen}
        onSave={handleAddItem}
        editItem={editingItem}
      />
    </ResponsiveLayout>
    </>
  );
};

export default QuotationsPage;
