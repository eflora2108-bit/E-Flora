import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Supplier } from '../../types';

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
      alert('Supplier approved successfully!');
      setSuppliers(suppliers.filter(s => s.id !== id));
      setSelectedSupplier(null);
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.rejectSupplier(id, rejectionReason);
      alert('Supplier rejected');
      setSuppliers(suppliers.filter(s => s.id !== id));
      setSelectedSupplier(null);
      setRejectionReason('');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>🏢 Supplier Verification</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Review and approve supplier applications</p>

        {suppliers.length === 0 ? (
          <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3>No Pending Suppliers</h3>
            <p style={{ color: '#666' }}>All supplier applications have been reviewed</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedSupplier ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
            {/* Supplier List */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Pending Applications ({suppliers.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {suppliers.map(supplier => (
                  <div
                    key={supplier.id}
                    onClick={() => setSelectedSupplier(supplier)}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${selectedSupplier?.id === supplier.id ? '#667eea' : '#eee'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedSupplier?.id === supplier.id ? '#f0f4ff' : 'white'
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{supplier.business_name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {supplier.first_name} {supplier.last_name} • {supplier.email}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
                      {supplier.city}, {supplier.state}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Details */}
            {selectedSupplier && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Application Details</h3>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Business Name:</strong> {selectedSupplier.business_name}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Business Type:</strong> {selectedSupplier.business_type || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>GSTIN:</strong> {selectedSupplier.gstin || 'Not provided'}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>PAN:</strong> {selectedSupplier.pan || 'Not provided'}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Address:</strong> {selectedSupplier.business_address}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Location:</strong> {selectedSupplier.city}, {selectedSupplier.state} - {selectedSupplier.pincode}
                  </div>
                </div>

                {selectedSupplier.verification_documents && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <strong>Uploaded Documents:</strong>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                      {JSON.parse(JSON.stringify(selectedSupplier.verification_documents)).map((doc: any, i: number) => (
                        <li key={i} style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                          <a href={`http://localhost:5000${doc.path}`} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                            {doc.originalName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Action Required</h4>

                  <button
                    onClick={() => handleApprove(selectedSupplier.id)}
                    disabled={actionLoading}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      marginBottom: '0.75rem',
                      background: actionLoading ? '#ccc' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: actionLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {actionLoading ? 'Processing...' : '✅ Approve Supplier'}
                  </button>

                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Or reject with reason:
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection..."
                      rows={3}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit', marginBottom: '0.75rem' }}
                    />
                    <button
                      onClick={() => handleReject(selectedSupplier.id)}
                      disabled={actionLoading || !rejectionReason.trim()}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: actionLoading || !rejectionReason.trim() ? '#ccc' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: actionLoading || !rejectionReason.trim() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {actionLoading ? 'Processing...' : '❌ Reject Application'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
