import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Ruler, 
  Layers,
  DollarSign,
  FileText,
  ImageIcon
} from 'lucide-react';
import { FurnitureItem } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCatalogs } from '@/contexts/CatalogContext';

interface FurnitureItemDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FurnitureItem | null;
}

export const FurnitureItemDetailModal: React.FC<FurnitureItemDetailModalProps> = ({
  open,
  onOpenChange,
  item,
}) => {
  const isMobile = useIsMobile();
  const { getMaterialName, getColorName, getFinishName, getCategoryName } = useCatalogs();

  if (!item) return null;

  // Calculate total sheets
  const totalSheets = item.sheets?.reduce((sum, s) => sum + (s.quantity || 0), 0) || item.sheetCount || 0;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  const content = (
    <div className="space-y-6">
      {/* Image */}
      {item.imageUrl ? (
        <div className="w-full aspect-video relative rounded-lg overflow-hidden bg-muted">
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center">
          <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
        </div>
      )}

      {/* General Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Package className="w-5 h-5" />
          <h3 className="font-semibold">Información General</h3>
        </div>
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre</span>
              <span className="font-medium">{item.name}</span>
            </div>
            {item.categoryId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría</span>
                <span>{getCategoryName(item.categoryId)}</span>
              </div>
            )}
            {item.description && (
              <div className="pt-2 border-t">
                <span className="text-muted-foreground text-sm">Descripción:</span>
                <p className="mt-1">{item.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dimensions */}
      {(item.height || item.width || item.depth) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Ruler className="w-5 h-5" />
            <h3 className="font-semibold">Dimensiones</h3>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                {item.height && (
                  <div>
                    <p className="text-2xl font-bold text-primary">{item.height}</p>
                    <p className="text-xs text-muted-foreground">Alto ({item.measureUnit})</p>
                  </div>
                )}
                {item.width && (
                  <div>
                    <p className="text-2xl font-bold text-primary">{item.width}</p>
                    <p className="text-xs text-muted-foreground">Ancho ({item.measureUnit})</p>
                  </div>
                )}
                {item.depth && (
                  <div>
                    <p className="text-2xl font-bold text-primary">{item.depth}</p>
                    <p className="text-xs text-muted-foreground">Profundo ({item.measureUnit})</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sheets / Materials - NEW DETAILED VIEW */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Layers className="w-5 h-5" />
          <h3 className="font-semibold">Hojas y Materiales</h3>
          <Badge variant="secondary" className="ml-auto">
            {totalSheets} {totalSheets === 1 ? 'hoja' : 'hojas'} total
          </Badge>
        </div>
        <Card>
          <CardContent className="p-4 space-y-3">
            {item.sheets && item.sheets.length > 0 ? (
              item.sheets.map((sheet, index) => {
                const materialName = sheet._materialName || getMaterialName(sheet.materialId);
                const colorName = sheet._colorName || getColorName(sheet.colorId);
                const finishName = sheet._finishName || (sheet.finishId ? getFinishName(sheet.finishId) : null);
                
                return (
                  <div key={sheet.id || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-bold">
                          {sheet.quantity}x
                        </Badge>
                        <span className="font-medium">{materialName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>Color: {colorName}</span>
                        {finishName && (
                          <>
                            <span>•</span>
                            <span>Acabado: {finishName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Legacy single material display
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-bold">
                      {item.sheetCount || 1}x
                    </Badge>
                    <span className="font-medium">
                      {item._materialName || getMaterialName(item.material || '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>Color: {item._colorName || getColorName(item.sheetColor || '')}</span>
                    {(item._finishName || item.finish) && (
                      <>
                        <span>•</span>
                        <span>Acabado: {item._finishName || getFinishName(item.finish || '')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <DollarSign className="w-5 h-5" />
          <h3 className="font-semibold">Precio</h3>
        </div>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{formatCurrency(item.unitPrice)}</p>
                <p className="text-xs text-muted-foreground">Precio unitario</p>
              </div>
              <div>
                <p className="text-lg font-bold">{item.quantity}</p>
                <p className="text-xs text-muted-foreground">Cantidad</p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{formatCurrency(item.subtotal)}</p>
                <p className="text-xs text-muted-foreground">Subtotal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {item.notes && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Notas</h3>
          </div>
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground">{item.notes}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="pb-4 border-b mb-4">
            <SheetTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Detalles del Mueble
            </SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Detalles del Mueble
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
