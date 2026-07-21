'use client';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import Loading from '@/components/layouts/loading';
import Link from 'next/link';
import React from 'react';
import { useNavigationItem } from './hooks/useNavigationItem';
import { useUpdateNavigation } from './hooks/useUpdateNavigation';
import { navigationApi } from '@/lib/api/navigation';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface Props {
    id: string;
}

const DynamicNavigation = ({ id }: Props) => {
    const router = useRouter();
    const { data: resData, isLoading, error, isError } = useNavigationItem({ id });
    const { mutate: updateNavigation, isPending, error: updateError, isSuccess } = useUpdateNavigation();
    const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
    const [formError, setFormError] = React.useState<string | null>(null);
    const imageInputRef = React.useRef<HTMLInputElement>(null);

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
                title: 'Navigation item updated successfully!'
            });
            router.push('/apps/navigation');
        }
    }, [isSuccess, router]);

    const handleImageUpload = async (file: File) => {
        try {
            return await navigationApi.uploadImage(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        
        if (!resData) return;
        
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const name = formData.get('name') as string;
            const slug = formData.get('slug') as string;
            const textDescription = formData.get('text_description') as string;
            const textHighlighted = formData.get('text_highlighted') as string;
            const imageAlt = formData.get('image_alt') as string;

            let imageData = '';
            
            // Handle image upload if not top level
            if (!resData.top) {
                if (selectedImage) {
                    try {
                        const uploadResult = await handleImageUpload(selectedImage);
                        imageData = JSON.stringify({
                            src: uploadResult.url,
                            alt: imageAlt || ''
                        });
                    } catch (uploadError) {
                        setFormError('Failed to upload image. Please try again.');
                        return;
                    }
                } else {
                    imageData = JSON.stringify({
                        src: resData.image?.src ?? '',
                        alt: imageAlt || resData.image?.alt || ''
                    });
                }
            }

            const navigationData = {
                name,
                slug,
                top: resData.top,
                ...(resData.top ? {} : {
                    text_description: textDescription,
                    text_highlighted: textHighlighted,
                    image: imageData
                })
            };

            updateNavigation({ id, data: navigationData });
        } catch (error) {
            console.error('Error submitting form:', error);
            setFormError('An unexpected error occurred. Please try again.');
        }
    };

    if (isLoading) return <Loading />;
    
    if (isError) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-10">
                    <p className="text-red-500">Error loading navigation item: {error?.message}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn btn-primary mt-4"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    
    if (!resData) return <Loading />;

    return (
        <React.Fragment>
            <div className="text-4xl mb-10 font-bold flex space-x-4 items-center">
                <Link href="/apps/navigation" className="cursor-pointer ">
                    <IconArrowBackward width={30} />
                </Link>
                <div>Edit</div>
            </div>
            <form onSubmit={handleSubmit}>
                {(formError || updateError) && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {formError || updateError?.message}
                    </div>
                )}
                
                <div className="flex space-x-8 justify-between">
                    <div className="w-full">
                        <label htmlFor="nav-item-name">Name</label>
                        <input 
                            type="text" 
                            id="nav-item-name" 
                            name="name"
                            defaultValue={resData.name} 
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
                            defaultValue={resData.slug} 
                            placeholder="/explore" 
                            className="form-input" 
                            required 
                        />
                    </div>
                </div>

                <div className="flex space-x-8 my-4 justify-between">
                    {resData.top ? (
                        <div className="w-full">
                            <label htmlFor="nav-item-top">Top</label>
                            <input type="text" id="nav-item-top" defaultValue={resData.top ? 'Yes' : 'No'} placeholder="Yes/No" className="form-input" required />
                        </div>
                    ) : (
                        <div className="w-full">
                            <label htmlFor="nav-item-description">Text Description</label>
                            <input 
                                type="text" 
                                id="nav-item-description" 
                                name="text_description"
                                defaultValue={resData.text?.description ?? ''} 
                                placeholder="Description" 
                                className="form-input" 
                                required 
                            />
                        </div>
                    )}
                </div>

                {!resData.top && (
                    <>
                        <div className="flex space-x-8 my-4 justify-between">
                            <div className="w-full">
                                <label htmlFor="nav-item-highlight">Highlighted Text</label>
                                <input 
                                    type="text" 
                                    id="nav-item-highlight" 
                                    name="text_highlighted"
                                    defaultValue={resData.text?.highlighted ?? ''} 
                                    placeholder="Highlighted Text" 
                                    className="form-input" 
                                    required 
                                />
                            </div>

                            <div className="w-full">
                                <label htmlFor="nav-item-image">Image</label>
                                {resData.image && !selectedImage ? (
                                    <div className="flex space-x-2 items-center">
                                        <img src={resData.image.src} alt={resData.image.alt} className="w-72 rounded-lg" />
                                        <div className="cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                                            <IconEdit width={24} />
                                            <input type="file" accept="image/*" id="nav-item-image" className="hidden" ref={imageInputRef} onChange={handleImageChange} />
                                        </div>
                                    </div>
                                ) : selectedImage ? (
                                    <div className="flex space-x-2 ">
                                        <img src={URL.createObjectURL(selectedImage)} alt="Uploaded Image" className="w-72 rounded-lg" />
                                        <div
                                            onClick={() => {
                                                setSelectedImage(null);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <IconTrash />
                                        </div>
                                    </div>
                                ) : (
                                    <input type="file" id="nav-item-image" className="form-input" ref={imageInputRef} onChange={handleImageChange} />
                                )}
                            </div>
                        </div>

                        <div className="w-full mt-4">
                            <label htmlFor="nav-item-image-alt">Image Alt Text</label>
                            <input 
                                type="text" 
                                id="nav-item-image-alt" 
                                name="image_alt"
                                defaultValue={resData.image?.alt ?? ''} 
                                placeholder="Image Alt Text" 
                                className="form-input" 
                                required 
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
                        {isPending ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </React.Fragment>
    );
};

export default DynamicNavigation;
