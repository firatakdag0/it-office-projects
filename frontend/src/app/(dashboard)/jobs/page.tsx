'use client';

import { useState } from 'react';
import useSWR from 'swr';
import axios from '@/lib/axios';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import {
    PlusIcon,
    BriefcaseIcon,
    CalendarIcon,
    MapPinIcon,
    UserIcon,
    Squares2X2Icon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function JobsPage() {
    const { user } = useAuth({ middleware: 'auth' });
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const { data: jobs } = useSWR(statusFilter ? `/jobs?status=${statusFilter}` : '/jobs', fetcher);

    const statuses = [
        { id: '', name: 'Tümü' },
        { id: 'pending', name: 'Beklemede' },
        { id: 'traveling', name: 'Yolda' },
        { id: 'working', name: 'İşlemde' },
        { id: 'completed', name: 'Tamamlandı' },
        { id: 'cancelled', name: 'İptal Edilenler' },
    ];

    if (!jobs) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
    );

    // Pagination Logic
    const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);
    const paginatedJobs = jobs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page on filter change
    const handleStatusFilter = (statusId: string) => {
        setStatusFilter(statusId);
        setCurrentPage(1);
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20 p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">İş Listesi</h1>
                    <p className="mt-1 text-xs text-slate-500 font-medium">
                        {user?.role === 'manager'
                            ? 'Servis taleplerini yönetin.'
                            : 'Atanan görevlerinizi görüntüleyin.'}
                    </p>
                </div>
                {(user?.role === 'manager' || user?.permissions?.includes('create_jobs')) && (
                    <Link href="/jobs/create" className="w-full md:w-auto">
                        <Button
                            variant="orange"
                            className="h-10 px-5 rounded-lg font-bold text-xs shadow-sm hover:shadow-md transition-all w-full md:w-auto"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Yeni İş
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="mb-8 -mx-4 px-4 overflow-x-auto pb-4 scrollbar-hide lg:m-0 lg:p-0">
                <nav className="flex space-x-3" aria-label="Tabs">
                    {statuses.map((status) => (
                        <button
                            key={status.name}
                            onClick={() => handleStatusFilter(status.id)}
                            className={`
                                px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap border
                                ${statusFilter === status.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 scale-105'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-600'
                                }
                            `}
                        >
                            {status.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedJobs.map((job: any) => (
                    <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 block p-5"
                    >
                        {/* Status Badge & ID */}
                        <div className="flex justify-between items-center mb-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${getStatusColor(job.status, 'badge')}`}>
                                {getStatusLabel(job.status)}
                            </span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{job.id}</span>
                        </div>

                        {/* Customer & Type */}
                        <div className="mb-4">
                            <h3 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors leading-tight" title={job.customer?.name}>
                                {job.customer?.name}
                            </h3>
                            <div className="flex items-center mt-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 ${getJobTypeColor(job.type)}`}>
                                    {getJobTypeLabel(job.type)}
                                </span>
                            </div>
                        </div>

                        {/* Description Preview */}
                        <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-6 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50 leading-relaxed italic">
                            {job.description}
                        </p>

                        {/* Footer Info */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                                {new Date(job.created_at).toLocaleDateString('tr-TR')}
                            </div>

                            {/* Region or Assignee Tiny Avatar */}
                            {job.assignee ? (
                                <div className="flex items-center" title={`Atanan: ${job.assignee.name}`}>
                                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-black text-orange-600 border border-orange-200 shadow-sm group-hover:scale-110 transition-transform">
                                        {job.assignee.name[0].toUpperCase()}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                                    {job.customer?.region?.name || '-'}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center space-x-1">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${currentPage === page
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-600'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRightIcon className="h-4 w-4" />
                    </button>
                </div>
            )}

            {paginatedJobs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 mt-4">
                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BriefcaseIcon className="h-6 w-6 text-slate-300" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">İş kaydı bulununamadı</h3>
                    <p className="text-xs text-slate-500 mt-1">Filtre kriterlerinizi kontrol edin.</p>
                </div>
            )}
        </div>
    );
}

// Helpers
function getStatusColor(status: string, type: 'icon' | 'badge' | 'dot') {
    const colors = {
        pending: {
            icon: 'bg-yellow-50 text-yellow-500',
            badge: 'bg-yellow-50 text-yellow-600 border-yellow-100',
            dot: 'bg-yellow-500'
        },
        traveling: {
            icon: 'bg-blue-50 text-blue-500',
            badge: 'bg-blue-50 text-blue-600 border-blue-100',
            dot: 'bg-blue-500'
        },
        working: {
            icon: 'bg-indigo-50 text-indigo-500',
            badge: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            dot: 'bg-indigo-500'
        },
        completed: {
            icon: 'bg-green-50 text-green-500',
            badge: 'bg-green-50 text-green-600 border-green-100',
            dot: 'bg-green-500'
        },
        cancelled: {
            icon: 'bg-red-50 text-red-500',
            badge: 'bg-red-50 text-red-600 border-red-100',
            dot: 'bg-red-500'
        }
    };
    // @ts-ignore
    return colors[status]?.[type] || (type === 'icon' ? 'bg-slate-50 text-slate-400' : type === 'badge' ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-slate-400');
}

function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
        pending: 'Beklemede',
        traveling: 'Yolda',
        working: 'İşlemde',
        completed: 'Tamamlandı',
        cancelled: 'İptal Edildi',
    };
    return labels[status] || status;
}

function getJobTypeLabel(type: string) {
    const labels: Record<string, string> = {
        support: 'Teknik Destek',
        camera: 'Kamera Sistemleri',
        cabling: 'Kablolama',
    };
    return labels[type] || type;
}

function getJobTypeColor(type: string) {
    const colors: Record<string, string> = {
        support: 'text-orange-600',
        camera: 'text-blue-600',
        cabling: 'text-indigo-600',
    };
    return colors[type] || 'text-slate-500';
}
