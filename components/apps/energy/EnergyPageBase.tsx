'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { energyApi, energyKeys, EnergyService, EnergyCTA } from '@/lib/api/energy';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useUpdateEnergy } from './hooks/useUpdateEnergy';
import Loading from '@/components/layouts/loading';
import IconEdit from '@/components/icon/icon-edit';
import IconCheck from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface EnergyPageBaseProps {
  energyId?: string;
}

export default function EnergyPageBase({ energyId = '1' }: EnergyPageBaseProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [ctaLinkType, setCtaLinkType] = useState<'navigation' | 'external'>('navigation');

  // Fetch navigation items for CTA dropdown
  const { data: navigationItems } = useQuery({
    queryKey: navigationKeys.lists(),
    queryFn: () => navigationApi.getAll(),
  });

  // Flatten navigation items to include all sub-navigation items
  const flattenNavItems = (items: any[]): any[] => {
    if (!items) return [];
    const flattened: any[] = [];
    
    const traverse = (navItems: any[], parentName?: string) => {
      navItems.forEach((item) => {
        const displayName = parentName ? `${parentName} > ${item.name}` : item.name;
        flattened.push({
          ...item,
          displayName,
        });
        if (item.children && item.children.length > 0) {
          traverse(item.children, displayName);
        }
      });
    };
    
    traverse(items);
    return flattened;
  };

  const allNavItems = flattenNavItems(navigationItems || []);

  const { data: energy, isLoading, error } = useQuery({
    queryKey: energyKeys.detail(energyId),
    queryFn: () => energyApi.getById(energyId),
  });

  const updateMutation = useUpdateEnergy();

  useEffect(() => {
    if (energy) {
      setEditData({
        service1: energy.service1,
        service2: energy.service2,
        service3: energy.service3,
        service4: energy.service4,
        headline: energy.headline,
        subheadline: energy.subheadline,
        cta: energy.cta,
      });
    }
  }, [energy]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (energy) {
      setEditData({
        service1: energy.service1,
        service2: energy.service2,
        service3: energy.service3,
        service4: energy.service4,
        headline: energy.headline,
        subheadline: energy.subheadline,
        cta: energy.cta,
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: energyId,
        ...editData,
      });
      
      setIsEditing(false);
      
      Swal.fire({
        title: 'Success!',
        text: 'Energy data updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update energy data',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const updateService = (serviceKey: string, field: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [serviceKey]: {
        ...prev[serviceKey],
        [field]: value,
      },
    }));
  };

  const updateServiceKey = (serviceKey: string, keyIndex: number, value: string) => {
    setEditData((prev: any) => ({
      ...prev,
      [serviceKey]: {
        ...prev[serviceKey],
        keys: prev[serviceKey].keys.map((key: any, index: number) =>
          index === keyIndex ? { text: value } : key
        ),
      },
    }));
  };

  const addServiceKey = (serviceKey: string) => {
    setEditData((prev: any) => ({
      ...prev,
      [serviceKey]: {
        ...prev[serviceKey],
        keys: [...prev[serviceKey].keys, { text: '' }],
      },
    }));
  };

  const removeServiceKey = (serviceKey: string, keyIndex: number) => {
    setEditData((prev: any) => ({
      ...prev,
      [serviceKey]: {
        ...prev[serviceKey],
        keys: prev[serviceKey].keys.filter((_: any, index: number) => index !== keyIndex),
      },
    }));
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-500">Error loading energy data</div>;
  if (!energy || !editData) return <div>No energy data found</div>;

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="btn btn-outline-primary btn-sm"
          >
            <IconArrowBackward className="w-4 h-4" />
            Back
          </button>
          <h5 className="font-semibold text-lg">Energy Management</h5>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="btn btn-primary btn-sm"
            >
              <IconEdit className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="btn btn-success btn-sm"
                disabled={updateMutation.isPending}
              >
                <IconCheck className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-danger btn-sm"
              >
                <IconX className="w-4 h-4" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="panel">
          <h6 className="text-lg font-semibold mb-4">Header Information</h6>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Headline</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-input"
                  value={editData.headline}
                  onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                />
              ) : (
                <p className="text-lg font-bold">{energy.headline}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subheadline</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-input"
                  value={editData.subheadline}
                  onChange={(e) => setEditData({ ...editData, subheadline: e.target.value })}
                />
              ) : (
                <p className="text-gray-600">{energy.subheadline}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Call to Action</label>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">CTA Text</label>
                    <input
                      type="text"
                      placeholder="CTA Text"
                      className="form-input"
                      value={editData.cta.text}
                      onChange={(e) => setEditData({
                        ...editData,
                        cta: { ...editData.cta, text: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Link Type</label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="ctaLinkType"
                          value="navigation"
                          checked={ctaLinkType === 'navigation'}
                          onChange={() => setCtaLinkType('navigation')}
                          className="form-radio"
                        />
                        <span className="ml-2">Navigation Item</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="ctaLinkType"
                          value="external"
                          checked={ctaLinkType === 'external'}
                          onChange={() => setCtaLinkType('external')}
                          className="form-radio"
                        />
                        <span className="ml-2">External URL</span>
                      </label>
                    </div>
                    {ctaLinkType === 'navigation' ? (
                      <select
                        className="form-select"
                        value={editData.cta.href}
                        onChange={(e) => setEditData({
                          ...editData,
                          cta: { ...editData.cta, href: e.target.value }
                        })}
                      >
                        <option value="">Select navigation item...</option>
                        {allNavItems.map((item: any) => (
                          <option key={item.id} value={item.slug}>
                            {item.displayName} - {item.slug}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="https://example.com or /custom-path"
                        className="form-input"
                        value={editData.cta.href}
                        onChange={(e) => setEditData({
                          ...editData,
                          cta: { ...editData.cta, href: e.target.value }
                        })}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <a href={energy.cta.href} className="btn btn-primary">
                  {energy.cta.text}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['service1', 'service2', 'service3', 'service4'].map((serviceKey) => {
            const service = isEditing ? editData[serviceKey] : energy[serviceKey as keyof typeof energy] as EnergyService;
            
            return (
              <div key={serviceKey} className="panel">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Service Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-input"
                      value={service.title}
                      onChange={(e) => updateService(serviceKey, 'title', e.target.value)}
                    />
                  ) : (
                    <h6 className="text-lg font-semibold">{service.title}</h6>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Short Description</label>
                  {isEditing ? (
                    <textarea
                      className="form-textarea"
                      rows={2}
                      value={service.shortDescription}
                      onChange={(e) => updateService(serviceKey, 'shortDescription', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{service.shortDescription}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  {isEditing ? (
                    <textarea
                      className="form-textarea"
                      rows={4}
                      value={service.description}
                      onChange={(e) => updateService(serviceKey, 'description', e.target.value)}
                    />
                  ) : (
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: service.description }}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Key Points</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {service.keys.map((key: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            className="form-input flex-1"
                            value={key.text}
                            onChange={(e) => updateServiceKey(serviceKey, index, e.target.value)}
                          />
                          <button
                            onClick={() => removeServiceKey(serviceKey, index)}
                            className="btn btn-danger btn-sm"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addServiceKey(serviceKey)}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Add Key Point
                      </button>
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {service.keys.map((key: any, index: number) => (
                        <li key={index} className="text-sm">{key.text}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}