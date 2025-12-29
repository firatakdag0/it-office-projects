'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import axios from '@/lib/axios';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    MapPinIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function RegionsPage() {
    const { user } = useAuth({ middleware: 'auth' });
    const { data: regions } = useSWR('/regions', () => axios.get('/regions').then(res => res.data));

    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const canManage = user?.role === 'manager';

    const handleEditRegion = (region: any) => {
        setIsEditing(true);
        setEditingId(region.id);
        setName(region.name);
        setDescription(region.description || '');
        setIsOpen(true);
    };

    const handleDeleteRegion = async (id: number) => {
        if (!confirm('Bu bölgeyi silmek istediğinize emin misiniz?')) return;

        try {
            await axios.delete(`/regions/${id}`);
            mutate('/regions');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Silme işlemi başarısız.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = { name, description };

        try {
            if (isEditing && editingId) {
                await axios.put(`/regions/${editingId}`, payload);
            } else {
                await axios.post('/regions', payload);
            }
            mutate('/regions');
            setIsOpen(false);
            resetForm();
        } catch (error: any) {
            alert('İşlem başarısız: ' + (error.response?.data?.message || 'Hata oluştu'));
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setName('');
        setDescription('');
    };

    const filteredRegions = regions?.filter((region: any) =>
        region.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const totalPages = Math.ceil(filteredRegions.length / ITEMS_PER_PAGE);
    const paginatedRegions = filteredRegions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    if (!regions) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bölge Yönetimi</h1>
                    <p className="mt-1 text-slate-500 font-bold uppercase tracking-widest text-[9px]">Müşteri Gruplandırma ve Bölge Listesi</p>
                </div>
                {canManage && (
                    <Button
                        onClick={() => { resetForm(); setIsOpen(true); }}
                        variant="orange"
                        className="h-11 px-6 rounded-xl font-black text-xs scale-100 hover:scale-105 active:scale-95 transition-all w-fit"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        YENİ BÖLGE EKLE
                    </Button>
                )}
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-white rounded-2xl shadow-sm focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-sm text-slate-700 placeholder-slate-400"
                    placeholder="Bölge ismi ile ara..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
            </div>

            {/* Regions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedRegions.map((region: any) => (
                    <div
                        key={region.id}
                        className="group bg-white/80 backdrop-blur-sm rounded-3xl border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                    >
                        <div className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                        <MapPinIcon className="h-8 w-8" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors">{region.name}</h3>
                                        <div className="flex items-center mt-0.5 space-x-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">#{region.id}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-orange-50 text-orange-600">
                                                {region.customers_count || 0} Müşteri
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    {canManage && (
                                        <>
                                            <button
                                                onClick={() => handleEditRegion(region)}
                                                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all"
                                                title="Düzenle"
                                            >
                                                <PencilSquareIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRegion(region.id)}
                                                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                                title="Sil"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex-1">
                                <p className="text-[11px] font-bold text-slate-600 leading-relaxed line-clamp-3">
                                    {region.description || <span className="text-slate-300 italic">Açıklama girilmemiş.</span>}
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                BÖLGE DETAYI
                            </span>
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
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

            {/* Empty State */}
            {filteredRegions.length === 0 && (
                <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 mt-8">
                    <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <MapPinIcon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Bölge Bulunamadı</h3>
                    <p className="text-sm text-slate-500 font-bold max-w-xs mx-auto mt-1">Aramanızla eşleşen sonuç yok veya henüz bölge eklemediniz.</p>
                </div>
            )}

            {/* Modal */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-white">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-black text-slate-900 leading-none">
                                                {isEditing ? 'Bölgeyi Düzenle' : 'Yeni Bölge Ekle'}
                                            </Dialog.Title>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">BÖLGE BİLGİLERİ</p>
                                        </div>
                                        <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Bölge Adı</label>
                                            <input
                                                type="text"
                                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-sm text-slate-700"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                                placeholder="Örn: Kuzey Marmara"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Açıklama (Opsiyonel)</label>
                                            <textarea
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-sm text-slate-700 resize-none"
                                                rows={4}
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                placeholder="Bölge detaylarını buraya yazabilirsiniz..."
                                            ></textarea>
                                        </div>

                                        <div className="mt-8 flex justify-end space-x-3">
                                            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} className="font-bold text-xs h-10 px-6">Vazgeç</Button>
                                            <Button type="submit" isLoading={isLoading} variant="orange" className="font-black text-xs h-10 px-8">
                                                {isEditing ? 'GÜNCELLE' : 'BÖLGEYİ OLUŞTUR'}
                                            </Button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
