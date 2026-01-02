'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from '@/lib/axios';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    UserIcon,
    ArrowLeftIcon,
    PencilSquareIcon,
    BuildingLibraryIcon,
    IdentificationIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import CustomerFormModal from '@/components/customers/CustomerFormModal';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: customer, mutate } = useSWR(`/customers/${id}`, () =>
        axios.get(`/customers/${id}`).then(res => res.data)
    );

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!customer) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 pb-20 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Top Bar - Better mobile styling */}
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-500 hover:text-orange-600 transition-colors bg-white px-3 py-2 rounded-xl border border-slate-100"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    <span className="font-bold text-sm">Geri</span>
                </button>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Müşteri ID: #{customer.id}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{customer.name}</h1>
                                <div className="flex flex-wrap items-center mt-3 gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span className={`px-2 py-1 rounded-lg border ${customer.type === 'corporate' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                        {customer.type === 'corporate' ? 'Kurumsal' : 'Bireysel'}
                                    </span>
                                    <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                        <MapPinIcon className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                                        {customer.region?.name || 'Bölge Yok'}
                                    </span>
                                </div>
                            </div>
                            <Button onClick={() => setIsEditModalOpen(true)} variant="secondary" className="h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                <PencilSquareIcon className="h-4 w-4 mr-2" />
                                Düzenle
                            </Button>
                        </div>
                    </div>

                    {/* Contact & Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <UserIcon className="h-4 w-4 mr-2" />
                                İletişim Bilgileri
                            </h3>
                            <div className="space-y-3">
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Telefon</span>
                                    {customer.phone ? (
                                        <a href={`tel:${customer.phone}`} className="text-sm font-black text-orange-600 hover:scale-105 transition-transform inline-flex items-center">
                                            <PhoneIcon className="h-4 w-4 mr-2" />
                                            {customer.phone}
                                        </a>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-400 italic">Girilmemiş</span>
                                    )}
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">E-Posta</span>
                                    {customer.email ? (
                                        <a href={`mailto:${customer.email}`} className="text-sm font-black text-slate-800 hover:text-orange-600 break-all inline-flex items-center">
                                            <EnvelopeIcon className="h-4 w-4 mr-2 text-slate-400" />
                                            {customer.email}
                                        </a>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-400 italic">Girilmemiş</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <BuildingLibraryIcon className="h-4 w-4 mr-2" />
                                Finansal Bilgiler
                            </h3>
                            <div className="space-y-3">
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">IBAN</span>
                                    <p className="text-xs font-mono font-bold text-slate-700 break-all bg-white p-3 rounded-xl border border-slate-200 shadow-inner">
                                        {customer.iban || 'IBAN bilgisi girilmemiş'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Corporate Details */}
                    {customer.type === 'corporate' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                                Kurumsal Bilgiler
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Resmi Şirket Ünvanı</span>
                                    <p className="text-sm font-black text-slate-900 leading-tight">{customer.full_company_name || '-'}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vergi Dairesi</span>
                                        <p className="text-sm font-black text-slate-900 flex items-center">
                                            <BuildingOfficeIcon className="h-4 w-4 mr-2 text-orange-500" />
                                            {customer.tax_office || '-'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vergi Numarası</span>
                                        <p className="text-sm font-black text-slate-900 flex items-center">
                                            <IdentificationIcon className="h-4 w-4 mr-2 text-orange-500" />
                                            {customer.tax_number || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Address & Map */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-2" />
                                Adres Bilgisi
                            </h3>
                            {customer.maps_link && (
                                <a
                                    href={customer.maps_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-fit text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 flex items-center px-4 py-2.5 rounded-xl shadow-lg shadow-slate-200 transition-all"
                                >
                                    <GlobeAltIcon className="h-4 w-4 mr-2" />
                                    Haritada Aç
                                </a>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {customer.address || 'Adres girilmemiş.'}
                        </div>
                    </div>
                </div>

                {/* Right Column: Contacts / Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                Yetkililer
                            </h3>
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-xl border border-slate-200">
                                {customer.contacts?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {customer.contacts?.map((contact: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-2xl border border-slate-100 hover:border-orange-200 transition-all bg-slate-50/50 group/contact">
                                    <div className="flex items-center mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm mr-4 shadow-sm group-hover/contact:scale-110 transition-transform">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 leading-tight">{contact.name}</p>
                                            <p className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-widest">{contact.department || 'Genel'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {contact.phone && (
                                            <a href={`tel:${contact.phone}`} className="flex items-center text-[11px] font-bold text-slate-600 hover:text-orange-600 transition-colors">
                                                <PhoneIcon className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                                {contact.phone}
                                            </a>
                                        )}
                                        {contact.email && (
                                            <a href={`mailto:${contact.email}`} className="flex items-center text-[11px] font-bold text-slate-600 hover:text-orange-600 transition-colors">
                                                <EnvelopeIcon className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                                <span className="truncate">{contact.email}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!customer.contacts || customer.contacts.length === 0) && (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Yetkili eklenmemiş
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CustomerFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => { mutate(); setIsEditModalOpen(false); }}
                customerToEdit={customer}
            />
        </div>
    );
}
