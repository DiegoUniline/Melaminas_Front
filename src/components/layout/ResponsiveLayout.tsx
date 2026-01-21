import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  title 
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout title={title}>
        {children}
      </MobileLayout>
    );
  }

  return (
    <DesktopLayout title={title}>
      {children}
    </DesktopLayout>
  );
};
