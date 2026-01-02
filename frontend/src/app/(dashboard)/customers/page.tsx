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
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    UserIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import CustomerFormModal from '@/components/customers/CustomerFormModal';

export default function CustomersPage() {
    const { user } = useAuth({ middleware: 'auth' });
    const { data: customers } = useSWR('/customers', () => axios.get('/customers').then(res => res.data));

    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // View Contacts State (Keeping this as it is used for the dedicated view modal which is different from edit)
    const [viewContactsModalOpen, setViewContactsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // Permission Checks
    const canCreate = user?.role === 'manager' || user?.permissions?.includes('create_customers');
    const canEdit = user?.role === 'manager' || user?.permissions?.includes('edit_customers');
    const canDelete = user?.role === 'manager' || user?.permissions?.includes('delete_customers');

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEditCustomer = (customer: any) => {
        if (!canEdit) return;
        setIsEditing(true);
        setEditingId(customer.id);
        setIsOpen(true);
    };

    const handleDeleteCustomer = async (id: number) => {
        if (!canDelete) return;
        if (!confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;

        try {
            await axios.delete(`/customers/${id}`);
            mutate('/customers');
        } catch (error) {
            alert('Silme işlemi başarısız.');
        }
    };

    const handleViewContacts = (customer: any) => {
        setSelectedCustomer(customer);
        setViewContactsModalOpen(true);
    };

    // Filter customers
    const filteredCustomers = customers?.filter((customer: any) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.region_id ? (customer.region?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) : (customer.region || '').toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    // Pagination Logic
    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page on search
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    if (!customers) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Müşteriler</h1>
                    <p className="mt-2 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Müşteri Portföyü ve İletişim Yönetimi</p>
                </div>
                {canCreate && (
                    <Button
                        onClick={() => { resetForm(); setIsOpen(true); }}
                        variant="orange"
                        className="h-14 px-8 rounded-2xl font-black text-xs scale-100 hover:scale-[102%] active:scale-[98%] transition-all w-full md:w-fit shadow-lg shadow-orange-100 uppercase tracking-widest"
                    >
                        <PlusIcon className="h-5 w-5 mr-3" />
                        Yeni Müşteri Ekle
                    </Button>
                )}
            </div>

            {/* Search Bar */}
            <div className="mb-10 relative px-1">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-sm text-slate-800 placeholder-slate-400"
                    placeholder="Müşteri ismi, bölge veya e-posta ile ara..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedCustomers.map((customer: any) => (
                    <div
                        key={customer.id}
                        className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 p-6 flex flex-col justify-between"
                    >
                        <div>
                            {/* Top: Type & ID */}
                            <div className="flex justify-between items-center mb-5">
                                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${customer.type === 'corporate' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                    {customer.type === 'corporate' ? 'Kurumsal' : 'Bireysel'}
                                </span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{customer.id}</span>
                                    {canEdit && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }}
                                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                            title="Düzenle"
                                        >
                                            <PencilSquareIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Middle: Name & Contact Info */}
                            <div className="mb-6">
                                <Link href={`/customers/${customer.id}`} className="block">
                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors leading-tight mb-4" title={customer.name}>
                                        {customer.name}
                                    </h3>
                                </Link>

                                <div className="space-y-3">
                                    {customer.phone && (
                                        <a href={`tel:${customer.phone}`} className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 hover:border-orange-200 hover:text-orange-600 transition-all">
                                            <PhoneIcon className="h-4 w-4 mr-3 text-slate-400" />
                                            <span className="truncate">{customer.phone}</span>
                                        </a>
                                    )}
                                    {customer.email && (
                                        <a href={`mailto:${customer.email}`} className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 hover:border-orange-200 hover:text-orange-600 transition-all">
                                            <EnvelopeIcon className="h-4 w-4 mr-3 text-slate-400" />
                                            <span className="truncate">{customer.email}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer: Region & Actions */}
                        <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-2">
                            <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <MapPinIcon className="h-4 w-4 mr-2" />
                                {customer.region?.name || 'Bölge Yok'}
                            </div>

                            <div className="flex items-center space-x-3">
                                {customer.type === 'corporate' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleViewContacts(customer); }}
                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-white hover:bg-indigo-600 transition-all px-3 py-1.5 rounded-xl border border-indigo-100"
                                    >
                                        {customer.contacts?.length || 0} Yetkili
                                    </button>
                                )}
                                <Link
                                    href={`/customers/${customer.id}`}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                    title="Detaylar"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </Link>
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
            {filteredCustomers.length === 0 && (
                <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 mt-8">
                    <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <UserIcon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Müşteri Bulunamadı</h3>
                    <p className="text-sm text-slate-500 font-bold max-w-xs mx-auto mt-1">Aramanızla eşleşen sonuç yok veya henüz müşteri eklemediniz.</p>
                </div>
            )}

            {/* Modals */}
            <CustomerFormModal
                isOpen={isOpen}
                onClose={() => { setIsOpen(false); resetForm(); }}
                onSuccess={() => {
                    mutate('/customers');
                    setIsOpen(false);
                    resetForm();
                }}
                customerToEdit={isEditing && editingId ? customers?.find((c: any) => c.id === editingId) : undefined}
            />

            <Transition appear show={viewContactsModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setViewContactsModalOpen(false)}>
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
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all border border-white">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-black text-slate-900 leading-none">
                                                {selectedCustomer?.name}
                                            </Dialog.Title>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">YETKİLİ LİSTESİ</p>
                                        </div>
                                        <button onClick={() => setViewContactsModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedCustomer?.contacts?.map((contact: any, idx: number) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all">
                                                <div className="flex items-center mb-3">
                                                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-sm">
                                                        {contact.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-black text-slate-900 leading-tight">{contact.name}</p>
                                                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{contact.department || 'Bölüm Belirtilmedi'}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 border-t border-slate-200/50 pt-2 mt-2">
                                                    {contact.phone && (
                                                        <div className="flex items-center text-[11px] font-bold text-slate-600">
                                                            <PhoneIcon className="h-3 w-3 mr-2 text-slate-400" />
                                                            {contact.phone}
                                                        </div>
                                                    )}
                                                    {contact.email && (
                                                        <div className="flex items-center text-[11px] font-bold text-slate-600">
                                                            <EnvelopeIcon className="h-3 w-3 mr-2 text-slate-400" />
                                                            {contact.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {(!selectedCustomer?.contacts || selectedCustomer.contacts.length === 0) && (
                                            <div className="text-center py-10">
                                                <UserIcon className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kayıtlı yetkili bulunamadı.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8">
                                        <Button variant="secondary" onClick={() => setViewContactsModalOpen(false)} className="w-full font-bold text-xs h-10">
                                            Kapat
                                        </Button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
