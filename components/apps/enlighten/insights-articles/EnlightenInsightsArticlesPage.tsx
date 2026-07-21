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
import { useEnlightenInsightsArticles, useDeleteEnlightenInsightsArticle } from './hooks/useEnlightenInsightsArticles';
import { EnlightenInsightsArticle } from '@/db/schema';

const EnlightenInsightsArticlesPage = () => {
    const { data: articles, isLoading, error, isError } = useEnlightenInsightsArticles();
    const { mutate: deleteArticle } = useDeleteEnlightenInsightsArticle();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [items, setItems] = useState<EnlightenInsightsArticle[]>([]);
    const [initialRecords, setInitialRecords] = useState<EnlightenInsightsArticle[]>([]);
    const [recordsData, setRecordsData] = useState<EnlightenInsightsArticle[]>([]);

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
        if (articles && Array.isArray(articles)) {
            setItems(articles);
        } else {
            setItems([]);
        }
    }, [articles]);

    useEffect(() => {
        const filtered = items.filter((item: EnlightenInsightsArticle) => {
            return (
                item.id.toString().includes(search.toLowerCase()) ||
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase()) ||
                item.slug.toLowerCase().includes(search.toLowerCase())
            );
        });
        const sorted = sortBy(filtered, sortStatus.columnAccessor);
        const finalData = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
        setInitialRecords(finalData);
        setPage(1);
    }, [items, search, sortStatus]);

    const handleDelete = () => {
        if (selectedArticleId !== null) {
            deleteArticle(selectedArticleId);
            setIsDeleteModalOpen(false);
            setSelectedArticleId(null);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-10">
                    <p className="text-red-500">Error loading articles: {error?.message}</p>
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
                <Link href="/enlighten/insights-articles/add" className="btn btn-primary">
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add New Article
                </Link>
            </div>
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Enlighten Insights Articles</h5>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input 
                            type="text" 
                            className="form-input w-auto" 
                            placeholder="Search articles..." 
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
                                render: (record: EnlightenInsightsArticle) => (
                                    <div className="font-semibold">{record.title}</div>
                                )
                            },
                            { 
                                accessor: 'description', 
                                title: 'DESCRIPTION', 
                                sortable: true,
                                render: (record: EnlightenInsightsArticle) => (
                                    <div className="max-w-xs truncate" title={record.description}>
                                        {record.description}
                                    </div>
                                )
                            },
                            { 
                                accessor: 'slug', 
                                title: 'SLUG', 
                                sortable: true,
                                render: (record: EnlightenInsightsArticle) => (
                                    <div className="text-sm text-gray-600 font-mono">
                                        {record.slug}
                                    </div>
                                )
                            },
                            { 
                                accessor: 'featuredImg', 
                                title: 'FEATURED IMAGE', 
                                sortable: false,
                                render: (record: EnlightenInsightsArticle) => (
                                    <div className="flex items-center space-x-2">
                                        {record.featuredImg && record.featuredImg.src ? (
                                            <img 
                                                src={record.featuredImg.src} 
                                                alt={record.featuredImg.alt}
                                                className="w-10 h-10 object-cover rounded"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-sm">No image</span>
                                        )}
                                    </div>
                                )
                            },
                            { 
                                accessor: 'cta', 
                                title: 'CTA', 
                                sortable: false,
                                render: (record: EnlightenInsightsArticle) => (
                                    <div className="text-sm">
                                        {record.cta && record.cta.text ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                {record.cta.text}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">No CTA</span>
                                        )}
                                    </div>
                                )
                            },
                            { 
                                accessor: 'quote', 
                                title: 'QUOTE', 
                                sortable: false,
                                render: (record: EnlightenInsightsArticle) => (
                                    <div className="text-sm max-w-xs">
                                        {record.quote && record.quote.text ? (
                                            <div className="truncate" title={record.quote.text}>
                                                "{record.quote.text}"
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">No quote</span>
                                        )}
                                    </div>
                                )
                            },
                            {
                                accessor: 'actions',
                                title: 'ACTIONS',
                                sortable: false,
                                textAlignment: 'center',
                                render: (record: EnlightenInsightsArticle) => (
                                    <div className="mx-auto flex w-max items-center gap-3">
                                        <Link 
                                            href={`/enlighten/insights-articles/edit/${record.id}`} 
                                            className="flex hover:text-info"
                                            title="Edit Article"
                                        >
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </Link>
                                        <button 
                                            type="button" 
                                            className="flex hover:text-danger" 
                                            title="Delete Article"
                                            onClick={() => {
                                                setSelectedArticleId(record.id);
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
                    setSelectedArticleId(null);
                }}
                title="Delete Article"
                description="Are you sure you want to delete this article? This action cannot be undone."
                onDelete={handleDelete}
            />
        </React.Fragment>
    );
};

export default EnlightenInsightsArticlesPage;