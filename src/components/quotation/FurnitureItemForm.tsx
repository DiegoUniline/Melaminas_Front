import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Package, 
  Ruler, 
  Palette, 
  DollarSign, 
  FileText,
  X,
  Check,
  Layers
} from 'lucide-react';
import { FurnitureItem, FurnitureCategory, FURNITURE_CATEGORIES, COMMON_MATERIALS, COMMON_SHEET_COLORS } from '@/types';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface FurnitureItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: FurnitureItem) => void;
  editItem?: FurnitureItem | null;
}

const initialFormState = {
  category: '' as FurnitureCategory | '',
  customCategory: '',
  name: '',
  description: '',
  height: '',
  width: '',
  depth: '',
  measureUnit: 'cm' as 'cm' | 'm' | 'pulgadas',
  material: '',
  sheetCount: '1',
  sheetColor: '',
  finish: '',
  unitPrice: '',
  quantity: '1',
  notes: '',
};

export const FurnitureItemForm: React.FC<FurnitureItemFormProps> = ({
  open,
  onOpenChange,
  onSave,
  editItem,
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (editItem) {
      setFormData({
        category: editItem.category,
        customCategory: editItem.customCategory || '',
        name: editItem.name,
        description: editItem.description || '',
        height: editItem.height?.toString() || '',
        width: editItem.width?.toString() || '',
        depth: editItem.depth?.toString() || '',
        measureUnit: editItem.measureUnit,
        material: editItem.material,
        sheetCount: editItem.sheetCount.toString(),
        sheetColor: editItem.sheetColor,
        finish: editItem.finish || '',
        unitPrice: editItem.unitPrice.toString(),
        quantity: editItem.quantity.toString(),
        notes: editItem.notes || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editItem, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateSubtotal = () => {
    const price = parseFloat(formData.unitPrice) || 0;
    const qty = parseInt(formData.quantity) || 1;
    return price * qty;
  };

  const handleSave = () => {
    if (!formData.category) {
      toast.error('Selecciona una categoría');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('El nombre del mueble es obligatorio');
      return;
    }
    if (!formData.material) {
      toast.error('Selecciona un material');
      return;
    }
    if (!formData.sheetColor) {
      toast.error('Selecciona el color de las hojas');
      return;
    }
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      toast.error('Ingresa un precio válido');
      return;
    }

    const item: FurnitureItem = {
      id: editItem?.id || Date.now().toString(),
      category: formData.category as FurnitureCategory,
      customCategory: formData.category === 'otro' ? formData.customCategory : undefined,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      width: formData.width ? parseFloat(formData.width) : undefined,
      depth: formData.depth ? parseFloat(formData.depth) : undefined,
      measureUnit: formData.measureUnit,
      material: formData.material,
      sheetCount: parseInt(formData.sheetCount) || 1,
      sheetColor: formData.sheetColor,
      finish: formData.finish.trim() || undefined,
      unitPrice: parseFloat(formData.unitPrice),
      quantity: parseInt(formData.quantity) || 1,
      subtotal: calculateSubtotal(),
      notes: formData.notes.trim() || undefined,
    };

    onSave(item);
    onOpenChange(false);
    setFormData(initialFormState);
    toast.success(editItem ? 'Mueble actualizado' : 'Mueble agregado');
  };

  const categoryItems = formData.category && formData.category !== 'otro' 
    ? FURNITURE_CATEGORIES[formData.category as FurnitureCategory]?.items || []
    : [];

  const FormContent = () => (
    <div className="space-y-6">
      {/* Section 1: Información General */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Package className="w-5 h-5" />
          <h3 className="font-semibold text-base">Información General</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Categoría */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Categoría <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                handleSelectChange('category', value);
                handleSelectChange('name', '');
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {Object.entries(FURNITURE_CATEGORIES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de mueble / Nombre */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Nombre del mueble <span className="text-destructive">*</span>
            </Label>
            {formData.category === 'otro' || categoryItems.length === 0 ? (
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Mesa de centro"
                className="h-11"
              />
            ) : (
              <Select
                value={formData.name}
                onValueChange={(value) => handleSelectChange('name', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {categoryItems.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">✏️ Otro (personalizado)</SelectItem>
                </SelectContent>
              </Select>
            )}
            {formData.name === 'custom' && (
              <Input
                name="name"
                value=""
                onChange={(e) => handleSelectChange('name', e.target.value)}
                placeholder="Nombre personalizado"
                className="h-11 mt-2"
              />
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Descripción</Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe características especiales del mueble..."
            rows={2}
            className="resize-none"
          />
        </div>
      </div>

      <Separator />

      {/* Section 2: Medidas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Ruler className="w-5 h-5" />
          <h3 className="font-semibold text-base">Dimensiones</h3>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Alto</Label>
            <Input
              name="height"
              type="number"
              inputMode="decimal"
              value={formData.height}
              onChange={handleInputChange}
              placeholder="0"
              className="h-11 text-center"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Ancho</Label>
            <Input
              name="width"
              type="number"
              inputMode="decimal"
              value={formData.width}
              onChange={handleInputChange}
              placeholder="0"
              className="h-11 text-center"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Profundo</Label>
            <Input
              name="depth"
              type="number"
              inputMode="decimal"
              value={formData.depth}
              onChange={handleInputChange}
              placeholder="0"
              className="h-11 text-center"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Unidad</Label>
            <Select
              value={formData.measureUnit}
              onValueChange={(value) => handleSelectChange('measureUnit', value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="m">m</SelectItem>
                <SelectItem value="pulgadas">pulg</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section 3: Material y Color */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Palette className="w-5 h-5" />
          <h3 className="font-semibold text-base">Material y Acabado</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Material <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.material}
              onValueChange={(value) => handleSelectChange('material', value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona material" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {COMMON_MATERIALS.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Color <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.sheetColor}
              onValueChange={(value) => handleSelectChange('sheetColor', value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona color" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {COMMON_SHEET_COLORS.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Cantidad de hojas
            </Label>
            <Input
              name="sheetCount"
              type="number"
              inputMode="numeric"
              value={formData.sheetCount}
              onChange={handleInputChange}
              min="1"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Acabado</Label>
            <Input
              name="finish"
              value={formData.finish}
              onChange={handleInputChange}
              placeholder="Mate, Brillante, Natural..."
              className="h-11"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Section 4: Precio */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <DollarSign className="w-5 h-5" />
          <h3 className="font-semibold text-base">Precio</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Precio unitario <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                name="unitPrice"
                type="number"
                inputMode="decimal"
                value={formData.unitPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                className="h-11 pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Cantidad</Label>
            <Input
              name="quantity"
              type="number"
              inputMode="numeric"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              className="h-11"
            />
          </div>
        </div>

        {/* Subtotal Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-xs text-muted-foreground">
                  {formData.quantity || 1} × ${parseFloat(formData.unitPrice || '0').toLocaleString('es-MX')}
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                ${calculateSubtotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Notas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="w-5 h-5" />
          <h3 className="font-semibold text-base">Notas Adicionales</h3>
        </div>
        
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Observaciones, instrucciones especiales, etc."
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1 h-12" 
          onClick={() => onOpenChange(false)}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button 
          className="flex-1 h-12" 
          onClick={handleSave}
        >
          <Check className="w-4 h-4 mr-2" />
          {editItem ? 'Actualizar' : 'Agregar Mueble'}
        </Button>
      </div>
    </div>
  );

  // Mobile: Use Sheet from bottom
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] overflow-y-auto px-4 pb-8">
          <div className="flex items-center gap-3 py-4 border-b mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">
                {editItem ? 'Editar Mueble' : 'Nuevo Mueble'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Completa las especificaciones
              </p>
            </div>
          </div>
          <FormContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {editItem ? 'Editar Mueble' : 'Agregar Nuevo Mueble'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Completa las especificaciones del mueble
              </p>
            </div>
          </div>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
};
