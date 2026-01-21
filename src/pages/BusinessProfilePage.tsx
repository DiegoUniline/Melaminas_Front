import React from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';

const BusinessProfilePage: React.FC = () => {
  return (
    <ResponsiveLayout title="Mi Negocio">
      <BusinessProfileForm />
    </ResponsiveLayout>
  );
};

export default BusinessProfilePage;
