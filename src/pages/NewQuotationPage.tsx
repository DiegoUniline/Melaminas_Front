import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewQuotationPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Cotización</h1>
          <p className="text-muted-foreground mt-1">
            Crea una cotización para tu cliente
          </p>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Construction className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Formulario en desarrollo</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              El formulario completo de cotización con datos del cliente, muebles, hojas, colores y generación de PDF estará disponible pronto.
            </p>
            <Button asChild variant="outline">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewQuotationPage;
