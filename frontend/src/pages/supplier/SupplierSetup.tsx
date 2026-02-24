import { useState } from 'react';
import { supplierService } from '../../services/supplierService';
import { SupplierProfileData } from '../../types';
import { SupplierLayout } from '../../components/layout/SupplierLayout';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { CheckCircle, Upload } from 'lucide-react';

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
    <SupplierLayout title="Supplier Setup" subtitle="Complete your supplier profile to start selling">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 lg:p-10 border border-gray-100 shadow-sm">
          {/* Progress Steps */}
          <div className="flex gap-3 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                  step >= s ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Step 1: Business Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={profileData.business_name}
                    onChange={handleChange}
                    required
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <input
                    type="text"
                    name="business_type"
                    value={profileData.business_type}
                    onChange={handleChange}
                    placeholder="e.g., Nursery, Wholesaler"
                    className="input-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                    <input
                      type="text"
                      name="gstin"
                      value={profileData.gstin}
                      onChange={handleChange}
                      maxLength={15}
                      placeholder="22AAAAA0000A1Z5"
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PAN</label>
                    <input
                      type="text"
                      name="pan"
                      value={profileData.pan}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="AAAAA0000A"
                      className="input-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <textarea
                    name="business_address"
                    value={profileData.business_address}
                    onChange={handleChange}
                    rows={3}
                    className="input-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleChange}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={profileData.state}
                      onChange={handleChange}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={profileData.pincode}
                      onChange={handleChange}
                      maxLength={6}
                      className="input-base"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-8">
                {loading ? 'Saving...' : 'Next: Upload Documents'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Step 2: Upload Documents
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Upload your business verification documents (GSTIN certificate, PAN card, business
                license, etc.)
              </p>

              <div className="mb-6">
                <label className="block p-12 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFiles(e.target.files)}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <div className="font-semibold text-gray-700 mb-1">Click to upload documents</div>
                  <div className="text-sm text-gray-500">PDF, JPG, PNG (max 10MB per file)</div>
                </label>
                {files && files.length > 0 && (
                  <div className="mt-4">
                    <strong className="text-sm text-gray-700">Selected files:</strong>
                    <ul className="mt-2 space-y-1">
                      {Array.from(files).map((file, i) => (
                        <li key={i} className="text-sm text-gray-600">
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !files}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'Submit for Verification'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
              <p className="text-gray-500 mb-8">
                Your supplier application is now under review. You'll be notified once it's
                approved.
              </p>
              <div className="p-6 bg-blue-50 rounded-xl text-left">
                <strong className="text-sm text-blue-800">What's next?</strong>
                <ul className="mt-2 pl-5 list-disc text-sm text-blue-700 leading-loose">
                  <li>Our team will review your documents within 24-48 hours</li>
                  <li>You'll receive an email notification about the status</li>
                  <li>Once approved, you can start adding products</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
};
