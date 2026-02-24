import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Supplier } from '../../types';
import { toast } from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { CheckCircle, XCircle } from 'lucide-react';

export const AdminSupplierVerification = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingSuppliers();
  }, []);

  const loadPendingSuppliers = async () => {
    try {
      const result = await adminService.getPendingSuppliers();
      setSuppliers(result.suppliers);
    } catch (error: any) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this supplier?')) return;

    setActionLoading(true);
    try {
      await adminService.approveSupplier(id);
      toast.success('Supplier approved successfully!');
      setSuppliers(suppliers.filter((s) => s.id !== id));
      setSelectedSupplier(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve supplier');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.rejectSupplier(id, rejectionReason);
      toast.success('Supplier application rejected');
      setSuppliers(suppliers.filter((s) => s.id !== id));
      setSelectedSupplier(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject supplier');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Supplier Verification" subtitle="Review and approve supplier applications">
        <LoadingSpinner text="Loading..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Supplier Verification" subtitle="Review and approve supplier applications">
      {suppliers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={<CheckCircle className="w-12 h-12 text-emerald-400" />}
            title="No Pending Suppliers"
            description="All supplier applications have been reviewed"
          />
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            selectedSupplier ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Supplier List */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Applications ({suppliers.length})
            </h3>
            <div className="flex flex-col gap-3">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                    selectedSupplier?.id === supplier.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">
                    {supplier.business_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {supplier.first_name} {supplier.last_name} &bull; {supplier.email}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    {supplier.city}, {supplier.state}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Details */}
          {selectedSupplier && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>

              <div className="space-y-3 mb-6">
                <div>
                  <strong className="text-gray-700">Business Name:</strong>{' '}
                  <span className="text-gray-900">{selectedSupplier.business_name}</span>
                </div>
                <div>
                  <strong className="text-gray-700">Business Type:</strong>{' '}
                  <span className="text-gray-900">
                    {selectedSupplier.business_type || 'N/A'}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-700">GSTIN:</strong>{' '}
                  <span className="text-gray-900">
                    {selectedSupplier.gstin || 'Not provided'}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-700">PAN:</strong>{' '}
                  <span className="text-gray-900">
                    {selectedSupplier.pan || 'Not provided'}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-700">Address:</strong>{' '}
                  <span className="text-gray-900">{selectedSupplier.business_address}</span>
                </div>
                <div>
                  <strong className="text-gray-700">Location:</strong>{' '}
                  <span className="text-gray-900">
                    {selectedSupplier.city}, {selectedSupplier.state} - {selectedSupplier.pincode}
                  </span>
                </div>
              </div>

              {selectedSupplier.verification_documents && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <strong className="text-gray-700">Uploaded Documents:</strong>
                  <ul className="mt-2 pl-6 list-disc">
                    {JSON.parse(JSON.stringify(selectedSupplier.verification_documents)).map(
                      (doc: any, i: number) => (
                        <li key={i} className="text-sm mt-1">
                          <a
                            href={`http://localhost:5000${doc.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline"
                          >
                            {doc.originalName}
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Action Required</h4>

                <button
                  onClick={() => handleApprove(selectedSupplier.id)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 mb-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {actionLoading ? 'Processing...' : 'Approve Supplier'}
                </button>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or reject with reason:
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    rows={3}
                    className="input-base mb-3"
                  />
                  <button
                    onClick={() => handleReject(selectedSupplier.id)}
                    disabled={actionLoading || !rejectionReason.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Reject Application'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};
