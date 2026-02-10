import { useState, useEffect } from 'react';
import { supplierService } from '../../services/supplierService';
import { SupplierProfileData } from '../../types';

export const SupplierSetupPage = ({ onComplete }: { onComplete?: () => void }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<SupplierProfileData>({
    business_name: '',
    business_type: '',
    gstin: '',
    pan: '',
    business_address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await supplierService.createProfile(profileData);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError('Please upload at least one document');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await supplierService.uploadDocuments(files);
      setStep(3);
      if (onComplete) onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '2.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>🏢 Supplier Setup</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Complete your supplier profile to start selling</p>

        {/* Progress Steps */}
        <div style={{ display: 'flex', marginBottom: '2rem', gap: '1rem' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1,
              height: '4px',
              background: step >= s ? '#667eea' : '#ddd',
              borderRadius: '2px'
            }} />
          ))}
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <h2 style={{ marginBottom: '1.5rem' }}>Step 1: Business Information</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Business Name *</label>
              <input type="text" name="business_name" value={profileData.business_name} onChange={handleChange} required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Business Type</label>
              <input type="text" name="business_type" value={profileData.business_type} onChange={handleChange}
                placeholder="e.g., Nursery, Wholesaler" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>GSTIN</label>
                <input type="text" name="gstin" value={profileData.gstin} onChange={handleChange} maxLength={15}
                  placeholder="22AAAAA0000A1Z5" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>PAN</label>
                <input type="text" name="pan" value={profileData.pan} onChange={handleChange} maxLength={10}
                  placeholder="AAAAA0000A" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Business Address</label>
              <textarea name="business_address" value={profileData.business_address} onChange={handleChange} rows={3}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>City</label>
                <input type="text" name="city" value={profileData.city} onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>State</label>
                <input type="text" name="state" value={profileData.state} onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Pincode</label>
                <input type="text" name="pincode" value={profileData.pincode} onChange={handleChange} maxLength={6}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.875rem', background: loading ? '#ccc' : '#667eea', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving...' : 'Next: Upload Documents'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit}>
            <h2 style={{ marginBottom: '1rem' }}>Step 2: Upload Documents</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Upload your business verification documents (GSTIN certificate, PAN card, business license, etc.)
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', padding: '3rem 1rem', border: '2px dashed #ddd', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: '#f9f9f9' }}>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFiles(e.target.files)}
                  style={{ display: 'none' }} />
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Click to upload documents</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>PDF, JPG, PNG (max 10MB per file)</div>
              </label>
              {files && files.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Selected files:</strong>
                  <ul style={{ marginTop: '0.5rem' }}>
                    {Array.from(files).map((file, i) => (
                      <li key={i} style={{ fontSize: '0.9rem', color: '#666' }}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading || !files}
              style={{ width: '100%', padding: '0.875rem', background: loading || !files ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: loading || !files ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Uploading...' : 'Submit for Verification'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ marginBottom: '1rem' }}>Application Submitted!</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Your supplier application is now under review. You'll be notified once it's approved.
            </p>
            <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '8px', fontSize: '0.9rem' }}>
              <strong>What's next?</strong>
              <ul style={{ textAlign: 'left', marginTop: '0.5rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>Our team will review your documents within 24-48 hours</li>
                <li>You'll receive an email notification about the status</li>
                <li>Once approved, you can start adding products</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
