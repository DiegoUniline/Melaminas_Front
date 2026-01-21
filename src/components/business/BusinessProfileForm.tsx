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

  // Parse HSL to get RGB for preview
  const hslToStyle = (hsl: string): string => {
    if (!hsl) return '#8B4513';
    // If already has hsl() wrapper or is a hex, return as-is
    if (hsl.startsWith('#') || hsl.startsWith('hsl')) return hsl;
    return `hsl(${hsl})`;
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
                <div className="flex gap-3 mt-2">
                  <div 
                    className="w-12 h-10 rounded border border-input"
                    style={{ backgroundColor: primaryColorStyle }}
                  />
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                    placeholder="340 30% 45%"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Formato HSL (Ej: 340 30% 45%)</p>
              </div>
              
              <div>
                <Label htmlFor="secondaryColor">Color Secundario</Label>
                <div className="flex gap-3 mt-2">
                  <div 
                    className="w-12 h-10 rounded border border-input"
                    style={{ backgroundColor: secondaryColorStyle }}
                  />
                  <Input
                    id="secondaryColor"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                    placeholder="40 60% 50%"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Formato HSL (Ej: 40 60% 50%)</p>
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
