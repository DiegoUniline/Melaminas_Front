import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Upload, Phone, Mail, MapPin, Facebook, Instagram, Palette, Save, Check } from 'lucide-react';
import { toast } from 'sonner';

export const BusinessProfileForm: React.FC = () => {
  const { businessProfile, updateBusinessProfile } = useData();
  const [formData, setFormData] = useState(businessProfile);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(businessProfile.logo);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        setFormData(prev => ({ ...prev, logo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateBusinessProfile(formData);
    setIsSaving(false);
    toast.success('Perfil actualizado correctamente');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
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
                <input
                  type="color"
                  id="primaryColorPicker"
                  className="w-12 h-10 rounded cursor-pointer border border-input"
                  defaultValue="#8B4513"
                />
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  placeholder="25 70% 35%"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Formato HSL (Ej: 25 70% 35%)</p>
            </div>
            
            <div>
              <Label htmlFor="secondaryColor">Color Secundario</Label>
              <div className="flex gap-3 mt-2">
                <input
                  type="color"
                  id="secondaryColorPicker"
                  className="w-12 h-10 rounded cursor-pointer border border-input"
                  defaultValue="#DAA520"
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

          {/* Preview de colores */}
          <div className="mt-6 p-4 rounded-lg border border-border">
            <p className="text-sm font-medium mb-3">Vista previa:</p>
            <div className="flex gap-4">
              <div 
                className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: `hsl(${formData.primaryColor})` }}
              >
                Principal
              </div>
              <div 
                className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: `hsl(${formData.secondaryColor})` }}
              >
                Secundario
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="animate-spin">⏳</span>
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
  );
};
