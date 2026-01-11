'use client';

import { useState, Fragment, useEffect } from 'react';
import axios from '@/lib/axios';
import { Dialog, Transition } from '@headlessui/react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
    UserIcon,
    BuildingOfficeIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCustomer?: any) => void;
    customerToEdit?: any; // If present, we are in Edit mode
}

export default function CustomerFormModal({ isOpen, onClose, onSuccess, customerToEdit }: CustomerFormModalProps) {
    const isEditing = !!customerToEdit;
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    // Form State
    const [type, setType] = useState('corporate');
    const [name, setName] = useState('');
    const [fullCompanyName, setFullCompanyName] = useState('');
    const [taxNumber, setTaxNumber] = useState('');
    const [taxOffice, setTaxOffice] = useState('');
    const [iban, setIban] = useState('');
    const [regionId, setRegionId] = useState<string | number>('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [mapsLink, setMapsLink] = useState('');

    const [availableRegions, setAvailableRegions] = useState<any[]>([]);

    // Contacts State
    const [contacts, setContacts] = useState<any[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Fetch Regions
    useEffect(() => {
        if (isOpen) {
            axios.get('/regions').then(res => setAvailableRegions(res.data)).catch(err => console.error('Bölgeler yüklenemedi', err));
        }
    }, [isOpen]);

    // Reset or Populate form when modal opens or customerToEdit changes
    useEffect(() => {
        if (isOpen) {
            if (customerToEdit) {
                setType(customerToEdit.type);
                setName(customerToEdit.name);
                setFullCompanyName(customerToEdit.full_company_name || '');
                setTaxNumber(customerToEdit.tax_number || '');
                setTaxOffice(customerToEdit.tax_office || '');
                setIban(customerToEdit.iban || '');
                setRegionId(customerToEdit.region_id || '');
                setPhone(customerToEdit.phone || '');
                setEmail(customerToEdit.email || '');
                setAddress(customerToEdit.address || '');
                setMapsLink(customerToEdit.maps_link || '');

                if (customerToEdit.contacts && customerToEdit.contacts.length > 0) {
                    setContacts(customerToEdit.contacts.map((c: any) => ({
                        name: c.name,
                        department: c.department || '',
                        phone: c.phone || '',
                        email: c.email || ''
                    })));
                } else {
                    setContacts([]);
                }
            } else {
                // Reset for Create mode
                setType('corporate');
                setName('');
                setFullCompanyName('');
                setTaxNumber('');
                setTaxOffice('');
                setIban('');
                setRegionId('');
                setPhone('');
                setEmail('');
                setAddress('');
                setMapsLink('');
                setContacts([]);
                setCurrentStep(1);
            }
        }
    }, [isOpen, customerToEdit]);


    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };


    const handleAddContact = () => {
        setContacts([...contacts, { name: '', department: '', phone: '', email: '' }]);
    };

    const handleRemoveContact = (index: number) => {
        setContacts(contacts.filter((_, i) => i !== index));
    };

    const handleContactChange = (index: number, field: string, value: string) => {
        const newContacts = [...contacts];
        // @ts-ignore
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Safety check: Only proceed if we are really on the last step
        if (currentStep < 3) return;

        setIsLoading(true);

        const payload: any = {
            name,
            type,
            full_company_name: type === 'corporate' ? fullCompanyName : null,
            tax_number: type === 'corporate' ? taxNumber : null,
            tax_office: type === 'corporate' ? taxOffice : null,
            iban,
            region_id: regionId || null,
            phone,
            email,
            address,
            maps_link: mapsLink,
        };

        if (type === 'corporate') {
            payload.contacts = contacts.filter(c => c.name.trim() !== '');
        }

        try {
            let response;
            if (isEditing && customerToEdit) {
                response = await axios.put(`/customers/${customerToEdit.id}`, payload);
            } else {
                response = await axios.post('/customers', payload);
            }
            onSuccess(response.data); // Return the full customer object
            onClose();
        } catch (error) {
            alert('İşlem sırasında hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!customerToEdit) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsLoading(true);
        try {
            await axios.delete(`/customers/${customerToEdit.id}`);
            onSuccess();
            onClose();
        } catch (error) {
            alert('Silme işlemi başarısız.');
        } finally {
            setIsLoading(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-slate-900 mb-6 flex items-center justify-between">
                                    {isEditing ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                        <span className="sr-only">Kapat</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </Dialog.Title>

                                <div className="mb-8">
                                    <div className="flex items-center justify-between relative px-2">
                                        {[1, 2, 3].map((s) => (
                                            <div key={s} className="flex flex-col items-center z-10">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${currentStep === s ? 'bg-orange-500 text-white ring-4 ring-orange-100 shadow-lg' : currentStep > s ? 'bg-green-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                                                    {currentStep > s ? (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    ) : s}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-tighter mt-2 ${currentStep === s ? 'text-orange-500' : 'text-slate-400'}`}>
                                                    {s === 1 ? 'KİMLİK' : s === 2 ? 'İLETİŞİM' : 'DETAYLAR'}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-0">
                                            <div
                                                className="h-full bg-orange-500 transition-all duration-500"
                                                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <form className="mt-2" onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>

                                    {/* STEP 1: IDENTITY */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">MÜŞTERİ TÜRÜ</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div
                                                        className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${type === 'corporate' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:border-orange-200'}`}
                                                        onClick={() => setType('corporate')}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <div className={`p-1.5 rounded-full ${type === 'corporate' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                <BuildingOfficeIcon className="h-5 w-5" />
                                                            </div>
                                                            <span className={`font-semibold text-sm ${type === 'corporate' ? 'text-orange-900' : 'text-slate-600'}`}>Kurumsal</span>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${type === 'individual' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:border-orange-200'}`}
                                                        onClick={() => setType('individual')}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <div className={`p-1.5 rounded-full ${type === 'individual' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                <UserIcon className="h-5 w-5" />
                                                            </div>
                                                            <span className={`font-semibold text-sm ${type === 'individual' ? 'text-orange-900' : 'text-slate-600'}`}>Bireysel</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Input
                                                label={type === 'corporate' ? 'Kısa Ad / Ünvan' : 'Ad Soyad'}
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                                placeholder={type === 'corporate' ? "Örn: Örnek Bilişim" : "Örn: Ahmet Yılmaz"}
                                            />

                                            {type === 'corporate' && (
                                                <Input
                                                    label="Tam Şirket Ünvanı"
                                                    value={fullCompanyName}
                                                    onChange={e => setFullCompanyName(e.target.value)}
                                                    placeholder="Örn: Örnek Bilişim Teknoloji Ltd. Şti."
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* STEP 2: CONTACT & LOCATION */}
                                    {currentStep === 2 && (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Telefon" value={phone} onChange={e => setPhone(e.target.value)} placeholder="05XX..." />
                                                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri Bölgesi</label>
                                                <select
                                                    value={regionId}
                                                    onChange={(e) => setRegionId(e.target.value)}
                                                    className="w-full rounded-2xl border-slate-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-3 border bg-white text-slate-900"
                                                >
                                                    <option value="">Bölge Seçin (İsteğe Bağlı)</option>
                                                    {availableRegions.map(reg => (
                                                        <option key={reg.id} value={reg.id}>{reg.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <Input
                                                label="Konum Linki (Maps)"
                                                value={mapsLink}
                                                onChange={e => setMapsLink(e.target.value)}
                                                placeholder="https://maps.google.com/..."
                                                required
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1 text-xs font-black uppercase tracking-widest text-slate-400">AÇIK ADRES</label>
                                                <textarea
                                                    className="w-full rounded-2xl border-slate-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-3 border placeholder:text-slate-400"
                                                    rows={3}
                                                    value={address}
                                                    onChange={e => setAddress(e.target.value)}
                                                    placeholder="Mahalle, Sokak, No..."
                                                ></textarea>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: DETAILS & CONTACTS */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {type === 'corporate' ? (
                                                <div className="space-y-4">
                                                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                                                        <h4 className="text-sm font-bold text-orange-900 flex items-center">
                                                            <UserIcon className="h-4 w-4 mr-2" />
                                                            Firma Yetkilileri
                                                        </h4>
                                                        <p className="text-xs text-orange-700 mt-1">İletişim kurulacak kişileri ekleyin.</p>
                                                    </div>

                                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                                                        {contacts.length === 0 ? (
                                                            <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                                                <p className="text-sm font-bold text-slate-400">Henüz yetkili eklenmedi.</p>
                                                            </div>
                                                        ) : (
                                                            contacts.map((contact, index) => (
                                                                <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative group hover:border-orange-300 transition-colors">
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="col-span-2">
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Ad Soyad"
                                                                                className="block w-full border-0 border-b border-transparent bg-transparent focus:border-orange-600 focus:ring-0 text-sm p-0 transition-colors font-bold text-slate-900 placeholder:text-slate-400"
                                                                                value={contact.name}
                                                                                onChange={e => handleContactChange(index, 'name', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Telefon"
                                                                            className="block w-full border-0 border-b border-transparent bg-transparent focus:border-orange-600 focus:ring-0 text-xs p-0 transition-colors text-slate-600 placeholder:text-slate-400"
                                                                            value={contact.phone}
                                                                            onChange={e => handleContactChange(index, 'phone', e.target.value)}
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Departman"
                                                                            className="block w-full border-0 border-b border-transparent bg-transparent focus:border-orange-600 focus:ring-0 text-xs p-0 transition-colors text-slate-600 placeholder:text-slate-400"
                                                                            value={contact.department}
                                                                            onChange={e => handleContactChange(index, 'department', e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveContact(index)}
                                                                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100"
                                                                    >
                                                                        <TrashIcon className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddContact}
                                                        className="w-full flex items-center justify-center px-4 py-2.5 border-2 border-dashed border-slate-200 text-sm font-bold rounded-2xl text-slate-600 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all"
                                                    >
                                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                                        Yeni Yetkili Ekle
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                                                    <p className="text-sm font-bold text-slate-600 italic">Bireysel müşteri için finansal detaylar (opsiyonel)</p>
                                                </div>
                                            )}

                                            <div className="pt-4 space-y-4">
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">FİNANSAL BİLGİLER</label>
                                                {type === 'corporate' && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Input label="Vergi Numarası" value={taxNumber} onChange={e => setTaxNumber(e.target.value)} placeholder="000... (Opsiyonel)" />
                                                        <Input label="Vergi Dairesi" value={taxOffice} onChange={e => setTaxOffice(e.target.value)} placeholder="Opsiyonel" />
                                                    </div>
                                                )}
                                                <Input label="IBAN Numarası" value={iban} onChange={e => setIban(e.target.value)} placeholder="TR00 0000..." />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8 flex justify-between items-center pt-5 border-t border-slate-100">
                                        <div className="flex items-center">
                                            {isEditing && currentStep === 1 && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleDelete}
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 border-none rounded-2xl h-11 px-6 font-bold"
                                                >
                                                    <TrashIcon className="h-5 w-5 mr-2" />
                                                    Sil
                                                </Button>
                                            )}
                                            {currentStep > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleBack}
                                                    className="bg-slate-50 text-slate-600 hover:bg-slate-100 border-none rounded-2xl h-11 px-6 font-bold"
                                                >
                                                    Geri
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex space-x-3">
                                            {currentStep < 3 ? (
                                                <Button
                                                    type="button"
                                                    variant="orange"
                                                    onClick={handleNext}
                                                    className="rounded-2xl h-11 px-8 font-bold shadow-lg shadow-orange-200"
                                                >
                                                    Devam Et
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    onClick={() => handleSubmit()}
                                                    isLoading={isLoading}
                                                    variant="orange"
                                                    className="rounded-2xl h-11 px-8 font-bold shadow-lg shadow-orange-200"
                                                >
                                                    {isEditing ? 'Güncelle' : 'Kaydet'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isLoading}
                title="Müşteriyi Sil"
                description={`"${name}" isimli müşteriyi silmek üzeresiniz. Bu işlem geri alınamaz ve müşteriye bağlı tüm geçmiş veriler etkilenebilir. Devam etmek istiyor musunuz?`}
                confirmText="Evet, Sil"
                cancelText="Vazgeç"
            />
        </Transition>
    );
}
