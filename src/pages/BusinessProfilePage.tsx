import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';

const BusinessProfilePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil del Negocio</h1>
          <p className="text-muted-foreground mt-1">
            Configura los datos de tu negocio que aparecerán en las cotizaciones
          </p>
        </div>
        
        <BusinessProfileForm />
      </div>
    </MainLayout>
  );
};

export default BusinessProfilePage;
