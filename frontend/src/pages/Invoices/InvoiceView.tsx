import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { Invoice } from '../../types';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ArrowLeft, Download, Mail, FileText } from 'lucide-react';

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
    return <LoadingSpinner fullPage text="Loading invoice..." />;
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <ErrorAlert message={error} />
          <button onClick={() => navigate(-1)} className="btn-primary mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-primary-700 hover:text-primary-800 font-semibold mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice {invoice.invoice_number}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Generated on {new Date(invoice.created_at).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handleResendEmail}
              className="btn-ghost border border-primary-300 text-primary-700 hover:bg-primary-50 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Resend Email
            </button>
          </div>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

        {/* Invoice Details Card */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          {/* Invoice Info & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-primary-700 mb-4">Invoice Details</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Invoice Number:</span>{' '}
                  <span className="text-gray-900">{invoice.invoice_number}</span>
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <StatusBadge status={invoice.status} />
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Date:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(invoice.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-700 mb-4">Amount Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">₹{Number(invoice.subtotal).toFixed(2)}</span>
                </div>
                {invoice.igst_amount > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">IGST:</span>
                    <span className="text-gray-600">₹{Number(invoice.igst_amount).toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">CGST:</span>
                      <span className="text-gray-600">₹{Number(invoice.cgst_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">SGST:</span>
                      <span className="text-gray-600">₹{Number(invoice.sgst_amount).toFixed(2)}</span>
                    </div>
                  </>
                )}
                {invoice.shipping_charges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping:</span>
                    <span className="text-gray-600">
                      ₹{Number(invoice.shipping_charges).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg pt-3 mt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-primary-700">
                    ₹{Number(invoice.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GST Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">GST Information</h3>
            <div className="grid grid-cols-3 gap-6">
              {invoice.igst_amount > 0 ? (
                <>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">IGST</div>
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{Number(invoice.igst_amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Inter-state</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">CGST</div>
                    <div className="text-lg font-semibold text-gray-900">₹0.00</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">SGST</div>
                    <div className="text-lg font-semibold text-gray-900">₹0.00</div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">CGST</div>
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{Number(invoice.cgst_amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Intra-state</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">SGST</div>
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{Number(invoice.sgst_amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Intra-state</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">IGST</div>
                    <div className="text-lg font-semibold text-gray-900">₹0.00</div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total GST:</span>
              <span className="text-xl font-bold text-primary-700">
                ₹{Number(invoice.total_gst).toFixed(2)}
              </span>
            </div>
          </div>

          {/* PDF Preview */}
          {invoice.pdf_url && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-900">Invoice Document</h3>
                <button
                  onClick={() =>
                    window.open(invoiceService.getInvoiceViewUrl(invoice.id), '_blank')
                  }
                  className="text-sm text-primary-700 hover:text-primary-800 font-semibold transition-colors"
                >
                  View Full Screen
                </button>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">PDF preview available</p>
                <button onClick={handleDownload} className="btn-primary">
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
