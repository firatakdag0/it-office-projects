'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import axios from '@/lib/axios';
import {
    UserIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    TrashIcon,
    PencilSquareIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import StaffFormModal from '@/components/staff/StaffFormModal';
import StaffDetailPanel from '@/components/staff/StaffDetailPanel';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    blood_group: string | null;
    driver_license: string | null;
    department: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    address: string | null;
    permissions: string[] | null;
}

export default function TeamSettingsPage() {
    const { user } = useAuth({ middleware: 'auth' });
    const router = useRouter();
    const { data: users, isLoading: usersLoading } = useSWR<User[]>('/users', () => axios.get('/users').then(res => res.data));

    useEffect(() => {
        if (user && user.role !== 'manager') {
            router.push('/');
        }
    }, [user, router]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleDelete = async (userToDelete: User) => {
        if (!confirm(`${userToDelete.name} isimli personeli silmek istediğinize emin misiniz?`)) return;

        setIsDeleting(userToDelete.id);
        try {
            await axios.delete(`/users/${userToDelete.id}`);
            mutate('/users');
            if (selectedUserForDetail?.id === userToDelete.id) {
                setIsDetailOpen(false);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu.');
        } finally {
            setIsDeleting(null);
        }
    };

    if (usersLoading && !users) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personel Yönetimi</h1>
                    <p className="mt-1 text-slate-500 font-bold uppercase tracking-widest text-[9px]">Ekip Bilgileri, Yetkiler ve Departman Yönetimi</p>
                </div>
                <Button
                    onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                    variant="orange"
                    className="h-11 px-6 rounded-xl font-black text-xs scale-100 hover:scale-105 active:scale-95 transition-all w-fit"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    YENİ PERSONEL EKLE
                </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-white rounded-2xl shadow-sm focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none font-bold text-sm text-slate-700 placeholder-slate-400"
                    placeholder="Personel ismi, e-posta veya departman ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users List (Table Container) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">PERSONEL</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">DEPARTMAN</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">İLETİŞİM</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ROL</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">İŞLEMLER</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((u) => (
                                <tr
                                    key={u.id}
                                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    onClick={() => { setSelectedUserForDetail(u); setIsDetailOpen(true); }}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">{u.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400">#{u.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        {u.department ? (
                                            <span className="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                <BuildingOfficeIcon className="h-3 w-3 mr-1.5" />
                                                {u.department}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 italic">Belirtilmedi</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-[11px] font-bold text-slate-500">
                                                <EnvelopeIcon className="h-3 w-3 mr-1.5 text-slate-300" />
                                                {u.email}
                                            </div>
                                            {u.phone && (
                                                <div className="flex items-center text-[11px] font-bold text-slate-500">
                                                    <PhoneIcon className="h-3 w-3 mr-1.5 text-slate-300" />
                                                    {u.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-transparent shadow-sm ${u.role === 'manager' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                                            {u.role === 'manager' ? 'YÖNETİCİ' : 'SAHA EKİBİ'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className="p-2 text-slate-300 hover:text-slate-600 transition-all rounded-lg group-hover:bg-white group-hover:shadow-sm"
                                            onClick={(e) => { e.stopPropagation(); setSelectedUserForDetail(u); setIsDetailOpen(true); }}
                                        >
                                            <ChevronRightIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <UserIcon className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Personel Bulunamadı</h3>
                        <p className="text-xs text-slate-500 font-bold max-w-xs mx-auto mt-1">Aramanızla eşleşen sonuç yok veya ekip henüz tanımlanmamış.</p>
                    </div>
                )}
            </div>

            {/* Modals & Panels */}
            <StaffFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { mutate('/users'); setIsModalOpen(false); if (selectedUserForDetail) setIsDetailOpen(false); }}
                staffToEdit={selectedUser}
            />

            <StaffDetailPanel
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                user={selectedUserForDetail}
                onEdit={(u) => { setSelectedUser(u); setIsModalOpen(true); }}
                onDelete={(u) => { handleDelete(u); }}
            />
        </div>
    );
}
