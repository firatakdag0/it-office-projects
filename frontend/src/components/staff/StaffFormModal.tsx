'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, UserIcon, PhoneIcon, GlobeAltIcon, IdentificationIcon, BuildingOfficeIcon, UserPlusIcon, KeyIcon, ShieldCheckIcon, BanknotesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import axios from '@/lib/axios';

interface StaffFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    staffToEdit?: any;
}

const PERMISSION_GROUPS = [
    {
        title: 'Müşteri Yönetimi',
        permissions: [
            { id: 'view_customers', label: 'Müşterileri Görüntüle', description: 'Müşteri listesini ve detaylarını görme yetkisi.' },
            { id: 'create_customers', label: 'Müşteri Oluştur', description: 'Yeni müşteri kaydı açma yetkisi.' },
            { id: 'edit_customers', label: 'Müşteri Düzenle', description: 'Müşteri bilgilerini güncelleme yetkisi.' },
            { id: 'delete_customers', label: 'Müşteri Sil', description: 'Müşteri kaydını silme yetkisi.' },
        ]
    },
    {
        title: 'İş Yönetimi',
        permissions: [
            { id: 'view_all_jobs', label: 'Tüm İşleri Gör', description: 'Sadece kendine atananları değil, tüm işleri görme yetkisi.' },
            { id: 'create_jobs', label: 'İş Kaydı Oluştur', description: 'Sisteme yeni iş talebi girişi yapma yetkisi.' },
            { id: 'edit_jobs', label: 'İş Detayı Düzenle', description: 'İş içeriğini ve durumunu değiştirme yetkisi.' },
            { id: 'delete_jobs', label: 'İş Kaydı Sil', description: 'Sistemdeki iş kayıtlarını silme yetkisi.' },
            { id: 'assign_jobs', label: 'Personel Ata', description: 'İşlere sorumlu personel atama yetkisi.' },
        ]
    },
    {
        title: 'Finansal Yetkiler',
        permissions: [
            { id: 'view_prices', label: 'Fiyatları Gör', description: 'İş ücretlerini ve maliyetleri görme yetkisi.' },
            { id: 'edit_prices', label: 'Fiyatları Düzenle', description: 'İşlerin ücret bilgilerini güncelleme yetkisi.' },
            { id: 'view_financial_reports', label: 'Özet Raporlar', description: 'Genel finansal durum ve ciro özetini görme yetkisi.' },
        ]
    },
    {
        title: 'Sistem Yönetimi',
        permissions: [
            { id: 'manage_regions', label: 'Bölgeleri Yönet', description: 'Bölge ekleme, silme ve düzenleme yetkisi.' },
            { id: 'manage_staff', label: 'Personel Yönetimi', description: 'Personel kayıtlarını ve yetkilerini yönetme yetkisi.' },
        ]
    }
];

export default function StaffFormModal({ isOpen, onClose, onSuccess, staffToEdit }: StaffFormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'field_staff',
        phone: '',
        blood_group: '',
        driver_license: '',
        department: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        address: '',
        permissions: [] as string[],
        bank_name: '',
        iban: '',
        start_date: '',
    });

    useEffect(() => {
        if (staffToEdit) {
            setFormData({
                name: staffToEdit.name || '',
                email: staffToEdit.email || '',
                username: staffToEdit.username || '',
                password: '', // Password stays empty on edit unless changed
                role: staffToEdit.role || 'field_staff',
                phone: staffToEdit.phone || '',
                blood_group: staffToEdit.blood_group || '',
                driver_license: staffToEdit.driver_license || '',
                department: staffToEdit.department || '',
                emergency_contact_name: staffToEdit.emergency_contact_name || '',
                emergency_contact_phone: staffToEdit.emergency_contact_phone || '',
                address: staffToEdit.address || '',
                permissions: staffToEdit.permissions || [],
                bank_name: staffToEdit.bank_name || '',
                iban: staffToEdit.iban || '',
                start_date: staffToEdit.start_date || '',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                username: '',
                password: '',
                role: 'field_staff',
                phone: '',
                blood_group: '',
                driver_license: '',
                department: '',
                emergency_contact_name: '',
                emergency_contact_phone: '',
                address: '',
                permissions: [],
                bank_name: '',
                iban: '',
                start_date: '',
            });
        }
    }, [staffToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = { ...formData };
            if (staffToEdit && !data.password) {
                delete (data as any).password;
            }

            if (staffToEdit) {
                await axios.put(`/users/${staffToEdit.id}`, data);
            } else {
                await axios.post('/users', data);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePermission = (id: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(id)
                ? prev.permissions.filter(p => p !== id)
                : [...prev.permissions, id]
        }));
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-white">
                                <form onSubmit={handleSubmit}>
                                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600 mr-3 shadow-sm">
                                                <UserPlusIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <Dialog.Title as="h3" className="text-lg font-black text-slate-900">
                                                    {staffToEdit ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
                                                </Dialog.Title>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Personel Kartı ve Yetkilendirme</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-all"
                                            onClick={onClose}
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Basic Account Info */}
                                            <div className="space-y-6">
                                                <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                                                    <KeyIcon className="h-3.5 w-3.5 text-orange-500" />
                                                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Hesap Erişimi</h4>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Ad Soyad</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm text-slate-700 outline-none"
                                                            placeholder="Örn: Ahmet Yılmaz"
                                                            value={formData.name}
                                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">E-Posta Adresi</label>
                                                        <input
                                                            type="email"
                                                            required
                                                            className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm text-slate-700 outline-none"
                                                            placeholder="ahmet@it-office.com"
                                                            value={formData.email}
                                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Kullanıcı Adı (Opsiyonel)</label>
                                                        <input
                                                            type="text"
                                                            className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm text-slate-700 outline-none"
                                                            placeholder="Örn: ahmet123"
                                                            value={formData.username}
                                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">
                                                            {staffToEdit ? 'Şifre (Değiştirmek için)' : 'Şifre'}
                                                        </label>
                                                        <input
                                                            type="password"
                                                            required={!staffToEdit}
                                                            className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm text-slate-700 outline-none"
                                                            placeholder="••••••••"
                                                            value={formData.password}
                                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Rol</label>
                                                            <select
                                                                className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none appearance-none cursor-pointer"
                                                                value={formData.role}
                                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                            >
                                                                <option value="field_staff">Saha Personeli</option>
                                                                <option value="manager">Yönetici</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Departman</label>
                                                            <input
                                                                type="text"
                                                                className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none"
                                                                placeholder="Örn: Teknik Destek"
                                                                value={formData.department}
                                                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detailed Personal Info */}
                                            <div className="space-y-6">
                                                <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                                                    <IdentificationIcon className="h-3.5 w-3.5 text-orange-500" />
                                                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Kişisel Bilgiler & İletişim</h4>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Telefon</label>
                                                            <input
                                                                type="text"
                                                                className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none"
                                                                placeholder="05..."
                                                                value={formData.phone}
                                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Kan Grubu</label>
                                                            <select
                                                                className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none appearance-none cursor-pointer"
                                                                value={formData.blood_group}
                                                                onChange={e => setFormData({ ...formData, blood_group: e.target.value })}
                                                            >
                                                                <option value="">Seçiniz</option>
                                                                <option value="A+">A Rh (+)</option>
                                                                <option value="A-">A Rh (-)</option>
                                                                <option value="B+">B Rh (+)</option>
                                                                <option value="B-">B Rh (-)</option>
                                                                <option value="AB+">AB Rh (+)</option>
                                                                <option value="AB-">AB Rh (-)</option>
                                                                <option value="0+">0 Rh (+)</option>
                                                                <option value="0-">0 Rh (-)</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Ehliyet Sınıfı</label>
                                                            <input
                                                                type="text"
                                                                className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none"
                                                                placeholder="Örn: B Sınıfı"
                                                                value={formData.driver_license}
                                                                onChange={e => setFormData({ ...formData, driver_license: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Acil Durum Tel</label>
                                                            <input
                                                                type="text"
                                                                className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none"
                                                                placeholder="05..."
                                                                value={formData.emergency_contact_phone}
                                                                onChange={e => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Acil Durum Kişisi</label>
                                                        <input
                                                            type="text"
                                                            className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none"
                                                            placeholder="Örn: Annem / Eşim"
                                                            value={formData.emergency_contact_name}
                                                            onChange={e => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Açık Adres</label>
                                                        <textarea
                                                            rows={2}
                                                            className="block w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none resize-none"
                                                            placeholder="Ev adresi bilgileri..."
                                                            value={formData.address}
                                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financial & Job Info */}
                                        <div className="mt-10 space-y-6">
                                            <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                                                <BanknotesIcon className="h-3.5 w-3.5 text-orange-500" />
                                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Finansal & İş Bilgileri</h4>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">İşe Giriş Tarihi</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
                                                        </div>
                                                        <input
                                                            type="date"
                                                            className="block w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none"
                                                            value={formData.start_date || ''}
                                                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Banka Adı</label>
                                                        <input
                                                            type="text"
                                                            className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none"
                                                            placeholder="Örn: Garanti BBVA"
                                                            value={formData.bank_name}
                                                            onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">IBAN</label>
                                                        <input
                                                            type="text"
                                                            className="block w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-slate-700 outline-none"
                                                            placeholder="TR..."
                                                            value={formData.iban}
                                                            onChange={e => setFormData({ ...formData, iban: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Permissions Section */}
                                        <div className="mt-10 space-y-8 pb-10">
                                            <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                                                <ShieldCheckIcon className="h-3.5 w-3.5 text-orange-500" />
                                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Yetkilendirme Ayarları</h4>
                                            </div>

                                            <div className="space-y-8">
                                                {PERMISSION_GROUPS.map((group) => (
                                                    <div key={group.title} className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100/50 w-fit px-3 py-1 rounded-lg">
                                                            {group.title}
                                                        </h5>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {group.permissions.map(permission => (
                                                                <button
                                                                    key={permission.id}
                                                                    type="button"
                                                                    onClick={() => togglePermission(permission.id)}
                                                                    className={`
                                                                        text-left p-4 rounded-2xl border-2 transition-all group relative overflow-hidden
                                                                        ${formData.permissions.includes(permission.id)
                                                                            ? 'border-orange-500 bg-orange-50'
                                                                            : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'
                                                                        }
                                                                    `}
                                                                >
                                                                    <div className="flex flex-col h-full">
                                                                        <div className="flex items-center justify-between mb-1.5">
                                                                            <span className={`text-[11px] font-black transition-colors ${formData.permissions.includes(permission.id) ? 'text-orange-900' : 'text-slate-700'}`}>
                                                                                {permission.label}
                                                                            </span>
                                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.permissions.includes(permission.id) ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}>
                                                                                {formData.permissions.includes(permission.id) && <ShieldCheckIcon className="h-2.5 w-2.5 text-white" />}
                                                                            </div>
                                                                        </div>
                                                                        <p className={`text-[9px] font-bold leading-tight ${formData.permissions.includes(permission.id) ? 'text-orange-600/70' : 'text-slate-400'}`}>
                                                                            {permission.description}
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={onClose}
                                            className="font-bold text-xs px-6 h-10"
                                        >
                                            Vazgeç
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="orange"
                                            isLoading={isLoading}
                                            className="font-black text-xs px-8 h-10 shadow-lg shadow-orange-100"
                                        >
                                            {staffToEdit ? 'Güncelle' : 'Personeli Kaydet'}
                                        </Button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
