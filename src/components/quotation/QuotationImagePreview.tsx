import React from 'react';
import { Quotation, BusinessProfile } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuotationImagePreviewProps {
  quotation: Quotation;
  businessProfile: BusinessProfile | null;
}

export const QuotationImagePreview: React.FC<QuotationImagePreviewProps> = ({
  quotation,
  businessProfile,
}) => {
  const createdDate = format(new Date(quotation.createdAt), "d 'de' MMMM, yyyy", { locale: es });
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  const discountAmount = quotation.discount
    ? quotation.discountType === 'percentage'
      ? quotation.subtotal * (quotation.discount / 100)
      : quotation.discount
    : 0;

  return (
    <div
      style={{
        width: '400px',
        padding: '24px',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#1a1a1a',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #e5e5e5', paddingBottom: '16px' }}>
        {businessProfile?.logo && (
          <img 
            src={businessProfile.logo} 
            alt="Logo" 
            style={{ height: '48px', marginBottom: '8px', objectFit: 'contain' }}
          />
        )}
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', color: businessProfile?.primaryColor || '#8B4513' }}>
          {businessProfile?.businessName || 'El Melaminas'}
        </h1>
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
          {businessProfile?.phone && `📞 ${businessProfile.phone}`}
          {businessProfile?.email && ` • ✉️ ${businessProfile.email}`}
        </p>
      </div>

      {/* Quotation Info */}
      <div style={{ 
        backgroundColor: '#f8f8f8', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#333' }}>
            📋 {quotation.folio}
          </p>
          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
            {createdDate}
          </p>
        </div>
        <div style={{ 
          backgroundColor: quotation.status === 'aceptada' ? '#22c55e' : 
                          quotation.status === 'rechazada' ? '#ef4444' : 
                          quotation.status === 'enviada' ? '#3b82f6' : '#9ca3af',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase'
        }}>
          {quotation.status}
        </div>
      </div>

      {/* Client */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Cliente</p>
        <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
          👤 {quotation.client.name}
        </p>
        {quotation.client.phone && (
          <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0 0' }}>
            📱 {quotation.client.phone}
          </p>
        )}
      </div>

      {/* Items */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0', fontWeight: 600 }}>
          Productos ({quotation.items.length})
        </p>
        <div style={{ borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
          {quotation.items.map((item, index) => (
            <div 
              key={item.id} 
              style={{ 
                padding: '10px 12px',
                backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                borderBottom: index < quotation.items.length - 1 ? '1px solid #e5e5e5' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0 0' }}>
                    {item.material} • {item.sheetColor}
                    {item.height && item.width && ` • ${item.height}x${item.width}${item.depth ? `x${item.depth}` : ''} ${item.measureUnit}`}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>
                    {formatCurrency(item.subtotal)}
                  </p>
                  {item.quantity > 1 && (
                    <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0 0' }}>
                      x{item.quantity}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div style={{ 
        backgroundColor: businessProfile?.primaryColor || '#8B4513', 
        color: 'white', 
        padding: '16px', 
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>Subtotal</span>
          <span style={{ fontSize: '12px' }}>{formatCurrency(quotation.subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>
              Descuento {quotation.discountType === 'percentage' ? `(${quotation.discount}%)` : ''}
            </span>
            <span style={{ fontSize: '12px' }}>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          paddingTop: '8px',
          borderTop: '1px solid rgba(255,255,255,0.3)',
          marginTop: '4px'
        }}>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>TOTAL</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(quotation.total)}</span>
        </div>
      </div>

      {/* Conditions */}
      <div style={{ 
        backgroundColor: '#f8f8f8', 
        padding: '12px', 
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Entrega</p>
            <p style={{ fontSize: '13px', fontWeight: 600, margin: '2px 0 0 0' }}>
              ⏱️ {quotation.deliveryDays} días
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Vigencia</p>
            <p style={{ fontSize: '13px', fontWeight: 600, margin: '2px 0 0 0' }}>
              📅 {quotation.validityDays} días
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Método de pago</p>
            <p style={{ fontSize: '13px', fontWeight: 600, margin: '2px 0 0 0' }}>
              💳 {quotation.paymentTerms}
            </p>
          </div>
        </div>
      </div>

      {/* Observations */}
      {quotation.observations && (
        <div style={{ 
          backgroundColor: '#fffbeb', 
          padding: '10px 12px', 
          borderRadius: '8px',
          borderLeft: '3px solid #f59e0b',
          marginBottom: '16px'
        }}>
          <p style={{ fontSize: '11px', color: '#92400e', margin: 0, fontWeight: 600 }}>📝 Notas</p>
          <p style={{ fontSize: '12px', color: '#78350f', margin: '4px 0 0 0' }}>
            {quotation.observations}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px solid #e5e5e5' }}>
        <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>
          ¡Gracias por su preferencia! 🙏
        </p>
        {businessProfile?.address && (
          <p style={{ fontSize: '10px', color: '#bbb', margin: '4px 0 0 0' }}>
            📍 {businessProfile.address}, {businessProfile.city}
          </p>
        )}
      </div>
    </div>
  );
};
