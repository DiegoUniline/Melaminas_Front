import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Package } from 'lucide-react';
import { FurnitureItem, FurnitureCategory, FURNITURE_CATEGORIES, COMMON_MATERIALS, COMMON_SHEET_COLORS } from '@/types';
import { toast } from 'sonner';

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editItem ? 'Editar Mueble' : 'Agregar Mueble'}
          </SheetTitle>
          <SheetDescription>
            Completa las especificaciones del mueble
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-4 pb-4">
          {/* Categoría */}
          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                handleSelectChange('category', value);
                handleSelectChange('name', '');
              }}
            >
              <SelectTrigger>
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
          {formData.category === 'otro' ? (
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del mueble *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Mesa de centro"
              />
            </div>
          ) : categoryItems.length > 0 ? (
            <div className="space-y-2">
              <Label>Tipo de mueble *</Label>
              <Select
                value={formData.name}
                onValueChange={(value) => handleSelectChange('name', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {categoryItems.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Otro (personalizado)</SelectItem>
                </SelectContent>
              </Select>
              {formData.name === 'custom' && (
                <Input
                  name="name"
                  value={formData.name === 'custom' ? '' : formData.name}
                  onChange={(e) => handleSelectChange('name', e.target.value)}
                  placeholder="Nombre personalizado"
                  className="mt-2"
                />
              )}
            </div>
          ) : null}

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descripción adicional..."
              rows={2}
            />
          </div>

          {/* Medidas */}
          <div className="space-y-2">
            <Label>Medidas</Label>
            <div className="grid grid-cols-4 gap-2">
              <Input
                name="height"
                type="number"
                inputMode="decimal"
                value={formData.height}
                onChange={handleInputChange}
                placeholder="Alto"
              />
              <Input
                name="width"
                type="number"
                inputMode="decimal"
                value={formData.width}
                onChange={handleInputChange}
                placeholder="Ancho"
              />
              <Input
                name="depth"
                type="number"
                inputMode="decimal"
                value={formData.depth}
                onChange={handleInputChange}
                placeholder="Prof."
              />
              <Select
                value={formData.measureUnit}
                onValueChange={(value) => handleSelectChange('measureUnit', value)}
              >
                <SelectTrigger>
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

          {/* Material */}
          <div className="space-y-2">
            <Label>Material *</Label>
            <Select
              value={formData.material}
              onValueChange={(value) => handleSelectChange('material', value)}
            >
              <SelectTrigger>
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

          {/* Hojas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sheetCount">Cantidad de hojas</Label>
              <Input
                id="sheetCount"
                name="sheetCount"
                type="number"
                inputMode="numeric"
                value={formData.sheetCount}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Color de hojas *</Label>
              <Select
                value={formData.sheetColor}
                onValueChange={(value) => handleSelectChange('sheetColor', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Color" />
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

          {/* Acabado */}
          <div className="space-y-2">
            <Label htmlFor="finish">Acabado</Label>
            <Input
              id="finish"
              name="finish"
              value={formData.finish}
              onChange={handleInputChange}
              placeholder="Ej: Mate, Brillante, Natural"
            />
          </div>

          {/* Precio y cantidad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Precio unitario *</Label>
              <Input
                id="unitPrice"
                name="unitPrice"
                type="number"
                inputMode="decimal"
                value={formData.unitPrice}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                inputMode="numeric"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>

          {/* Subtotal */}
          <div className="p-3 bg-primary/10 rounded-lg flex items-center justify-between">
            <span className="font-medium">Subtotal:</span>
            <span className="text-lg font-bold text-primary">
              ${calculateSubtotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Botón guardar */}
          <Button className="w-full" size="lg" onClick={handleSave}>
            {editItem ? 'Actualizar Mueble' : 'Agregar Mueble'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
