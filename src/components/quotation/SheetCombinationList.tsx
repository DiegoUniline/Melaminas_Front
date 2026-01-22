import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Layers } from 'lucide-react';
import { SheetCombination } from '@/types';

interface SheetCombinationListProps {
  sheets: SheetCombination[];
  onChange: (sheets: SheetCombination[]) => void;
  materials: { id: string; nombre: string }[];
  getColorsByMaterial: (materialId?: string) => { id: string; nombre: string }[];
  finishes: { id: string; nombre: string }[];
}

const SheetCombinationItem = memo<{
  sheet: SheetCombination;
  index: number;
  onUpdate: (id: string, updates: Partial<SheetCombination>) => void;
  onRemove: (id: string) => void;
  materials: { id: string; nombre: string }[];
  colors: { id: string; nombre: string }[];
  finishes: { id: string; nombre: string }[];
  canRemove: boolean;
}>(({ sheet, index, onUpdate, onRemove, materials, colors, finishes, canRemove }) => {
  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Hoja {index + 1}
          </span>
          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(sheet.id)}
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Material */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Material</Label>
            <Select
              value={sheet.materialId}
              onValueChange={(value) => onUpdate(sheet.id, { 
                materialId: value, 
                colorId: '' // Reset color when material changes
              })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Material" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {materials.map((mat) => (
                  <SelectItem key={mat.id} value={mat.id}>
                    {mat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Color</Label>
            <Select
              value={sheet.colorId}
              onValueChange={(value) => onUpdate(sheet.id, { colorId: value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {colors.map((color) => (
                  <SelectItem key={color.id} value={color.id}>
                    {color.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cantidad */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Cantidad</Label>
            <Input
              type="number"
              inputMode="numeric"
              min="1"
              value={sheet.quantity}
              onChange={(e) => onUpdate(sheet.id, { 
                quantity: Math.max(1, parseInt(e.target.value) || 1) 
              })}
              className="h-10"
            />
          </div>
        </div>

        {/* Acabado opcional */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Acabado (opcional)</Label>
          <Select
            value={sheet.finishId || ''}
            onValueChange={(value) => onUpdate(sheet.id, { finishId: value || undefined })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Sin acabado" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="">Sin acabado</SelectItem>
              {finishes.map((finish) => (
                <SelectItem key={finish.id} value={finish.id}>
                  {finish.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
});

SheetCombinationItem.displayName = 'SheetCombinationItem';

export const SheetCombinationList: React.FC<SheetCombinationListProps> = memo(({
  sheets,
  onChange,
  materials,
  getColorsByMaterial,
  finishes,
}) => {
  const handleAddSheet = useCallback(() => {
    const newSheet: SheetCombination = {
      id: `sheet-${Date.now()}`,
      materialId: '',
      colorId: '',
      quantity: 1,
    };
    onChange([...sheets, newSheet]);
  }, [sheets, onChange]);

  const handleUpdateSheet = useCallback((id: string, updates: Partial<SheetCombination>) => {
    onChange(sheets.map(sheet => 
      sheet.id === id ? { ...sheet, ...updates } : sheet
    ));
  }, [sheets, onChange]);

  const handleRemoveSheet = useCallback((id: string) => {
    onChange(sheets.filter(sheet => sheet.id !== id));
  }, [sheets, onChange]);

  // Calculate total sheets
  const totalSheets = sheets.reduce((sum, s) => sum + (s.quantity || 0), 0);

  return (
    <div className="space-y-4">
      {/* Sheet list */}
      <div className="space-y-3">
        {sheets.map((sheet, index) => (
          <SheetCombinationItem
            key={sheet.id}
            sheet={sheet}
            index={index}
            onUpdate={handleUpdateSheet}
            onRemove={handleRemoveSheet}
            materials={materials}
            colors={getColorsByMaterial(sheet.materialId || undefined)}
            finishes={finishes}
            canRemove={sheets.length > 1}
          />
        ))}
      </div>

      {/* Add button */}
      <Button
        variant="outline"
        className="w-full h-10 border-dashed"
        onClick={handleAddSheet}
        type="button"
      >
        <Plus className="w-4 h-4 mr-2" />
        Agregar otra hoja
      </Button>

      {/* Summary */}
      {sheets.length > 0 && totalSheets > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-primary" />
              <span className="font-medium">
                Total: {totalSheets} {totalSheets === 1 ? 'hoja' : 'hojas'}
              </span>
            </div>
            {sheets.length > 1 && (
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                {sheets.filter(s => s.materialId && s.colorId).map((s, i) => {
                  const mat = materials.find(m => m.id === s.materialId);
                  const col = getColorsByMaterial(s.materialId).find(c => c.id === s.colorId);
                  if (!mat || !col) return null;
                  return (
                    <div key={s.id}>
                      • {s.quantity}x {mat.nombre} {col.nombre}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
});

SheetCombinationList.displayName = 'SheetCombinationList';
