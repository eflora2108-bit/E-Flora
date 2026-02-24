import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { Invoice } from '../../types';
import { toast } from 'react-hot-toast';

export const InvoiceViewPage = () => {
  const { id: invoiceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await invoiceService.getInvoiceDetails(invoiceId!);
      setInvoice(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (invoiceId) {
      invoiceService.downloadInvoice(invoiceId);
    }
  };

  const handleResendEmail = async () => {
    try {
      setError('');
      await invoiceService.resendInvoiceEmail(invoiceId!);
      toast.success('Invoice email sent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend email');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Invoice not found</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#667eea',
                border: '1px solid #667eea',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '1rem',
              }}
            >
              ← Back
            </button>
            <h1 style={{ marginBottom: '0.5rem' }}>Invoice {invoice.invoice_number}</h1>
            <p style={{ color: '#666' }}>
              Generated on {new Date(invoice.created_at).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleDownload}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              📥 Download PDF
            </button>
            <button
              onClick={handleResendEmail}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: '#667eea',
                border: '1px solid #667eea',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              📧 Resend Email
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Invoice Details Card */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {/* Invoice Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e0e0e0' }}>
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Invoice Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <strong>Invoice Number:</strong> {invoice.invoice_number}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: '#10b98120',
                      color: '#10b981',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {invoice.status}
                  </span>
                </div>
                <div>
                  <strong>Date:</strong> {new Date(invoice.created_at).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Amount Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
                </div>
                {invoice.igst_amount > 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                    <span>IGST:</span>
                    <span>₹{Number(invoice.igst_amount).toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                      <span>CGST:</span>
                      <span>₹{Number(invoice.cgst_amount).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                      <span>SGST:</span>
                      <span>₹{Number(invoice.sgst_amount).toFixed(2)}</span>
                    </div>
                  </>
                )}
                {invoice.shipping_charges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                    <span>Shipping:</span>
                    <span>₹{Number(invoice.shipping_charges).toFixed(2)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: '700',
                    fontSize: '1.2rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #e0e0e0',
                    marginTop: '0.5rem',
                  }}
                >
                  <span>Total:</span>
                  <span style={{ color: '#667eea' }}>₹{Number(invoice.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* GST Information */}
          <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>GST Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              {invoice.igst_amount > 0 ? (
                <>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>IGST</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>₹{Number(invoice.igst_amount).toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>Inter-state</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>CGST</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>₹0.00</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>SGST</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>₹0.00</div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>CGST</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>₹{Number(invoice.cgst_amount).toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>Intra-state</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>SGST</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>₹{Number(invoice.sgst_amount).toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>Intra-state</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>IGST</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>₹0.00</div>
                  </div>
                </>
              )}
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>Total GST:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#667eea' }}>
                  ₹{Number(invoice.total_gst).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* PDF Preview (if available) */}
          {invoice.pdf_url && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Invoice Document</h3>
                <button
                  onClick={() => window.open(invoiceService.getInvoiceViewUrl(invoice.id), '_blank')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    color: '#667eea',
                    border: '1px solid #667eea',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  View Full Screen
                </button>
              </div>
              <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#666', marginBottom: '1rem' }}>PDF preview available</p>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Download Invoice PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
