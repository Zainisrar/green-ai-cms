'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface InitiativeProgram {
  program: string;
  description: string;
}

interface InitiativesUnderwayFormData {
  title: string;
  subHeadline: string;
  key: InitiativeProgram[];
  quote: {
    text: string;
    highlighted: string;
  };
}

const EditInitiativesUnderwayPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otherData, setOtherData] = useState<any>(null);

  const [formData, setFormData] = useState<InitiativesUnderwayFormData>({
    title: '',
    subHeadline: '',
    key: [],
    quote: { text: '', highlighted: '' },
  });

  useEffect(() => {
    if (id) {
      fetchWomenInEnergyData();
    }
  }, [id]);

  const fetchWomenInEnergyData = async () => {
    try {
      const result = await apiClient.get(`/api/empower/women-in-energy/${id}`);
      if (result.success) {
        const data = result.data;
        setFormData({
          title: data.modal.initiativesUnderway.title || '',
          subHeadline: data.modal.initiativesUnderway.subHeadline || '',
          key: Array.isArray(data.modal.initiativesUnderway.key) ? data.modal.initiativesUnderway.key : [],
          quote: data.modal.initiativesUnderway.quote || { text: '', highlighted: '' },
        });
        setOtherData({
          mainPage: data.mainPage,
          modal: { ...data.modal, initiativesUnderway: undefined },
        });
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

  const handleInputChange = (field: keyof InitiativesUnderwayFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: '' }));
  };

  const addProgram = () => {
    setFormData((prev) => ({ ...prev, key: [...prev.key, { program: '', description: '' }] }));
  };

  const updateProgram = (index: number, field: keyof InitiativeProgram, value: string) => {
    setFormData((prev) => ({
      ...prev,
      key: prev.key.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  };

  const removeProgram = (index: number) => {
    setFormData((prev) => ({ ...prev, key: prev.key.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.subHeadline.trim()) newErrors.subHeadline = 'Sub-headline is required';
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
        modal: { ...otherData.modal, initiativesUnderway: formData },
      };
      const result = await apiClient.put(`/api/empower/women-in-energy/${id}`, payload);
      if (result.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Initiatives Underway modal updated successfully',
          icon: 'success',
          confirmButtonColor: '#10b981',
        }).then(() => router.push('/empower/women-in-energy'));
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
            <h5 className="font-semibold text-lg dark:text-white-light">Edit "Initiatives Underway" Modal</h5>
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
              <label className="block text-sm font-medium mb-2">Sub-Headline *</label>
              <input type="text" className="form-input" value={formData.subHeadline} onChange={(e) => handleInputChange('subHeadline', e.target.value)} />
              {errors.subHeadline && <p className="text-red-500 text-xs mt-1">{errors.subHeadline}</p>}
            </div>
          </div>
          {/* Programs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h6 className="text-lg font-semibold">Programs</h6>
              <button type="button" onClick={addProgram} className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600">
                <IconPlus className="w-4 h-4" />
                Add Program
              </button>
            </div>
            {formData.key.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">No programs added yet.</div>
            ) : (
              <div className="space-y-4">
                {formData.key.map((p, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border space-y-4">
                    <div className="flex items-center justify-between">
                      <h6 className="font-medium">Program #{index + 1}</h6>
                      <button type="button" onClick={() => removeProgram(index)} className="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1">Program Name</label>
                        <input type="text" className="form-input" value={p.program} onChange={(e) => updateProgram(index, 'program', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Description</label>
                        <textarea className="form-textarea" rows={3} value={p.description} onChange={(e) => updateProgram(index, 'description', e.target.value)} />
                      </div>
                    </div>
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
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">{loading ? 'Saving...' : 'Save Modal'}</button>
            <button type="button" onClick={() => router.back()} className="btn btn-outline-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default EditInitiativesUnderwayPage;
