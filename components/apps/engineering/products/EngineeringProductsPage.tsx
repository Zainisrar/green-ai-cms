'use client';

import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconPlus from '@/components/icon/icon-plus';
import Loading from '@/components/layouts/loading';
import Link from 'next/link';
import DeleteModal from '../../modals/DeleteModal';
import { useEngineeringProducts, useDeleteEngineeringProduct } from './hooks/useEngineeringProducts';
import { EngineeringProduct } from '@/db/schema';

const EngineeringProductsPage = () => {
    const { data: products, isLoading, error, isError } = useEngineeringProducts();
    const { mutate: deleteProduct, isPending: isDeleting } = useDeleteEngineeringProduct();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [items, setItems] = useState<EngineeringProduct[]>([]);
    const [initialRecords, setInitialRecords] = useState<EngineeringProduct[]>([]);
    const [recordsData, setRecordsData] = useState<EngineeringProduct[]>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        if (products && Array.isArray(products)) {
            setItems(products);
        } else {
            setItems([]);
        }
    }, [products]);

    useEffect(() => {
        const filtered = items.filter((item: EngineeringProduct) => {
            return (
                item.id.toString().includes(search.toLowerCase()) ||
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase())
            );
        });
        const sorted = sortBy(filtered, sortStatus.columnAccessor);
        const finalData = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
        setInitialRecords(finalData);
        setPage(1);
    }, [items, search, sortStatus]);

    const handleDelete = () => {
        if (selectedProductId !== null) {
            deleteProduct(selectedProductId);
            setIsDeleteModalOpen(false);
            setSelectedProductId(null);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-10">
                    <p className="text-red-500">Error loading products: {error?.message}</p>
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

    return (
        <React.Fragment>
            <div className="flex justify-end">
                <Link href="/apps/engineering/products/add" className="btn btn-primary">
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add New Product
                </Link>
            </div>
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Engineering Products</h5>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input 
                            type="text" 
                            className="form-input w-auto" 
                            placeholder="Search products..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className={`${isRtl ? 'table-hover whitespace-nowrap' : 'table-hover whitespace-nowrap'}`}
                        records={recordsData}
                        columns={[
                            { accessor: 'id', title: 'ID', sortable: true, width: 80 },
                            { 
                                accessor: 'title', 
                                title: 'TITLE', 
                                sortable: true,
                                render: (record: EngineeringProduct) => (
                                    <div className="font-semibold">{record.title}</div>
                                )
                            },
                            { 
                                accessor: 'description', 
                                title: 'DESCRIPTION', 
                                sortable: true,
                                render: (record: EngineeringProduct) => (
                                    <div className="max-w-xs truncate" title={record.description}>
                                        {record.description}
                                    </div>
                                )
                            },
                            { 
                                accessor: 'images', 
                                title: 'IMAGES', 
                                sortable: false,
                                render: (record: EngineeringProduct) => (
                                    <div className="flex items-center space-x-2">
                                        {record.imgs && record.imgs.length > 0 ? (
                                            <>
                                                <img 
                                                    src={record.imgs[0].src} 
                                                    alt={record.imgs[0].alt}
                                                    className="w-10 h-10 object-cover rounded"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                    }}
                                                />
                                                {record.imgs.length > 1 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{record.imgs.length - 1} more
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-gray-400 text-sm">No images</span>
                                        )}
                                    </div>
                                )
                            },
                            { 
                                accessor: 'keys', 
                                title: 'FEATURES', 
                                sortable: false,
                                render: (record: EngineeringProduct) => (
                                    <div className="flex items-center space-x-2">
                                        {record.keys && record.keys.length > 0 ? (
                                            <>
                                                {record.keys[0]?.icon?.src && (
                                                    <img 
                                                        src={record.keys[0].icon.src} 
                                                        alt={record.keys[0].icon.alt || 'Feature icon'}
                                                        className="w-6 h-6 object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                        }}
                                                    />
                                                )}
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                    {record.keys.length} feature{record.keys.length !== 1 ? 's' : ''}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400">No features</span>
                                        )}
                                    </div>
                                )
                            },
                            { 
                                accessor: 'ctaButton', 
                                title: 'CTA', 
                                sortable: false,
                                render: (record: EngineeringProduct) => (
                                    <div className="text-sm">
                                        {record.ctaButton && record.ctaButton.text ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                {record.ctaButton.text}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">No CTA</span>
                                        )}
                                    </div>
                                )
                            },
                            {
                                accessor: 'actions',
                                title: 'ACTIONS',
                                sortable: false,
                                textAlignment: 'center',
                                render: (record: EngineeringProduct) => (
                                    <div className="mx-auto flex w-max items-center gap-3">
                                        <Link 
                                            href={`/apps/engineering/products/edit/${record.id}`} 
                                            className="flex hover:text-info"
                                            title="Edit Product"
                                        >
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </Link>
                                        <button 
                                            type="button" 
                                            className="flex hover:text-danger" 
                                            title="Delete Product"
                                            onClick={() => {
                                                setSelectedProductId(record.id);
                                                setIsDeleteModalOpen(true);
                                            }}
                                        >
                                            <IconTrashLines className="h-4.5 w-4.5" />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => 
                            `Showing ${from} to ${to} of ${totalRecords} entries`
                        }
                    />
                </div>
            </div>
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedProductId(null);
                }}
                title="Delete Product"
                description="Are you sure you want to delete this product? This action cannot be undone."
                onDelete={handleDelete}
            />
        </React.Fragment>
    );
};

export default EngineeringProductsPage;