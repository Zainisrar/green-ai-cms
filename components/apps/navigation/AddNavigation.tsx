'use client';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconTrash from '@/components/icon/icon-trash';
import Link from 'next/link';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateNavigation } from './hooks/useCreateNavigation';
import { navigationApi } from '@/lib/api/navigation';
import Swal from 'sweetalert2';

const AddNavigation = () => {
    const router = useRouter();
    const { mutate: createNavigation, isPending, isSuccess, error } = useCreateNavigation();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isTopLevel, setIsTopLevel] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Handle success
    React.useEffect(() => {
        if (isSuccess) {
            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            toast.fire({
                icon: 'success',
                title: 'Navigation item created successfully!'
            });
            router.push('/apps/navigation');
        }
    }, [isSuccess, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const name = formData.get('name') as string;
            const slug = formData.get('slug') as string;
            const textDescription = formData.get('text_description') as string;
            const textHighlighted = formData.get('text_highlighted') as string;
            const imageAlt = formData.get('image_alt') as string;

            let imageData = '';
            
            // Handle image upload if not top level and image is selected
            if (!isTopLevel && selectedImage) {
                try {
                    const uploadResult = await navigationApi.uploadImage(selectedImage);
                    imageData = JSON.stringify({
                        src: uploadResult.url,
                        alt: imageAlt || ''
                    });
                } catch (uploadError) {
                    setFormError('Failed to upload image. Please try again.');
                    return;
                }
            }

            const navigationData = {
                name,
                slug,
                top: isTopLevel,
                ...(isTopLevel ? {} : {
                    text_description: textDescription,
                    text_highlighted: textHighlighted,
                    image: imageData
                })
            };

            createNavigation(navigationData);
        } catch (error) {
            console.error('Error submitting form:', error);
            setFormError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <React.Fragment>
            <div className="text-4xl mb-10 font-bold flex space-x-4 items-center">
                <Link href="/apps/navigation" className="cursor-pointer">
                    <IconArrowBackward width={30} />
                </Link>
                <div>Add New Navigation</div>
            </div>
            
            <form onSubmit={handleSubmit}>
                {(formError || error) && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {formError || error?.message}
                    </div>
                )}
                
                <div className="flex space-x-8 justify-between">
                    <div className="w-full">
                        <label htmlFor="nav-item-name">Name</label>
                        <input 
                            type="text" 
                            id="nav-item-name"
                            name="name"
                            placeholder="Explore..." 
                            className="form-input" 
                            required 
                        />
                    </div>

                    <div className="w-full">
                        <label htmlFor="nav-item-slug">Slug</label>
                        <input 
                            type="text" 
                            id="nav-item-slug"
                            name="slug"
                            placeholder="/explore" 
                            className="form-input" 
                            required 
                        />
                    </div>
                </div>

                <div className="flex space-x-8 my-4 justify-between">
                    <div className="w-full">
                        <label htmlFor="nav-item-top">Top Level Navigation</label>
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                id="nav-item-top"
                                checked={isTopLevel}
                                onChange={(e) => setIsTopLevel(e.target.checked)}
                                className="form-checkbox"
                            />
                            <label htmlFor="nav-item-top" className="ml-2">
                                This is a top-level navigation item
                            </label>
                        </div>
                    </div>
                </div>

                {!isTopLevel && (
                    <>
                        <div className="flex space-x-8 my-4 justify-between">
                            <div className="w-full">
                                <label htmlFor="nav-item-description">Text Description</label>
                                <input 
                                    type="text" 
                                    id="nav-item-description"
                                    name="text_description"
                                    placeholder="Description" 
                                    className="form-input" 
                                    required={!isTopLevel}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-8 my-4 justify-between">
                            <div className="w-full">
                                <label htmlFor="nav-item-highlight">Highlighted Text</label>
                                <input 
                                    type="text" 
                                    id="nav-item-highlight"
                                    name="text_highlighted"
                                    placeholder="Highlighted Text" 
                                    className="form-input" 
                                    required={!isTopLevel}
                                />
                            </div>

                            <div className="w-full">
                                <label htmlFor="nav-item-image">Image</label>
                                {selectedImage ? (
                                    <div className="flex space-x-2">
                                        <img 
                                            src={URL.createObjectURL(selectedImage)} 
                                            alt="Selected Image" 
                                            className="w-72 rounded-lg" 
                                        />
                                        <div
                                            onClick={() => setSelectedImage(null)}
                                            className="cursor-pointer"
                                        >
                                            <IconTrash />
                                        </div>
                                    </div>
                                ) : (
                                    <input 
                                        type="file" 
                                        id="nav-item-image" 
                                        className="form-input" 
                                        ref={imageInputRef} 
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        required={!isTopLevel}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="w-full mt-4">
                            <label htmlFor="nav-item-image-alt">Image Alt Text</label>
                            <input 
                                type="text" 
                                id="nav-item-image-alt"
                                name="image_alt"
                                placeholder="Image Alt Text" 
                                className="form-input" 
                                required={!isTopLevel && !!selectedImage}
                            />
                        </div>
                    </>
                )}

                <div className="flex justify-center my-20">
                    <button 
                        type="submit" 
                        className="btn btn-primary text-xl px-20 rounded-full font-bold mt-6"
                        disabled={isPending}
                    >
                        {isPending ? 'Creating...' : 'Create Navigation'}
                    </button>
                </div>
            </form>
        </React.Fragment>
    );
};

export default AddNavigation;