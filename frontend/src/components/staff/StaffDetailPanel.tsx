'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon,
    EnvelopeIcon,
    PhoneIcon,
    IdentificationIcon,
    ExclamationTriangleIcon,
    MapPinIcon,
    PencilSquareIcon,
    TrashIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    UserIcon,
    BanknotesIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

interface User {
    id: number;
    name: string;
    email: string;
    username: string | null;
    role: string;
    phone: string | null;
    blood_group: string | null;
    driver_license: string | null;
    department: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    address: string | null;
    bank_name: string | null;
    iban: string | null;
    start_date: string | null;
    permissions: string[] | null;
}

interface StaffDetailPanelProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

const PERMISSION_LABELS: Record<string, string> = {
    view_customers: 'Müşterileri Görüntüle',
    create_customers: 'Müşteri Oluştur',
    edit_customers: 'Müşteri Düzenle',
    delete_customers: 'Müşteri Sil',
    view_all_jobs: 'Tüm İşleri Gör',
    create_jobs: 'İş Kaydı Oluştur',
    edit_jobs: 'İş Detayı Düzenle',
    delete_jobs: 'İş Kaydı Sil',
    assign_jobs: 'Personel Ata',
    view_prices: 'Fiyatları Gör',
    edit_prices: 'Fiyatları Düzenle',
    view_financial_reports: 'Özet Raporlar',
    manage_regions: 'Bölgeleri Yönet',
    manage_staff: 'Personel Yönetimi',
};

export default function StaffDetailPanel({ isOpen, onClose, user, onEdit, onDelete }: StaffDetailPanelProps) {
    if (!user) return null;

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl border-l border-slate-100">
                                        {/* Header */}
                                        <div className="px-6 py-8 bg-slate-50/50 border-b border-slate-100">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center">
                                                    <div className="h-16 w-16 rounded-2xl bg-white border shadow-sm flex items-center justify-center text-2xl font-black text-slate-800">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <Dialog.Title className="text-xl font-black text-slate-900 leading-tight">
                                                            {user.name}
                                                        </Dialog.Title>
                                                        <div className="flex items-center mt-1 space-x-2">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${user.role === 'manager' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                                                                {user.role === 'manager' ? 'Yönetici' : 'Saha Personeli'}
                                                            </span>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{user.id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-all outline-none"
                                                    onClick={onClose}
                                                >
                                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="relative flex-1 px-6 py-8 space-y-8">
                                            {/* Department & Role Info */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <DetailRow
                                                    icon={BuildingOfficeIcon}
                                                    label="Departman"
                                                    value={user.department || 'Belirtilmedi'}
                                                    color="orange"
                                                />
                                                <DetailRow
                                                    icon={UserIcon}
                                                    label="Kullanıcı Adı"
                                                    value={user.username || 'Tanımlanmadı'}
                                                />
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">İletişim Bilgileri</h4>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <DetailRow icon={EnvelopeIcon} label="E-Posta" value={user.email} />
                                                    <DetailRow icon={PhoneIcon} label="Telefon" value={user.phone || 'Belirtilmedi'} />
                                                    <DetailRow icon={MapPinIcon} label="Adres" value={user.address || 'Belirtilmedi'} isMultiline />
                                                </div>
                                            </div>

                                            {/* Health & Identity Info */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kişisel Bilgiler</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <DetailRow
                                                        icon={IdentificationIcon}
                                                        label="Kan Grubu"
                                                        value={user.blood_group || 'Belirtilmedi'}
                                                        valueClass={user.blood_group?.includes('+') ? 'text-red-600' : ''}
                                                    />
                                                    <DetailRow
                                                        icon={IdentificationIcon}
                                                        label="Ehliyet"
                                                        value={user.driver_license || 'Yok'}
                                                    />
                                                </div>
                                            </div>

                                            {/* Financial & Job Info */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Finansal & İş Bilgileri</h4>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <DetailRow
                                                        icon={CalendarDaysIcon}
                                                        label="İşe Giriş Tarihi"
                                                        value={user.start_date ? new Date(user.start_date).toLocaleDateString('tr-TR') : 'Belirtilmedi'}
                                                    />
                                                    <DetailRow icon={BuildingOfficeIcon} label="Banka" value={user.bank_name || 'Belirtilmedi'} />
                                                    <DetailRow icon={BanknotesIcon} label="IBAN" value={user.iban || 'Belirtilmedi'} isMultiline />
                                                </div>
                                            </div>

                                            {/* Emergency Contact */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Acil Durum Kontağı</h4>
                                                <div className="p-4 bg-red-50/30 border border-red-100 rounded-2xl flex items-start">
                                                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-red-50 mr-4">
                                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{user.emergency_contact_name || 'Belirtilmedi'}</p>
                                                        <p className="text-xs font-bold text-red-600 mt-0.5">{user.emergency_contact_phone || 'Telefon Yok'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Permissions */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sistem Yetkileri</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {user.permissions && user.permissions.length > 0 ? (
                                                        user.permissions.map((p, i) => (
                                                            <span key={i} className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                                                <ShieldCheckIcon className="h-3 w-3 mr-1.5 text-orange-500" />
                                                                {PERMISSION_LABELS[p] || p}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic">Tanımlı yetki bulunamadı.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="px-6 py-6 bg-slate-50/50 border-t border-slate-100 space-y-3">
                                            <Button
                                                variant="orange"
                                                className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-[0.1em]"
                                                onClick={() => onEdit(user)}
                                            >
                                                <PencilSquareIcon className="h-4 w-4 mr-2" />
                                                PERSONEL BİLGİLERİNİ DÜZENLE
                                            </Button>
                                            <button
                                                className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors"
                                                onClick={() => onDelete(user)}
                                            >
                                                PERSONEL KAYDINI SİL
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}

function DetailRow({ icon: Icon, label, value, color = 'slate', isMultiline = false, valueClass = '' }: any) {
    const colorClasses: any = {
        orange: 'bg-orange-50 text-orange-500 border-orange-100',
        slate: 'bg-slate-50 text-slate-500 border-slate-100'
    };

    return (
        <div className="flex items-start">
            <div className={`p-2.5 rounded-xl border shadow-sm mr-4 shrink-0 ${colorClasses[color]}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className={`text-[13px] font-bold text-slate-700 leading-snug ${isMultiline ? 'line-clamp-3' : 'truncate'} ${valueClass}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}
