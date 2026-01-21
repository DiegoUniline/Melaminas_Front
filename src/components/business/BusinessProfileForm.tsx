import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Upload, Phone, Mail, MapPin, Facebook, Instagram, Palette, Save, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BusinessProfile } from '@/types';

// Sample quotation for preview
const sampleQuotation = {
  folio: 'COT-2026-001',
  clientName: 'Juan Pérez García',
  clientPhone: '555-123-4567',
  clientAddress: 'Av. Reforma #456, Col. Centro',
  items: [
    { name: 'Closet corredizo', material: 'Melamina', color: 'Blanco', finish: 'Mate', qty: 1, price: 15000 },
    { name: 'Gabinete de cocina', material: 'MDF', color: 'Nogal', finish: 'Brillante', qty: 3, price: 4500 },
  ],
  subtotal: 28500,
  total: 28500,
  date: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
};

export const BusinessProfileForm: React.FC = () => {
  const { businessProfile, updateBusinessProfile, isLoading: contextLoading } = useData();
  const [formData, setFormData] = useState<BusinessProfile | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when businessProfile loads
  useEffect(() => {
    if (businessProfile) {
      setFormData(businessProfile);
      setLogoPreview(businessProfile.logo);
    }
  }, [businessProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no debe superar 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setFormData(prev => prev ? { ...prev, logo: base64 } : prev);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setIsSaving(true);
    
    try {
      const success = await updateBusinessProfile(formData);
      if (success) {
        toast.success('Perfil actualizado correctamente');
      } else {
        toast.error('Error al guardar el perfil');
      }
    } catch (error) {
      toast.error('Error al guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  // Parse HSL to get style for preview
  const hslToStyle = (hsl: string): string => {
    if (!hsl) return '#8B4513';
    if (hsl.startsWith('#') || hsl.startsWith('hsl')) return hsl;
    return `hsl(${hsl})`;
  };

  // Convert HSL string to HEX for color picker
  const hslToHex = (hsl: string): string => {
    if (!hsl) return '#8B4513';
    if (hsl.startsWith('#')) return hsl;
    
    // Parse HSL values (format: "340 30% 45%" or "hsl(340, 30%, 45%)")
    const hslClean = hsl.replace(/hsl\(|\)|,|%/g, ' ').trim();
    const parts = hslClean.split(/\s+/).map(p => parseFloat(p));
    if (parts.length < 3) return '#8B4513';
    
    let [h, s, l] = parts;
    s = s / 100;
    l = l / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convert HEX to HSL string for saving
  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '25 50% 35%';

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', hexValue: string) => {
    const hslValue = hexToHsl(hexValue);
    setFormData(prev => prev ? { ...prev, [field]: hslValue } : prev);
  };

  if (contextLoading || !formData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const primaryColorStyle = hslToStyle(formData.primaryColor);
  const secondaryColorStyle = hslToStyle(formData.secondaryColor);

  return (
    <div className="space-y-6 max-w-6xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo y datos principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Datos del Negocio
            </CardTitle>
            <CardDescription>
              Esta información aparecerá en el encabezado de todas tus cotizaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <Label 
                  htmlFor="logo" 
                  className="cursor-pointer inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                >
                  <Upload className="w-4 h-4" />
                  Subir logo
                </Label>
                <Input 
                  id="logo" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="sm:col-span-2">
                  <Label htmlFor="businessName">Nombre del Negocio *</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Ej: Carpintería Los Pinos"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ownerName">Nombre del Propietario</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                
                <div>
                  <Label htmlFor="rfc">RFC (opcional)</Label>
                  <Input
                    id="rfc"
                    name="rfc"
                    value={formData.rfc || ''}
                    onChange={handleInputChange}
                    placeholder="Ej: XAXX010101000"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ej: 555-123-4567"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: 5551234567"
                />
              </div>
              
              <div className="sm:col-span-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ej: contacto@minegocio.com"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Dirección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ej: Calle Principal #123, Col. Centro"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ej: Ciudad de México"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Ej: CDMX"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="w-5 h-5" />
              Redes Sociales (opcional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.facebook || ''}
                  onChange={handleInputChange}
                  placeholder="Nombre de usuario o URL"
                />
              </div>
              
              <div>
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram || ''}
                  onChange={handleInputChange}
                  placeholder="@usuario"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colores del negocio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Colores del Negocio
            </CardTitle>
            <CardDescription>
              Estos colores se usarán en el diseño de tus cotizaciones PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="primaryColor">Color Principal</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    id="primaryColorPicker"
                    value={hslToHex(formData.primaryColor)}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-14 h-10 rounded border border-input cursor-pointer bg-transparent"
                  />
                  <div className="flex-1">
                    <div 
                      className="w-full h-10 rounded border border-input"
                      style={{ backgroundColor: primaryColorStyle }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Haz clic para seleccionar un color</p>
              </div>
              
              <div>
                <Label htmlFor="secondaryColor">Color Secundario</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    id="secondaryColorPicker"
                    value={hslToHex(formData.secondaryColor)}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-14 h-10 rounded border border-input cursor-pointer bg-transparent"
                  />
                  <div className="flex-1">
                    <div 
                      className="w-full h-10 rounded border border-input"
                      style={{ backgroundColor: secondaryColorStyle }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Haz clic para seleccionar un color</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón guardar */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Perfil
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Vista previa de cotización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Vista Previa de Cotización
          </CardTitle>
          <CardDescription>
            Así se verán tus cotizaciones en PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg bg-white p-6 shadow-sm max-w-2xl mx-auto" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            {/* Header */}
            <div className="text-center border-b pb-4 mb-4" style={{ borderColor: primaryColorStyle }}>
              <div className="flex items-center justify-center gap-3 mb-2">
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain" />
                )}
                <h1 className="text-2xl font-bold" style={{ color: primaryColorStyle }}>
                  {formData.businessName || 'Tu Negocio'}
                </h1>
              </div>
              <p className="text-sm text-gray-600">
                {formData.address}, {formData.city}
              </p>
              <p className="text-sm text-gray-600">
                Tel: {formData.phone} | Email: {formData.email}
              </p>
            </div>

            {/* Quotation Title */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: primaryColorStyle }}>COTIZACIÓN</h2>
              <span className="text-gray-700 font-medium">{sampleQuotation.folio}</span>
            </div>

            {/* Date */}
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>Fecha: {sampleQuotation.date}</span>
              <span>Válida hasta: 30 días</span>
            </div>

            {/* Client */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-semibold">CLIENTE: <span className="font-normal">{sampleQuotation.clientName}</span></p>
              <p className="text-sm text-gray-600">Tel: {sampleQuotation.clientPhone} | {sampleQuotation.clientAddress}</p>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm mb-4">
              <thead>
                <tr style={{ backgroundColor: primaryColorStyle }} className="text-white">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Mueble</th>
                  <th className="p-2 text-left">Material/Color</th>
                  <th className="p-2 text-center">Cant.</th>
                  <th className="p-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sampleQuotation.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2">
                      <span className="block">{item.material}</span>
                      <span className="text-gray-500">{item.color} - {item.finish}</span>
                    </td>
                    <td className="p-2 text-center">{item.qty}</td>
                    <td className="p-2 text-right">${(item.price * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-end border-t pt-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Subtotal: ${sampleQuotation.subtotal.toLocaleString()}</p>
                <p className="text-lg font-bold" style={{ color: primaryColorStyle }}>
                  TOTAL: ${sampleQuotation.total.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
              <p>Gracias por su preferencia</p>
              <p>{formData.businessName} - {formData.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
