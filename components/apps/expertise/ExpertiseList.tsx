'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import Loading from '@/components/layouts/loading';
import Link from 'next/link';
import DeleteModal from '../modals/DeleteModal';
import { useExpertiseList } from './hooks/useExpertiseList';
import { useDeleteExpertise } from './hooks/useDeleteExpertise';
import { ExpertiseData } from '@/lib/api/expertise';

const ExpertiseList = () => {
    const { data: expertiseData, isLoading, error, isError } = useExpertiseList();
    const { mutate: deleteExpertise, isPending: isDeleting } = useDeleteExpertise();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [items, setItems] = useState<ExpertiseData[]>([]);
    const [initialRecords, setInitialRecords] = useState<ExpertiseData[]>([]);
    const [recordsData, setRecordsData] = useState<ExpertiseData[]>([]);

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

    // When API data arrives, sync to items
    useEffect(() => {
        if (expertiseData && Array.isArray(expertiseData)) {
            setItems(expertiseData);
        } else {
            setItems([]);
        }
    }, [expertiseData]);

    // Update filtered/sorted data when items, search, or sort changes
    useEffect(() => {
        const filtered = items.filter((item) => {
            return (
                item.id?.toString().includes(search.toLowerCase()) ||
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
                item.slug.toLowerCase().includes(search.toLowerCase())
            );
        });
        const sorted = sortBy(filtered, sortStatus.columnAccessor);
        const finalData = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
        setInitialRecords(finalData);
        setPage(1);
    }, [items, search, sortStatus]);

    const handleDelete = () => {
        if (selectedRowId !== null) {
            deleteExpertise(selectedRowId.toString());
            setIsDeleteModalOpen(false);
            setSelectedRowId(null);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-10">
                    <p className="text-red-500">Error loading expertise data: {error?.message}</p>
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
                <Link href="/expertise/add" className="btn btn-primary">
                    Add New Expertise
                </Link>
            </div>
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Expertise</h5>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input 
                            type="text" 
                            className="form-input w-auto" 
                            placeholder="Search..." 
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
                            { accessor: 'id', title: 'ID', sortable: true },
                            { 
                                accessor: 'title', 
                                title: 'TITLE', 
                                sortable: true,
                                render: (record) => (
                                    <div className="font-semibold">{record.title}</div>
                                )
                            },
                            { 
                                accessor: 'subtitle', 
                                title: 'SUBTITLE', 
                                sortable: true,
                                render: (record) => (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {record.subtitle}
                                    </div>
                                )
                            },
                            { 
                                accessor: 'highlighted', 
                                title: 'HIGHLIGHTED', 
                                sortable: false,
                                render: (record) => (
                                    <span className="badge bg-primary text-white px-2 py-1 rounded">
                                        {record.highlighted}
                                    </span>
                                )
                            },
                            { 
                                accessor: 'slug', 
                                title: 'SLUG', 
                                sortable: true,
                                render: (record) => (
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {record.slug}
                                    </span>
                                )
                            },
                            {
                                accessor: 'actions',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: (record) => (
                                    <div className="mx-auto flex w-max items-center gap-3">
                                        <Link 
                                            href={`/expertise/edit/${record.id}`} 
                                            className="flex hover:text-info"
                                        >
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </Link>
                                        <button 
                                            type="button" 
                                            className="flex hover:text-danger" 
                                            onClick={() => {
                                                setSelectedRowId(record.id!);
                                                setIsDeleteModalOpen(true);
                                            }}
                                        >
                                            <IconTrashLines />
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
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedRowId(null);
                }}
                title="Delete Expertise"
                description="Are you sure you want to delete this expertise entry?"
                onDelete={handleDelete}
            />
        </React.Fragment>
    );
};

export default ExpertiseList;