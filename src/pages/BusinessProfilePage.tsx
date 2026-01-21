import React from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';

const BusinessProfilePage: React.FC = () => {
  return (
    <MobileLayout title="Mi Negocio">
      <BusinessProfileForm />
    </MobileLayout>
  );
};

export default BusinessProfilePage;
