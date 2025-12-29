'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import axios from '@/lib/axios';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import {
    MapPinIcon,
    PhoneIcon,
    ArrowLeftIcon,
    BriefcaseIcon,
    CalendarIcon,
    UserIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    PaperClipIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    TruckIcon,
    WrenchIcon
} from '@heroicons/react/24/outline';

export default function JobDetailPage() {
    const { id } = useParams();
    const { user } = useAuth({ middleware: 'auth' });
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const { data: job, error } = useSWR(`/jobs/${id}`, () =>
        axios.get(`/jobs/${id}`).then(res => res.data)
    );

    if (!job) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
    );

    const handleStatusUpdate = async (newStatus: string) => {
        const confirmMsg = newStatus === 'cancelled' ? 'Bu işi iptal etmek istediğinize emin misiniz?' : `Durumu "${getStatusLabel(newStatus)}" olarak güncellemek üzeresiniz. Onaylıyor musunuz?`;

        if (!confirm(confirmMsg)) return;

        setIsLoading(true);
        try {
            await axios.patch(`/jobs/${job.id}/status`, {
                status: newStatus,
                // In real app, we would get Geolocation here
                latitude: job.customer?.latitude || null,
                longitude: job.customer?.longitude || null,
            });
            mutate(`/jobs/${id}`);
        } catch (e: any) {
            alert('Durum güncellenirken bir hata oluştu: ' + (e.response?.data?.message || e.message));
        } finally {
            setIsLoading(false);
        }
    };

    const openMap = () => {
        if (job.customer?.latitude && job.customer?.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.customer.latitude},${job.customer.longitude}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.customer.address)}`, '_blank');
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Top Bar / Breadcrumbs */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <button
                    onClick={() => router.push('/jobs')}
                    className="flex items-center p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 hover:scale-110 transition-all shadow-sm group w-fit"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Listeye Dön</span>
                </button>
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm p-2 px-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">GÜNCEL DURUM:</span>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm ${getStatusColor(job.status)}`}>
                        {getStatusLabel(job.status)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Job Info & Description */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Main Info Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <h2 className="text-xl font-black text-slate-800 flex items-center">
                                <BriefcaseIcon className="h-6 w-6 mr-3 text-orange-500" />
                                İş Detay Bilgileri <span className="text-slate-300 ml-2">#{job.id}</span>
                            </h2>
                        </div>
                        <div className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:border-orange-100 transition-colors">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Hizmet Türü</label>
                                    <p className="text-slate-800 font-black text-xl">{getJobTypeLabel(job.type)}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:border-orange-100 transition-colors">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Oluşturulma Tarihi</label>
                                    <p className="text-slate-800 font-bold text-lg">
                                        {new Date(job.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:border-orange-100 transition-colors">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Sorumlu Personel</label>
                                    <div className="flex items-center mt-1">
                                        <div className="h-10 w-10 rounded-2xl bg-slate-200 flex items-center justify-center mr-3 text-slate-600 font-black shadow-inner">
                                            {job.assignee?.name?.charAt(0) || '?'}
                                        </div>
                                        <p className="text-slate-800 font-black text-lg">{job.assignee?.name || 'Atanmamış'}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:border-orange-100 transition-colors">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Servis Ücreti</label>
                                    <div className="flex items-center text-orange-600">
                                        <CurrencyDollarIcon className="h-6 w-6 mr-1" />
                                        <p className="font-black text-2xl">
                                            {job.price ? `${job.price} ₺` : 'Belirlenmedi'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">İş Açıklaması & Notlar</label>
                                <div className="p-8 bg-slate-900 rounded-[2rem] text-slate-300 leading-relaxed font-medium italic shadow-xl shadow-slate-200">
                                    {job.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800 flex items-center">
                                <PaperClipIcon className="h-6 w-6 mr-3 text-indigo-500" />
                                Dosyalar & Ekran Görüntüleri
                            </h2>
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md shadow-indigo-100 tracking-widest">{job.attachments?.length || 0}</span>
                        </div>
                        <div className="p-10">
                            {job.attachments?.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {job.attachments.map((file: any) => (
                                        <a
                                            key={file.id}
                                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${file.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative rounded-3xl border border-slate-100 overflow-hidden aspect-square flex items-center justify-center bg-slate-50 hover:border-indigo-300 hover:scale-105 transition-all shadow-sm"
                                        >
                                            {file.file_type.startsWith('image/') ? (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${file.file_path}`}
                                                    alt={file.file_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <DocumentTextIcon className="h-12 w-12 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                            )}
                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                                <CheckCircleIcon className="h-8 w-8 text-white mb-2" />
                                                <span className="text-[10px] text-white font-black uppercase tracking-widest text-center truncate w-full">
                                                    {file.file_name}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <PaperClipIcon className="h-12 w-10 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold text-sm tracking-tight uppercase tracking-widest">Ekli Dosya Bulunmamaktadır</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Actions */}
                <div className="space-y-10">
                    {/* Customer Contact Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                            <h2 className="text-xl font-black text-slate-800 flex items-center">
                                <UserIcon className="h-6 w-6 mr-3 text-blue-500" />
                                Müşteri Bilgisi
                            </h2>
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-slate-900 mb-6 leading-tight">{job.customer?.name}</h3>

                            <div className="space-y-6">
                                <a
                                    href={`tel:${job.customer?.phone}`}
                                    className="flex items-center p-5 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 transition-all group shadow-sm"
                                >
                                    <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                                        <PhoneIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefon</p>
                                        <p className="text-base font-black text-slate-700">{job.customer?.phone}</p>
                                    </div>
                                </a>

                                <div className="p-5 rounded-3xl border border-slate-100 bg-slate-50 shadow-sm">
                                    <div className="flex items-start mb-4">
                                        <div className="p-3 rounded-2xl bg-orange-100 text-orange-600 mr-4">
                                            <MapPinIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hizmet Adresi</p>
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic line-clamp-3">{job.customer?.address}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={openMap}
                                        className="w-full flex items-center justify-center px-6 py-3 bg-white border-2 border-orange-100 rounded-2xl font-black text-xs text-orange-600 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all group"
                                    >
                                        YOL TARİFİ AL
                                        <TruckIcon className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-white overflow-hidden sticky top-8">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-900">
                            <h2 className="text-xl font-black text-white flex items-center">
                                <ClockIcon className="h-6 w-6 mr-3 text-orange-500" />
                                İş Akış Yönetimi
                            </h2>
                        </div>
                        <div className="p-10 space-y-6">
                            {job.status === 'pending' && (
                                <div className="space-y-4">
                                    <Button
                                        variant="orange"
                                        className="w-full h-16 rounded-2xl shadow-xl shadow-orange-100 font-black text-lg scale-100 hover:scale-105 active:scale-95 transition-all"
                                        onClick={() => handleStatusUpdate('traveling')}
                                        isLoading={isLoading}
                                    >
                                        <TruckIcon className="h-6 w-6 mr-3" />
                                        YOLA ÇIK
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-full h-12 rounded-2xl text-red-600 font-bold hover:bg-red-50 hover:border-red-100 border-none"
                                        onClick={() => handleStatusUpdate('cancelled')}
                                        isLoading={isLoading}
                                    >
                                        İptal Et
                                    </Button>
                                </div>
                            )}

                            {job.status === 'traveling' && (
                                <div className="space-y-4">
                                    <Button
                                        className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 font-black text-lg scale-100 hover:scale-105 active:scale-95 transition-all"
                                        onClick={() => handleStatusUpdate('working')}
                                        isLoading={isLoading}
                                    >
                                        <WrenchIcon className="h-6 w-6 mr-3" />
                                        İŞE BAŞLA
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-full h-12 rounded-2xl text-red-600 font-bold hover:bg-red-50 hover:border-red-100 border-none"
                                        onClick={() => handleStatusUpdate('cancelled')}
                                        isLoading={isLoading}
                                    >
                                        İptal Et
                                    </Button>
                                </div>
                            )}

                            {job.status === 'working' && (
                                <div className="space-y-4">
                                    <Button
                                        className="w-full h-16 rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-100 font-black text-lg scale-100 hover:scale-105 active:scale-95 transition-all"
                                        onClick={() => handleStatusUpdate('completed')}
                                        isLoading={isLoading}
                                    >
                                        <CheckCircleIcon className="h-6 w-6 mr-3" />
                                        İŞİ TAMAMLA
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-full h-12 rounded-2xl text-red-600 font-bold hover:bg-red-50 hover:border-red-100 border-none"
                                        onClick={() => handleStatusUpdate('cancelled')}
                                        isLoading={isLoading}
                                    >
                                        İptal Et
                                    </Button>
                                </div>
                            )}

                            {job.status === 'completed' && (
                                <div className="text-center py-6 p-6 bg-green-50 rounded-[2rem] border border-green-100">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200">
                                        <CheckCircleIcon className="h-12 w-12 text-green-500" />
                                    </div>
                                    <p className="text-lg font-black text-green-900 leading-tight">İş Tamamlandı</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mt-2">Arşivlenmiş Kayıt</p>
                                </div>
                            )}

                            {job.status === 'cancelled' && (
                                <div className="text-center py-6 p-6 bg-red-50 rounded-[2rem] border border-red-100">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-200">
                                        <XCircleIcon className="h-12 w-12 text-red-400" />
                                    </div>
                                    <p className="text-lg font-black text-red-900 leading-tight">İş İptal Edildi</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-2">Geçersiz Kayıt</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helpers
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

function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
        traveling: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        working: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
        completed: 'bg-green-50 text-green-700 ring-green-600/20',
        cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 ring-slate-600/20';
}

function getJobTypeLabel(type: string) {
    const labels: Record<string, string> = {
        support: 'Teknik Destek',
        camera: 'Kamera Sistemleri',
        cabling: 'Kablolama / Altyapı',
    };
    return labels[type] || type;
}
