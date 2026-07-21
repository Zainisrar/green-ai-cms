'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface VoiceItem {
  img: { src: string; alt: string };
  title: string;
  description: string;
}

interface VoicesOfPowerFormData {
  title: string;
  items: VoiceItem[];
}

const EditVoicesOfPowerPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otherData, setOtherData] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<VoicesOfPowerFormData>({
    title: '',
    items: [],
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
          title: data.modal.voicesOfPower.title || '',
          items: Array.isArray(data.modal.voicesOfPower.items) ? data.modal.voicesOfPower.items : [],
        });
        setOtherData({ mainPage: data.mainPage, modal: { ...data.modal, voicesOfPower: undefined } });
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

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, title: value }));
    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
  };

  const addVoice = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, { img: { src: '', alt: '' }, title: '', description: '' }] }));
  };

  const updateVoiceField = (index: number, field: keyof VoiceItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const updateVoiceImage = (index: number, field: 'src' | 'alt', value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, img: { ...item.img, [field]: value } } : item)),
    }));
  };

  const removeVoice = (index: number) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleMediaSelect = (media: any) => {
    if (currentImageIndex !== null) {
      updateVoiceImage(currentImageIndex, 'src', media.url);
    }
    setShowMediaPicker(false);
    setCurrentImageIndex(null);
  };

  const openMediaPicker = (index: number) => {
    setCurrentImageIndex(index);
    setShowMediaPicker(true);
  };

  const removeImage = (index: number) => {
    updateVoiceImage(index, 'src', '');
    updateVoiceImage(index, 'alt', '');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = { mainPage: otherData.mainPage, modal: { ...otherData.modal, voicesOfPower: formData } };
      const result = await apiClient.put(`/api/empower/women-in-energy/${id}`, payload);
      if (result.success) {
        Swal.fire({ title: 'Success!', text: 'Voices of Power modal updated successfully', icon: 'success', confirmButtonColor: '#10b981' }).then(() => router.push('/empower/women-in-energy'));
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
            <h5 className="font-semibold text-lg dark:text-white-light">Edit "Voices of Power" Modal</h5>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Modal Title *</label>
            <input type="text" className="form-input" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          {/* Voice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h6 className="text-lg font-semibold">Voices</h6>
              <button type="button" onClick={addVoice} className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600">
                <IconPlus className="w-4 h-4" />
                Add Voice
              </button>
            </div>
            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">No voices added yet.</div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border space-y-4">
                    <div className="flex items-center justify-between">
                      <h6 className="font-medium">Voice #{index + 1}</h6>
                      <button type="button" onClick={() => removeVoice(index)} className="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1 space-y-2">
                        <label className="block text-xs font-medium">Image</label>
                        <button
                          type="button"
                          onClick={() => openMediaPicker(index)}
                          className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 btn-sm w-full"
                        >
                          Browse Media Library
                        </button>
                        {item.img.src && (
                          <div className="space-y-2">
                            <img src={item.img.src} alt={item.img.alt || 'Voice image'} className="rounded border w-full max-h-40 object-cover" />
                            <button type="button" onClick={() => removeImage(index)} className="btn btn-outline-danger btn-xs">Remove Image</button>
                          </div>
                        )}
                        {!item.img.src && (
                          <p className="text-xs text-gray-500">No image selected yet.</p>
                        )}
                      </div>
                      <div className="md:col-span-2 grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">Title</label>
                          <input type="text" className="form-input" value={item.title} onChange={(e) => updateVoiceField(index, 'title', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Description</label>
                          <textarea className="form-textarea" rows={3} value={item.description} onChange={(e) => updateVoiceField(index, 'description', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Alt Text</label>
                          <input type="text" className="form-input" value={item.img.alt} onChange={(e) => updateVoiceImage(index, 'alt', e.target.value)} />
                        </div>
                      </div>
                    </div>
                    {errors[`item-${index}-img`] && <p className="text-red-500 text-xs">{errors[`item-${index}-img`]}</p>}
                  </div>
                ))}
              </div>
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
        onClose={() => {
          setShowMediaPicker(false);
          setCurrentImageIndex(null);
        }}
        allowedTypes={['image']}
      />
    </ProtectedRoute>
  );
};

export default EditVoicesOfPowerPage;
