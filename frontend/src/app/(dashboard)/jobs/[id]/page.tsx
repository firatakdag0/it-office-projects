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
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    ClipboardDocumentListIcon,
    TruckIcon,
    ClockIcon,
    WrenchIcon,
    PaperClipIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function JobDetailPage() {
    const { id } = useParams();
    const { user } = useAuth({ middleware: 'auth' });
    const router = useRouter();
    const isManager = user?.role === 'manager';
    const [isLoading, setIsLoading] = useState(false);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        variant: 'danger' | 'warning' | 'info';
        statusToUpdate: string | null;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        variant: 'info',
        statusToUpdate: null
    });

    const { data: job, error } = useSWR(`/jobs/${id}`, () =>
        axios.get(`/jobs/${id}`).then(res => res.data)
    );

    if (!job) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
    );

    const handleStatusUpdate = (newStatus: string) => {
        const isCancel = newStatus === 'cancelled';
        setConfirmModal({
            isOpen: true,
            title: isCancel ? 'İşi İptal Et' : 'Durum Güncelleme',
            message: isCancel
                ? 'Bu işi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.'
                : `İş durumunu "${getStatusLabel(newStatus)}" olarak güncellemek üzeresiniz. Devam etmek istiyor musunuz?`,
            confirmText: isCancel ? 'İptal Et' : 'Güncelle',
            variant: isCancel ? 'danger' : 'info',
            statusToUpdate: newStatus
        });
    };

    const confirmStatusUpdate = async () => {
        if (!confirmModal.statusToUpdate) return;

        setIsLoading(true);
        try {
            await axios.patch(`/jobs/${job.id}/status`, {
                status: confirmModal.statusToUpdate,
                latitude: job.customer?.latitude || null,
                longitude: job.customer?.longitude || null,
            });
            mutate(`/jobs/${id}`);
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (e: any) {
            alert('Durum güncellenirken bir hata oluştu: ' + (e.response?.data?.message || e.message));
        } finally {
            setIsLoading(false);
        }
    };

    const openMap = () => {
        if (job.maps_url) {
            window.open(job.maps_url, '_blank');
        } else if (job.latitude && job.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`, '_blank');
        } else if (job.customer?.latitude && job.customer?.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.customer.latitude},${job.customer.longitude}`, '_blank');
        } else {
            // Priority: Job Location Address > Customer Address
            const query = job.location_address || job.customer?.address || '';
            if (query) {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
            } else {
                alert("Konum bilgisi bulunamadı.");
            }
        }
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20 p-2 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Top Bar - Hidden on mobile as we have BottomNav */}
            <div className="mb-4 hidden lg:flex items-center justify-between">
                <button
                    onClick={() => router.push('/jobs')}
                    className="flex items-center text-slate-500 hover:text-orange-600 transition-colors bg-white px-3 py-2 rounded-xl border border-slate-100 lg:bg-transparent lg:border-0 lg:px-0 lg:py-0"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    <span className="font-bold text-sm">İşler</span>
                </button>
                <div className="flex items-center space-x-4">
                    <div className="text-xs font-medium text-slate-400">
                        Job ID: #{job.id}
                    </div>
                    {(isManager || user?.permissions?.includes('edit_jobs')) && (
                        <button
                            onClick={() => router.push(`/jobs/${job.id}/edit`)}
                            className="flex items-center text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100"
                        >
                            <PencilSquareIcon className="h-4 w-4 mr-2" />
                            <span className="font-bold text-xs">Düzenle</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{job.customer?.name}</h1>
                                <div className="flex flex-wrap items-center mt-3 gap-3 text-xs font-bold text-slate-500">
                                    <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                                        <BriefcaseIcon className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                                        {getJobTypeLabel(job.type)}
                                    </span>
                                    <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                                        <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                        {new Date(job.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            </div>
                            <span className={`w-fit px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(job.status, 'badge')}`}>
                                {getStatusLabel(job.status)}
                            </span>
                        </div>
                    </div>

                    {/* Description & Materials */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-2" />
                                İş Açıklaması
                            </h3>
                            <div className="bg-slate-50 rounded-2xl p-4 text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100">
                                {job.description}
                            </div>
                        </div>

                        {job.materials && (
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                                    <ClipboardDocumentListIcon className="h-4 w-4 mr-2 text-orange-500" />
                                    Gerekli Malzemeler
                                </h3>
                                <div className="bg-orange-50/50 rounded-2xl p-4 text-sm font-bold text-slate-800 leading-relaxed border border-orange-100">
                                    {job.materials}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Customer & Location Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <UserIcon className="h-4 w-4 mr-2" />
                                Müşteri Bilgisi
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefon</span>
                                    <a href={`tel:${job.customer?.phone}`} className="text-sm font-black text-orange-600 hover:scale-105 transition-transform">
                                        {job.customer?.phone}
                                    </a>
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Adres</span>
                                    <p className="text-sm font-bold text-slate-700 leading-snug">{job.customer?.address}</p>
                                </div>
                                {(job.contact_name || job.authorized_person) && (
                                    <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                                        <span className="text-[10px] font-black text-indigo-500 block mb-1 uppercase tracking-widest">Yetkili / Muhatap</span>
                                        <p className="text-sm font-black text-slate-800">{job.contact_name || job.authorized_person?.name}</p>
                                        <p className="text-[11px] font-bold text-slate-500 mt-1">{job.contact_phone || job.authorized_person?.phone || '-'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                                Servis Bilgileri
                            </h3>
                            <div className="space-y-3">
                                {(isManager || user?.permissions?.includes('view_prices')) && (
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ücret</span>
                                        <span className="text-sm font-black text-slate-800">{job.price ? `${job.price} ₺` : 'Belirlenmedi'}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sorumlu</span>
                                    <div className="flex items-center">
                                        <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center text-[9px] font-black text-orange-600 mr-2 border border-orange-200">
                                            {job.assignee?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <span className="text-sm font-black text-slate-800">{job.assignee?.name || 'Atanmamış'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                            <PaperClipIcon className="h-4 w-4 mr-2" />
                            Dosyalar ({job.attachments?.length || 0})
                        </h3>

                        {job.attachments?.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                                {job.attachments.map((file: any) => (
                                    <a
                                        key={file.id}
                                        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${file.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative block aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 hover:border-orange-200 transition-colors shadow-sm"
                                    >
                                        {file.file_type.startsWith('image/') ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${file.file_path}`}
                                                alt={file.file_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <DocumentTextIcon className="h-8 w-8 text-slate-400" />
                                            </div>
                                        )}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
                                Henüz dosya eklenmemiş
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 sticky top-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                            İşlemler
                        </h3>

                        <div className="space-y-4">
                            {/* Map Button */}
                            <button
                                onClick={openMap}
                                className="w-full flex items-center justify-center px-4 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                <MapPinIcon className="h-5 w-5 mr-3" />
                                Yol Tarifi / Harita
                            </button>

                            <div className="border-t border-slate-100 my-6"></div>

                            {/* Status Actions */}
                            {job.status === 'pending' && (
                                <div className="grid grid-cols-1 gap-3">
                                    <Button
                                        variant="orange"
                                        className="w-full justify-center h-14 rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-orange-100"
                                        onClick={() => handleStatusUpdate('traveling')}
                                        isLoading={isLoading}
                                    >
                                        <TruckIcon className="h-5 w-5 mr-3" />
                                        Yola Çık
                                    </Button>
                                    <button
                                        className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                        onClick={() => handleStatusUpdate('cancelled')}
                                    >
                                        İptal Et
                                    </button>
                                </div>
                            )}

                            {job.status === 'traveling' && (
                                <div className="grid grid-cols-1 gap-3">
                                    <Button
                                        className="w-full justify-center h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-indigo-100"
                                        onClick={() => handleStatusUpdate('working')}
                                        isLoading={isLoading}
                                    >
                                        <WrenchIcon className="h-5 w-5 mr-3" />
                                        İşe Başla
                                    </Button>
                                    <button
                                        className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                        onClick={() => handleStatusUpdate('cancelled')}
                                    >
                                        İptal Et
                                    </button>
                                </div>
                            )}

                            {job.status === 'working' && (
                                <div className="grid grid-cols-1 gap-3">
                                    <Button
                                        className="w-full justify-center h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-green-100"
                                        onClick={() => handleStatusUpdate('completed')}
                                        isLoading={isLoading}
                                    >
                                        <CheckCircleIcon className="h-5 w-5 mr-3" />
                                        İşi Tamamla
                                    </Button>
                                    <button
                                        className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                        onClick={() => handleStatusUpdate('cancelled')}
                                    >
                                        İptal Et
                                    </button>
                                </div>
                            )}

                            {job.status === 'completed' && (
                                <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
                                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-100">
                                        <CheckCircleIcon className="h-10 w-10 text-green-500" />
                                    </div>
                                    <p className="text-sm font-black text-green-800 uppercase tracking-widest">Tamamlandı</p>
                                    <p className="text-[10px] font-bold text-green-600 mt-1 uppercase tracking-widest">
                                        {job.completed_at ? new Date(job.completed_at).toLocaleDateString('tr-TR') : ''}
                                    </p>
                                </div>
                            )}

                            {job.status === 'cancelled' && (
                                <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
                                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-100">
                                        <XCircleIcon className="h-10 w-10 text-red-500" />
                                    </div>
                                    <p className="text-sm font-black text-red-800 uppercase tracking-widest">İptal Edildi</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmStatusUpdate}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
                isLoading={isLoading}
            />
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

function getStatusColor(status: string, type: 'badge') {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        traveling: 'bg-blue-100 text-blue-800 border-blue-200',
        working: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
}

function getJobTypeLabel(type: string) {
    const labels: Record<string, string> = {
        support: 'Teknik Destek',
        camera: 'Kamera Montaj',
        cabling: 'Kablolama',
    };
    return labels[type] || type;
}
