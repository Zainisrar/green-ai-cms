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
import { useNavigationList } from './hooks/useNavigationList';
import { useDeleteNavigation } from './hooks/useDeleteNavigation';
import { NavItem } from '@/lib/api/navigation';

// NavItem interface is now imported from API layer

// Flat row shape for the table
interface NavRow {
    id: number;
    name: string;
    slug: string;
    top?: boolean;
    accessor?: string;
}

// Helper: flatten hierarchical navigation into a flat array of rows
const flattenNav = (items: NavItem[] = []): NavRow[] => {
    const out: NavRow[] = [];
    const walk = (nodes: NavItem[]) => {
        if (!nodes || !Array.isArray(nodes)) return;
        
        for (const n of nodes) {
            // Skip if node is null, undefined, or doesn't have required properties
            if (!n || typeof n.id === 'undefined' || !n.name || !n.slug) {
                continue;
            }
            
            out.push({
                id: n.id,
                name: n.name,
                slug: n.slug,
                top: n.top ?? false,
                accessor: n.accessor ?? n.accesor,
            });
            if (n.children && Array.isArray(n.children) && n.children.length) {
                walk(n.children);
            }
        }
    };
    walk(items);
    return out;
};
const Navigation = () => {
    const { data: rowData, isLoading, error, isError } = useNavigationList();
    const { mutate: deleteNavigation, isPending: isDeleting } = useDeleteNavigation();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    // Keep a mutable source list so delete actions can update the table
    const [items, setItems] = useState<NavRow[]>([]);
    const [initialRecords, setInitialRecords] = useState<NavRow[]>([]);
    const [recordsData, setRecordsData] = useState<NavRow[]>([]);

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

    // When API data arrives, flatten and sync to items
    useEffect(() => {
        if (rowData && Array.isArray(rowData)) {
            const flattened = flattenNav(rowData);
            setItems(flattened);
        } else {
            setItems([]);
        }
    }, [rowData]);

    // Update filtered/sorted data when items, search, or sort changes
    useEffect(() => {
        const filtered = items.filter((item: any) => {
            return item.id.toString().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase()) || item.slug.toLowerCase().includes(search.toLowerCase());
        });
        const sorted = sortBy(filtered, sortStatus.columnAccessor);
        const finalData = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
        setInitialRecords(finalData);
        setPage(1);
    }, [items, search, sortStatus]);

    const handleDelete = () => {
        if (selectedRowId !== null) {
            deleteNavigation(selectedRowId.toString());
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
                    <p className="text-red-500">Error loading navigation data: {error?.message}</p>
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
                    <Link href="/navigation/add" className="btn btn-primary">
                        Add New Navigation
                    </Link>
                </div>
                <div className="panel mt-6">
                    <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                        <h5 className="text-lg font-semibold dark:text-white-light">Navigation Management</h5>
                        <div className="ltr:ml-auto rtl:mr-auto">
                            <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="datatables">
                        <DataTable
                            highlightOnHover
                            className={`${isRtl ? 'table-hover whitespace-nowrap' : 'table-hover whitespace-nowrap'}`}
                            records={recordsData}
                            columns={[
                                { accessor: 'id', title: 'ID', sortable: true },
                                { accessor: 'name', title: 'NAME', sortable: true },
                                { accessor: 'slug', title: 'SLUG', sortable: true },
                                { accessor: 'topLevel', title: 'TOP LEVEL', sortable: false, render: (record: any) => <div>{record.top ? 'true' : 'false'}</div> },
                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    sortable: false,
                                    textAlignment: 'center',
                                    render: (record: any) => (
                                        <div className="mx-auto flex w-max items-center gap-3">
                                            <Link href={'/navigation/edit/' + record.id} className="flex hover:text-info">
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </Link>
                                            <button type="button" className="flex hover:text-danger" onClick={() => {
                                                setSelectedRowId(record.id);
                                                setIsDeleteModalOpen(true);
                                            }}>
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
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                </div>
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedRowId(null);
                    }}
                    title="Delete"
                    description="Are you sure you want to delete this navigation item?"
                    onDelete={handleDelete}
                />
            </React.Fragment>
        );
};

export default Navigation;
