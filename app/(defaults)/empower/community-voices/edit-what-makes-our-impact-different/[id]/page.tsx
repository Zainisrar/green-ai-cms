'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface WhatMakesImpactDifferentFormData {
  title: string;
  key1: { title: string; items: string[] };
  key2: { title: string; items: string[] };
}

const EditWhatMakesImpactDifferentPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otherData, setOtherData] = useState<any>(null);

  const [formData, setFormData] = useState<WhatMakesImpactDifferentFormData>({
    title: '',
    key1: { title: '', items: [] },
    key2: { title: '', items: [] },
  });

  useEffect(() => {
    if (id) fetchCommunityVoicesData();
  }, [id]);

  const fetchCommunityVoicesData = async () => {
    try {
      const result = await apiClient.get(`/api/empower/community-voices/${id}`);
      if (result.success) {
        const data = result.data;
        setFormData({
          title: data.modals.whatMakesOurImpactDifferent.title || '',
          key1: data.modals.whatMakesOurImpactDifferent.key1 || { title: '', items: [] },
          key2: data.modals.whatMakesOurImpactDifferent.key2 || { title: '', items: [] },
        });
        setOtherData({
          mainPage: data.mainPage,
          modals: { ...data.modals, whatMakesOurImpactDifferent: undefined },
        });
      } else {
        Swal.fire('Error', 'Failed to fetch community voices data', 'error');
        router.push('/empower/community-voices');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Swal.fire('Error', 'Failed to fetch community voices data', 'error');
      router.push('/empower/community-voices');
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (field: keyof WhatMakesImpactDifferentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleKeyTitleChange = (key: 'key1' | 'key2', value: string) => {
    setFormData(prev => ({ ...prev, [key]: { ...prev[key], title: value } }));
  };

  const addKeyItem = (key: 'key1' | 'key2') => {
    setFormData(prev => ({ ...prev, [key]: { ...prev[key], items: [...prev[key].items, ''] } }));
  };

  const updateKeyItem = (key: 'key1' | 'key2', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        items: prev[key].items.map((it, i) => (i === index ? value : it)),
      },
    }));
  };

  const removeKeyItem = (key: 'key1' | 'key2', index: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: { ...prev[key], items: prev[key].items.filter((_, i) => i !== index) },
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.key1.title.trim()) newErrors.key1Title = 'Key 1 title required';
    if (!formData.key2.title.trim()) newErrors.key2Title = 'Key 2 title required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        mainPage: otherData.mainPage,
        modals: {
          ...otherData.modals,
          whatMakesOurImpactDifferent: formData,
        },
      };
      const result = await apiClient.put(`/api/empower/community-voices/${id}`, payload);
      if (result.success) {
        Swal.fire({
          title: 'Success!',
          text: 'What Makes Our Impact Different modal updated successfully',
          icon: 'success',
          confirmButtonColor: '#10b981',
        }).then(() => router.push('/empower/community-voices'));
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
            <h5 className="font-semibold text-lg dark:text-white-light">Edit "What Makes Our Impact Different" Modal</h5>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Modal Title *</label>
            <input type="text" className="form-input" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          {/* Key 1 */}
          <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
            <div className="flex items-center justify-between">
              <h6 className="font-semibold">Key 1</h6>
              <button type="button" onClick={() => addKeyItem('key1')} className="btn btn-xs btn-outline-primary border-green-600 text-green-600 hover:bg-green-600">Add Item</button>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Key 1 Title *</label>
              <input type="text" className="form-input" value={formData.key1.title} onChange={(e) => handleKeyTitleChange('key1', e.target.value)} />
              {errors.key1Title && <p className="text-red-500 text-xs mt-1">{errors.key1Title}</p>}
            </div>
            {formData.key1.items.length === 0 ? (
              <p className="text-xs text-gray-500">No items yet.</p>
            ) : (
              <div className="space-y-3">
                {formData.key1.items.map((it, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" className="form-input flex-1" value={it} onChange={(e) => updateKeyItem('key1', idx, e.target.value)} placeholder={`Item ${idx + 1}`} />
                    <button type="button" onClick={() => removeKeyItem('key1', idx)} className="btn btn-outline-danger btn-sm">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Key 2 */}
          <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
            <div className="flex items-center justify-between">
              <h6 className="font-semibold">Key 2</h6>
              <button type="button" onClick={() => addKeyItem('key2')} className="btn btn-xs btn-outline-primary border-green-600 text-green-600 hover:bg-green-600">Add Item</button>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Key 2 Title *</label>
              <input type="text" className="form-input" value={formData.key2.title} onChange={(e) => handleKeyTitleChange('key2', e.target.value)} />
              {errors.key2Title && <p className="text-red-500 text-xs mt-1">{errors.key2Title}</p>}
            </div>
            {formData.key2.items.length === 0 ? (
              <p className="text-xs text-gray-500">No items yet.</p>
            ) : (
              <div className="space-y-3">
                {formData.key2.items.map((it, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" className="form-input flex-1" value={it} onChange={(e) => updateKeyItem('key2', idx, e.target.value)} placeholder={`Item ${idx + 1}`} />
                    <button type="button" onClick={() => removeKeyItem('key2', idx)} className="btn btn-outline-danger btn-sm">Remove</button>
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
    </ProtectedRoute>
  );
};

export default EditWhatMakesImpactDifferentPage;
