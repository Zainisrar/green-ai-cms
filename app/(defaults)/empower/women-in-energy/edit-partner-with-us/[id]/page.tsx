'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface PartnerWithUsFormData {
  title: string;
  description: string;
  keys: string[];
  quote: { text: string; highlighted: string };
  img: { src: string; alt: string };
}

const EditPartnerWithUsPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otherData, setOtherData] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const [formData, setFormData] = useState<PartnerWithUsFormData>({
    title: '',
    description: '',
    keys: [],
    quote: { text: '', highlighted: '' },
    img: { src: '', alt: '' },
  });

  useEffect(() => {
    if (id) fetchWomenInEnergyData();
  }, [id]);

  const fetchWomenInEnergyData = async () => {
    try {
      const result = await apiClient.get(`/api/empower/women-in-energy/${id}`);
      if (result.success) {
        const data = result.data;
        setFormData({
          title: data.modal.partnerWithUs.title || '',
          description: data.modal.partnerWithUs.description || '',
          keys: Array.isArray(data.modal.partnerWithUs.keys) ? data.modal.partnerWithUs.keys : [],
          quote: data.modal.partnerWithUs.quote || { text: '', highlighted: '' },
          img: data.modal.partnerWithUs.img || { src: '', alt: '' },
        });
        setOtherData({ mainPage: data.mainPage, modal: { ...data.modal, partnerWithUs: undefined } });
      } else {
        Swal.fire('Error', 'Failed to fetch women in energy data', 'error');
        router.push('/empower/women-in-energy');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Swal.fire('Error', 'Failed to fetch women in energy data', 'error');
      router.push('/empower/women-in-energy');
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (field: keyof PartnerWithUsFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: '' }));
  };

  const addKey = () => setFormData((prev) => ({ ...prev, keys: [...prev.keys, ''] }));
  const updateKey = (index: number, value: string) => setFormData((prev) => ({ ...prev, keys: prev.keys.map((k, i) => (i === index ? value : k)) }));
  const removeKey = (index: number) => setFormData((prev) => ({ ...prev, keys: prev.keys.filter((_, i) => i !== index) }));

  const handleMediaSelect = (media: any) => {
    setFormData((prev) => ({ ...prev, img: { ...prev.img, src: media.url } }));
    setShowMediaPicker(false);
    if (errors.img) {
      setErrors((prev) => ({ ...prev, img: '' }));
    }
  };

  const removeImage = () => setFormData((prev) => ({ ...prev, img: { src: '', alt: '' } }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = { mainPage: otherData.mainPage, modal: { ...otherData.modal, partnerWithUs: formData } };
      const result = await apiClient.put(`/api/empower/women-in-energy/${id}`, payload);
      if (result.success) {
        Swal.fire({ title: 'Success!', text: 'Partner With Us modal updated successfully', icon: 'success', confirmButtonColor: '#10b981' }).then(() => router.push('/empower/women-in-energy'));
      } else {
        Swal.fire('Error', result.error || 'Failed to update modal', 'error');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      Swal.fire('Error', error.message || 'Failed to update modal', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'edit' }}>
        <div className="panel">
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'edit' }}>
      <div className="panel">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600">
              <IconArrowBackward className="w-4 h-4" />
            </button>
            <h5 className="font-semibold text-lg dark:text-white-light">Edit "Partner With Us" Modal</h5>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input type="text" className="form-input" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea className="form-textarea" rows={3} value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>
          {/* Keys */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h6 className="text-lg font-semibold">Partnership Keys</h6>
              <button type="button" onClick={addKey} className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600">
                <IconPlus className="w-4 h-4" />
                Add Key
              </button>
            </div>
            {formData.keys.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">No keys added yet.</div>
            ) : (
              <div className="space-y-3">
                {formData.keys.map((k, index) => (
                  <div key={index} className="flex gap-2">
                    <input type="text" className="form-input flex-1" value={k} onChange={(e) => updateKey(index, e.target.value)} placeholder={`Key ${index + 1}`} />
                    <button type="button" onClick={() => removeKey(index)} className="btn btn-sm btn-outline-danger">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Quote */}
          <div>
            <h6 className="text-lg font-semibold mb-4">Quote</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Quote Text</label>
                <textarea className="form-textarea" rows={3} value={formData.quote.text} onChange={(e) => setFormData((prev) => ({ ...prev, quote: { ...prev.quote, text: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                <input type="text" className="form-input" value={formData.quote.highlighted} onChange={(e) => setFormData((prev) => ({ ...prev, quote: { ...prev.quote, highlighted: e.target.value } }))} />
              </div>
            </div>
          </div>
          {/* Image */}
          <div>
            <h6 className="text-lg font-semibold mb-2">Image</h6>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 space-y-2">
                <label className="block text-sm font-medium">Image</label>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                >
                  Browse Media Library
                </button>
                {errors.img && <p className="text-xs text-red-500">{errors.img}</p>}
              </div>
              <div className="md:w-1/2 space-y-2">
                <label className="block text-sm font-medium">Alt Text</label>
                <input type="text" className="form-input" value={formData.img.alt} onChange={(e) => setFormData((prev) => ({ ...prev, img: { ...prev.img, alt: e.target.value } }))} placeholder="Describe the image" />
              </div>
            </div>
            {formData.img.src ? (
              <div className="relative group w-full md:w-1/2 mt-3">
                <img src={formData.img.src} alt={formData.img.alt || 'Uploaded preview'} className="rounded-lg border shadow-sm max-h-64 object-cover w-full" />
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" onClick={removeImage} className="btn btn-outline-danger btn-sm">Remove Image</button>
                  <span className="text-xs text-gray-500 truncate">{formData.img.src}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">No image selected yet. Click "Browse Media Library" to select an image.</p>
            )}
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">{loading ? 'Saving...' : 'Save Modal'}</button>
            <button type="button" onClick={() => router.back()} className="btn btn-outline-secondary">Cancel</button>
          </div>
        </form>
      </div>

      <MediaPicker
        isOpen={showMediaPicker}
        onSelect={handleMediaSelect}
        onClose={() => setShowMediaPicker(false)}
        allowedTypes={['image']}
      />
    </ProtectedRoute>
  );
};

export default EditPartnerWithUsPage;
