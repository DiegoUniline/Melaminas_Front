import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Package, 
  Ruler, 
  Palette, 
  DollarSign, 
  FileText,
  X,
  Check,
  Camera,
  ImageIcon,
  Trash2
} from 'lucide-react';
import { FurnitureItem, FurnitureCategory, SheetCombination } from '@/types';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useCatalogs } from '@/contexts/CatalogContext';
import { SheetCombinationList } from './SheetCombinationList';

interface FurnitureItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: FurnitureItem) => void;
  editItem?: FurnitureItem | null;
}

interface FormData {
  categoryId: string;
  name: string;
  description: string;
  height: string;
  width: string;
  depth: string;
  measureUnit: 'cm' | 'm' | 'pulgadas';
  sheets: SheetCombination[];
  unitPrice: string;
  quantity: string;
  notes: string;
  imageUrl: string;
}

const createDefaultSheet = (): SheetCombination => ({
  id: `sheet-${Date.now()}`,
  materialId: '',
  colorId: '',
  quantity: 1,
});

const initialFormState: FormData = {
  categoryId: '',
  name: '',
  description: '',
  height: '',
  width: '',
  depth: '',
  measureUnit: 'cm',
  sheets: [createDefaultSheet()],
  unitPrice: '',
  quantity: '1',
  notes: '',
  imageUrl: '',
};

// Form content component - defined outside to prevent re-creation
interface FormContentProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: keyof FormData, value: string) => void;
  onSheetsChange: (sheets: SheetCombination[]) => void;
  onImageChange: (imageUrl: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit: boolean;
  categories: { id: string; nombre: string }[];
  products: { id: string; nombre: string }[];
  materials: { id: string; nombre: string }[];
  getColorsByMaterial: (materialId?: string) => { id: string; nombre: string }[];
  finishes: { id: string; nombre: string }[];
}

const FormContentComponent = memo<FormContentProps>(({
  formData,
  onInputChange,
  onSelectChange,
  onSheetsChange,
  onImageChange,
  onSave,
  onCancel,
  isEdit,
  categories,
  products,
  materials,
  getColorsByMaterial,
  finishes,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const calculateSubtotal = () => {
    const price = parseFloat(formData.unitPrice) || 0;
    const qty = parseInt(formData.quantity) || 1;
    return price * qty;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
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
              value={formData.categoryId}
              onValueChange={(value) => {
                onSelectChange('categoryId', value);
                onSelectChange('name', '');
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nombre}
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
            {products.length > 0 ? (
              <Select
                value={formData.name}
                onValueChange={(value) => onSelectChange('name', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {products.map((prod) => (
                    <SelectItem key={prod.id} value={prod.nombre}>
                      {prod.nombre}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">✏️ Otro (personalizado)</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                name="name"
                value={formData.name}
                onChange={onInputChange}
                placeholder="Ej: Mesa de centro"
                className="h-11"
              />
            )}
            {formData.name === 'custom' && (
              <Input
                name="name"
                value=""
                onChange={(e) => onSelectChange('name', e.target.value)}
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
            onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
              placeholder="0"
              className="h-11 text-center"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Unidad</Label>
            <Select
              value={formData.measureUnit}
              onValueChange={(value) => onSelectChange('measureUnit', value as 'cm' | 'm' | 'pulgadas')}
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

      {/* Section 3: Hojas / Materiales (NUEVO: Lista dinámica) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Palette className="w-5 h-5" />
          <h3 className="font-semibold text-base">Hojas y Materiales</h3>
        </div>
        
        <SheetCombinationList
          sheets={formData.sheets}
          onChange={onSheetsChange}
          materials={materials}
          getColorsByMaterial={getColorsByMaterial}
          finishes={finishes}
        />
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
                onChange={onInputChange}
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
              onChange={onInputChange}
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

      {/* Section 5: Foto del Mueble */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Camera className="w-5 h-5" />
          <h3 className="font-semibold text-base">Foto del Mueble</h3>
        </div>
        
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
          className="hidden"
        />
        
        {formData.imageUrl ? (
          <div className="relative">
            <img 
              src={formData.imageUrl} 
              alt="Vista previa del mueble"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-32 border-dashed flex flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
            <span className="text-muted-foreground">Subir foto del mueble</span>
          </Button>
        )}
      </div>

      <Separator />

      {/* Section 6: Notas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="w-5 h-5" />
          <h3 className="font-semibold text-base">Notas Adicionales</h3>
        </div>
        
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={onInputChange}
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
          onClick={onCancel}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button 
          className="flex-1 h-12" 
          onClick={onSave}
        >
          <Check className="w-4 h-4 mr-2" />
          {isEdit ? 'Actualizar' : 'Agregar Mueble'}
        </Button>
      </div>
    </div>
  );
});

export const FurnitureItemForm: React.FC<FurnitureItemFormProps> = ({
  open,
  onOpenChange,
  onSave,
  editItem,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const isMobile = useIsMobile();
  const { 
    getActiveCategories, 
    getActiveMaterials, 
    getActiveColors, 
    getActiveFinishes,
    getProductsByCategory,
    getMaterialName,
    getColorName,
    getFinishName,
    catalogs
  } = useCatalogs();

  // Get catalog lists
  const categories = useMemo(() => getActiveCategories(), [catalogs]);
  const materials = useMemo(() => getActiveMaterials(), [catalogs]);
  const finishes = useMemo(() => getActiveFinishes(), [catalogs]);
  
  // Products filtered by selected category
  const products = useMemo(() => {
    if (!formData.categoryId) return [];
    return getProductsByCategory(formData.categoryId);
  }, [formData.categoryId, catalogs]);

  // Find ID by name helper (for mapping names back to IDs)
  const findIdByName = (list: { id: string; nombre: string }[], name: string): string => {
    const item = list.find(i => i.nombre === name);
    return item?.id || '';
  };

  // Check if a value is a valid ID in the list
  const isValidId = (list: { id: string; nombre: string }[], value: string): boolean => {
    return list.some(i => i.id === value);
  };

  useEffect(() => {
    if (editItem && open) {
      const categoryId = editItem.categoryId 
        ? editItem.categoryId 
        : (editItem.category === 'otro' ? '7' : findIdByName(categories, editItem.category) || '');
      
      // Convert editItem.sheets to form sheets, or create from legacy fields
      let formSheets: SheetCombination[] = [];
      
      if (editItem.sheets && editItem.sheets.length > 0) {
        // Use existing sheets, ensuring IDs are valid
        formSheets = editItem.sheets.map(sheet => {
          const allColors = getActiveColors();
          return {
            ...sheet,
            materialId: isValidId(materials, sheet.materialId) 
              ? sheet.materialId 
              : findIdByName(materials, sheet.materialId),
            colorId: isValidId(allColors, sheet.colorId) 
              ? sheet.colorId 
              : findIdByName(allColors, sheet.colorId),
            finishId: sheet.finishId 
              ? (isValidId(finishes, sheet.finishId) ? sheet.finishId : findIdByName(finishes, sheet.finishId))
              : undefined,
          };
        });
      } else if (editItem.material) {
        // Convert legacy single material to sheets array
        const allColors = getActiveColors();
        const materialId = isValidId(materials, editItem.material) 
          ? editItem.material 
          : findIdByName(materials, editItem.material);
        const colorId = editItem.sheetColor 
          ? (isValidId(allColors, editItem.sheetColor) ? editItem.sheetColor : findIdByName(allColors, editItem.sheetColor))
          : '';
        const finishId = editItem.finish 
          ? (isValidId(finishes, editItem.finish) ? editItem.finish : findIdByName(finishes, editItem.finish))
          : undefined;
        
        formSheets = [{
          id: `sheet-${editItem.id}`,
          materialId,
          colorId,
          finishId,
          quantity: editItem.sheetCount || 1,
        }];
      }
      
      if (formSheets.length === 0) {
        formSheets = [createDefaultSheet()];
      }
      
      setFormData({
        categoryId,
        name: editItem.name,
        description: editItem.description || '',
        height: editItem.height?.toString() || '',
        width: editItem.width?.toString() || '',
        depth: editItem.depth?.toString() || '',
        measureUnit: editItem.measureUnit,
        sheets: formSheets,
        unitPrice: editItem.unitPrice.toString(),
        quantity: editItem.quantity.toString(),
        notes: editItem.notes || '',
        imageUrl: editItem.imageUrl || '',
      });
    } else if (!open) {
      setFormData(initialFormState);
    }
  }, [editItem, open, materials, finishes, categories]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSheetsChange = useCallback((sheets: SheetCombination[]) => {
    setFormData(prev => ({ ...prev, sheets }));
  }, []);

  const calculateSubtotal = useCallback(() => {
    const price = parseFloat(formData.unitPrice) || 0;
    const qty = parseInt(formData.quantity) || 1;
    return price * qty;
  }, [formData.unitPrice, formData.quantity]);

  const handleSave = useCallback(() => {
    if (!formData.categoryId) {
      toast.error('Selecciona una categoría');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('El nombre del mueble es obligatorio');
      return;
    }
    
    // Validate at least one complete sheet
    const validSheets = formData.sheets.filter(s => s.materialId && s.colorId);
    if (validSheets.length === 0) {
      toast.error('Agrega al menos una hoja con material y color');
      return;
    }
    
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      toast.error('Ingresa un precio válido');
      return;
    }

    // Enrich sheets with display names
    const enrichedSheets: SheetCombination[] = validSheets.map(sheet => ({
      ...sheet,
      _materialName: getMaterialName(sheet.materialId),
      _colorName: getColorName(sheet.colorId),
      _finishName: sheet.finishId ? getFinishName(sheet.finishId) : undefined,
    }));

    // Find product ID by name
    const findProductIdByName = (name: string): string | undefined => {
      const product = products.find(p => p.nombre === name);
      return product?.id;
    };

    const item: FurnitureItem = {
      id: editItem?.id || Date.now().toString(),
      category: 'otro' as FurnitureCategory,
      categoryId: formData.categoryId,
      productId: findProductIdByName(formData.name),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      width: formData.width ? parseFloat(formData.width) : undefined,
      depth: formData.depth ? parseFloat(formData.depth) : undefined,
      measureUnit: formData.measureUnit,
      sheets: enrichedSheets,
      // Legacy fields for backward compatibility (use first sheet)
      material: enrichedSheets[0]?.materialId,
      sheetCount: enrichedSheets.reduce((sum, s) => sum + s.quantity, 0),
      sheetColor: enrichedSheets[0]?.colorId,
      finish: enrichedSheets[0]?.finishId,
      unitPrice: parseFloat(formData.unitPrice),
      quantity: parseInt(formData.quantity) || 1,
      subtotal: calculateSubtotal(),
      notes: formData.notes.trim() || undefined,
      imageUrl: formData.imageUrl || undefined,
      // Legacy display names
      _materialName: enrichedSheets[0]?._materialName,
      _colorName: enrichedSheets[0]?._colorName,
      _finishName: enrichedSheets[0]?._finishName,
    };

    onSave(item);
    onOpenChange(false);
    setFormData(initialFormState);
    toast.success(editItem ? 'Mueble actualizado' : 'Mueble agregado');
  }, [formData, editItem, onSave, onOpenChange, getMaterialName, getColorName, getFinishName, calculateSubtotal, products]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleImageChange = useCallback((imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  }, []);

  // Memoized function to get colors by material
  const getColorsByMaterial = useCallback((materialId?: string) => {
    return getActiveColors(materialId);
  }, [getActiveColors]);

  const formContentProps = useMemo<FormContentProps>(() => ({
    formData,
    onInputChange: handleInputChange,
    onSelectChange: handleSelectChange,
    onSheetsChange: handleSheetsChange,
    onImageChange: handleImageChange,
    onSave: handleSave,
    onCancel: handleCancel,
    isEdit: !!editItem,
    categories,
    products,
    materials,
    getColorsByMaterial,
    finishes,
  }), [formData, handleInputChange, handleSelectChange, handleSheetsChange, handleImageChange, handleSave, handleCancel, editItem, categories, products, materials, getColorsByMaterial, finishes]);

  // Mobile: Use Sheet from bottom
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] overflow-y-auto px-4 pb-8">
          <SheetHeader className="flex flex-row items-center gap-3 py-4 border-b mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <SheetTitle className="font-semibold text-lg">
                {editItem ? 'Editar Mueble' : 'Nuevo Mueble'}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Completa las especificaciones
              </SheetDescription>
            </div>
          </SheetHeader>
          <FormContentComponent {...formContentProps} />
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
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Completa las especificaciones del mueble
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <FormContentComponent {...formContentProps} />
      </DialogContent>
    </Dialog>
  );
};
