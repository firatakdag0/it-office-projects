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
    ChevronLeftIcon,
    PencilSquareIcon,
    InformationCircleIcon,
    BuildingLibraryIcon
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header / Breadcrumb */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center space-x-5">
                    <button
                        onClick={() => router.back()}
                        className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 hover:scale-110 transition-all shadow-sm"
                    >
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${customer.type === 'corporate' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                {customer.type === 'corporate' ? 'Kurumsal Müşteri' : 'Bireysel Müşteri'}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: #{customer.id}</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">{customer.name}</h1>
                    </div>
                </div>
                <Button onClick={() => setIsEditModalOpen(true)} variant="orange" className="shadow-lg shadow-orange-200 hover:scale-105 transition-transform">
                    <PencilSquareIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Bilgileri Düzenle
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Basic Info & Corporate Details */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Basic Info Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <h2 className="text-xl font-black text-slate-800 flex items-center">
                                <InformationCircleIcon className="h-6 w-6 mr-3 text-orange-500" />
                                İletişim & Temel Bilgiler
                            </h2>
                        </div>
                        <div className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Telefon Hattı</label>
                                        <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all">
                                            <PhoneIcon className="h-5 w-5 text-slate-400 mr-3 group-hover:text-orange-500 transition-colors" />
                                            <p className="text-slate-800 font-bold">{customer.phone || 'Girilmemiş'}</p>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">E-Posta Adresi</label>
                                        <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all">
                                            <EnvelopeIcon className="h-5 w-5 text-slate-400 mr-3 group-hover:text-orange-500 transition-colors" />
                                            <p className="text-slate-800 font-bold">{customer.email || 'Girilmemiş'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">IBAN / Hesap Bilgisi</label>
                                        <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all">
                                            <BuildingLibraryIcon className="h-5 w-5 text-slate-400 mr-3 group-hover:text-orange-500 transition-colors" />
                                            <p className="text-slate-800 font-black font-mono tracking-tight">{customer.iban || 'Girilmemiş'}</p>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Bulunduğu Bölge</label>
                                        <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all">
                                            <MapPinIcon className="h-5 w-5 text-slate-400 mr-3 group-hover:text-orange-500 transition-colors" />
                                            <p className="text-slate-800 font-bold">{customer.region?.name || 'Belirtilmemiş'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Harita Konumu</label>
                                {customer.maps_link ? (
                                    <a
                                        href={customer.maps_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-slate-200"
                                    >
                                        <MapPinIcon className="h-5 w-5 mr-3" />
                                        Konumu Google Haritalarda Aç
                                    </a>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-slate-400 text-sm italic">
                                        Bu müşteri için henüz harita konumu eklenmemiş.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Corporate Details Card */}
                    {customer.type === 'corporate' && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                                <h2 className="text-xl font-black text-slate-800 flex items-center">
                                    <BuildingOfficeIcon className="h-6 w-6 mr-3 text-indigo-500" />
                                    Resmi Şirket Bilgileri
                                </h2>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 block">Tam Şirket Ünvanı</label>
                                    <p className="text-indigo-900 font-black text-2xl leading-snug">{customer.full_company_name || 'Girilmemiş'}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:bg-white hover:border-indigo-100 transition-colors">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Vergi Numarası</label>
                                        <p className="text-slate-800 font-black text-xl">{customer.tax_number || '-'}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:bg-white hover:border-indigo-100 transition-colors">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Vergi Dairesi</label>
                                        <p className="text-slate-800 font-black text-xl">{customer.tax_office || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Address Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                            <h2 className="text-xl font-black text-slate-800 flex items-center">
                                <MapPinIcon className="h-6 w-6 mr-3 text-red-500" />
                                Adres Bilgileri
                            </h2>
                        </div>
                        <div className="p-10">
                            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                                <p className="text-slate-700 text-lg font-medium whitespace-pre-wrap leading-relaxed italic">
                                    {customer.address || 'Adres bilgisi girilmemiş.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Contacts / Yetkililer */}
                <div className="space-y-10">
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-white overflow-hidden h-full">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800 flex items-center">
                                <UserIcon className="h-6 w-6 mr-3 text-blue-500" />
                                Yetkililer
                            </h2>
                            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md shadow-blue-100 tracking-widest">{customer.contacts?.length || 0}</span>
                        </div>
                        <div className="p-8 space-y-6">
                            {customer.contacts?.map((contact: any, idx: number) => (
                                <div key={idx} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all duration-300 group">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg shadow-sm border border-white group-hover:scale-110 transition-transform">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-lg leading-none">{contact.name}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mt-2">{contact.department || 'GENEL'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100/50">
                                        {contact.phone && (
                                            <div className="flex items-center text-xs font-bold text-slate-500 bg-white/50 p-2 rounded-xl">
                                                <PhoneIcon className="h-4 w-4 mr-3 text-slate-400" />
                                                {contact.phone}
                                            </div>
                                        )}
                                        {contact.email && (
                                            <div className="flex items-center text-xs font-bold text-slate-500 bg-white/50 p-2 rounded-xl">
                                                <EnvelopeIcon className="h-4 w-4 mr-3 text-slate-400" />
                                                <span className="truncate">{contact.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!customer.contacts || customer.contacts.length === 0) && (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <UserIcon className="h-10 w-10 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm tracking-tight uppercase tracking-widest">Kayıtlı Yetkili Yok</p>
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
