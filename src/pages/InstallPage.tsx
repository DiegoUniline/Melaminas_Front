import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare, 
  MoreVertical,
  Check,
  ArrowLeft,
  MonitorSmartphone
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useNavigate } from 'react-router-dom';

const InstallPage = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const navigate = useNavigate();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    await install();
    setInstalling(false);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡App Instalada!</CardTitle>
            <CardDescription>
              El Melaminas ya está instalado en tu dispositivo. Puedes acceder desde tu pantalla de inicio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MonitorSmartphone className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Instalar El Melaminas</h1>
          <p className="text-primary-foreground/80">
            Accede más rápido y usa la app sin conexión
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 -mt-6">
        {/* Quick Install Button (if available) */}
        {isInstallable && (
          <Card className="mb-6 border-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Instalación rápida disponible</h3>
                  <p className="text-sm text-muted-foreground">
                    Tu navegador soporta instalación directa
                  </p>
                </div>
                <Button onClick={handleInstall} disabled={installing}>
                  {installing ? 'Instalando...' : 'Instalar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">¿Por qué instalar?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Acceso desde tu pantalla de inicio</p>
                <p className="text-sm text-muted-foreground">
                  Abre la app como cualquier otra aplicación nativa
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Funciona sin conexión</p>
                <p className="text-sm text-muted-foreground">
                  Consulta cotizaciones guardadas incluso sin internet
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MonitorSmartphone className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Experiencia de pantalla completa</p>
                <p className="text-sm text-muted-foreground">
                  Sin barras del navegador, más espacio para trabajar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instrucciones de instalación</CardTitle>
            <CardDescription>
              Selecciona tu dispositivo para ver los pasos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="android" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="android">Android</TabsTrigger>
                <TabsTrigger value="ios">iPhone/iPad</TabsTrigger>
                <TabsTrigger value="desktop">Escritorio</TabsTrigger>
              </TabsList>

              <TabsContent value="android" className="mt-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Abre el menú del navegador</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Toca el icono <MoreVertical className="w-4 h-4 inline" /> en la esquina superior derecha
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Selecciona "Instalar app" o "Agregar a pantalla de inicio"</p>
                    <p className="text-sm text-muted-foreground">
                      La opción puede variar según tu navegador
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Confirma la instalación</p>
                    <p className="text-sm text-muted-foreground">
                      Toca "Instalar" en el diálogo que aparece
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ios" className="mt-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Abre en Safari</p>
                    <p className="text-sm text-muted-foreground">
                      Esta función solo está disponible en Safari
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Toca el botón Compartir</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Busca el icono <Share className="w-4 h-4 inline" /> en la barra inferior
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Selecciona "Agregar a pantalla de inicio"</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Busca la opción con el icono <PlusSquare className="w-4 h-4 inline" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Toca "Agregar"</p>
                    <p className="text-sm text-muted-foreground">
                      Confirma el nombre y listo
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="desktop" className="mt-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Busca el icono de instalación</p>
                    <p className="text-sm text-muted-foreground">
                      En Chrome/Edge, aparece un icono <Download className="w-4 h-4 inline" /> en la barra de direcciones
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Haz clic en "Instalar"</p>
                    <p className="text-sm text-muted-foreground">
                      También puedes usar el menú ⋮ → "Instalar El Melaminas"
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">La app se abrirá en su propia ventana</p>
                    <p className="text-sm text-muted-foreground">
                      También aparecerá un acceso directo en tu escritorio
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Back button */}
        <div className="mt-6">
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallPage;
