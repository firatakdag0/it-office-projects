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
        <div className="animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">İş Listesi</h1>
                    <p className="mt-1 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                        {user?.role === 'manager'
                            ? 'Tüm servis taleplerini ve durumlarını buradan yönetebilirsiniz.'
                            : 'Size atanan görevleri ve detaylarını görüntüleyin.'}
                    </p>
                </div>
                {user?.role === 'manager' && (
                    <Link href="/jobs/create" className="w-fit">
                        <Button
                            variant="orange"
                            className="h-11 px-6 rounded-xl font-black text-xs scale-100 hover:scale-105 active:scale-95 transition-all"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            YENİ İŞ OLUŞTUR
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <nav className="flex space-x-2" aria-label="Tabs">
                    {statuses.map((status) => (
                        <button
                            key={status.name}
                            onClick={() => handleStatusFilter(status.id)}
                            className={`
                                px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300
                                ${statusFilter === status.id
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-100 scale-105'
                                    : 'bg-white border border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-600'
                                }
                            `}
                        >
                            {status.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedJobs.map((job: any) => (
                    <div
                        key={job.id}
                        className="group bg-white/80 backdrop-blur-sm rounded-3xl border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                    >
                        <div className="p-6 flex-1">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border border-white/50 shadow-inner group-hover:rotate-6 transition-transform ${getStatusColor(job.status, 'icon')}`}>
                                        {getJobIcon(job.type)}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1" title={job.customer?.name}>
                                            {job.customer?.name}
                                        </h3>
                                        <div className="flex items-center mt-0.5 space-x-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">#{job.id}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {getJobTypeLabel(job.type)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                                <p className="text-[11px] font-bold text-slate-600 leading-relaxed line-clamp-3 italic">
                                    "{job.description}"
                                </p>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-4 pb-4">
                                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-slate-300" />
                                    {new Date(job.created_at).toLocaleDateString('tr-TR')}
                                </div>
                                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <MapPinIcon className="h-4 w-4 mr-2 text-slate-300" />
                                    {job.customer?.region?.name || 'BÖLGE YOK'}
                                </div>
                            </div>

                            {/* Status and Assignee */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${getStatusColor(job.status, 'badge')}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusColor(job.status, 'dot')}`}></span>
                                    {getStatusLabel(job.status)}
                                </span>
                                {job.assignee && (
                                    <div className="flex items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                        <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center text-[9px] font-black text-orange-600">
                                            {job.assignee.name[0].toUpperCase()}
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{job.assignee.name.split(' ')[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Link */}
                        <Link
                            href={`/jobs/${job.id}`}
                            className="bg-slate-900 group-hover:bg-orange-600 py-3.5 px-6 text-center text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                            <span>İŞ DETAYINI GÖR</span>
                            <Squares2X2Icon className="h-4 w-4 opacity-50" />
                        </Link>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === page
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-100'
                                    : 'bg-white border border-slate-200 text-slate-500 hover:border-orange-500 hover:text-orange-600'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            )}

            {paginatedJobs.length === 0 && (
                <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 mt-8">
                    <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <BriefcaseIcon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">İş Bulunamadı</h3>
                    <p className="text-sm text-slate-500 font-bold max-w-xs mx-auto mt-1">Seçilen filtreye uygun iş kaydı bulunmamaktadır.</p>
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

function getJobIcon(type: string) {
    return <BriefcaseIcon className="h-7 w-7" />;
}
