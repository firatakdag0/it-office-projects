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
    const [type, setType] = useState('individual');
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
    const [contacts, setContacts] = useState([{ name: '', department: '', phone: '', email: '' }]);
    const [activeTab, setActiveTab] = useState('info');

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
                    setContacts([{ name: '', department: '', phone: '', email: '' }]);
                }
            } else {
                // Reset for Create mode
                setType('individual');
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
                setContacts([{ name: '', department: '', phone: '', email: '' }]);
                setActiveTab('info');
            }
        }
    }, [isOpen, customerToEdit]);


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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

                                {/* TABS HEADER */}
                                {type === 'corporate' ? (
                                    <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-6">
                                        <button
                                            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-orange-400 focus:outline-none focus:ring-2 ${activeTab === 'info'
                                                ? 'bg-white text-orange-600 shadow'
                                                : 'text-gray-600 hover:bg-white/[0.12] hover:text-white'
                                                }`}
                                            onClick={() => setActiveTab('info')}
                                        >
                                            Firma Bilgileri
                                        </button>
                                        <button
                                            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-orange-400 focus:outline-none focus:ring-2 ${activeTab === 'contacts'
                                                ? 'bg-white text-orange-600 shadow'
                                                : 'text-gray-600 hover:bg-white/[0.12] hover:text-white'
                                                }`}
                                            onClick={() => setActiveTab('contacts')}
                                        >
                                            Yetkililer ({contacts.length})
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mb-4 text-sm text-gray-500 italic border-b pb-2">Bireysel müşteri bilgileri</div>
                                )}

                                <form onSubmit={handleSubmit} className="mt-2">

                                    {/* INFO TAB CONTENT */}
                                    <div className={activeTab === 'info' || type === 'individual' ? 'block space-y-5' : 'hidden'}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div
                                                className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${type === 'individual' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
                                                onClick={() => { setType('individual'); setActiveTab('info'); }}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <div className={`p-1.5 rounded-full ${type === 'individual' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        <UserIcon className="h-5 w-5" />
                                                    </div>
                                                    <span className={`font-semibold text-sm ${type === 'individual' ? 'text-orange-900' : 'text-gray-600'}`}>Bireysel</span>
                                                </div>
                                            </div>
                                            <div
                                                className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${type === 'corporate' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}
                                                onClick={() => setType('corporate')}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <div className={`p-1.5 rounded-full ${type === 'corporate' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        <BuildingOfficeIcon className="h-5 w-5" />
                                                    </div>
                                                    <span className={`font-semibold text-sm ${type === 'corporate' ? 'text-indigo-900' : 'text-gray-600'}`}>Kurumsal</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Input label={type === 'corporate' ? 'Kısa Ad / Ünvan' : 'Ad Soyad'} value={name} onChange={e => setName(e.target.value)} required placeholder="Örn: Ahmet Yılmaz" />

                                        {type === 'corporate' && (
                                            <div className="space-y-4 pt-2 border-t border-indigo-100 mt-4">
                                                <Input label="Tam Şirket Ünvanı" value={fullCompanyName} onChange={e => setFullCompanyName(e.target.value)} placeholder="Örn: Örnek Bilişim Teknoloji Ltd. Şti." />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input label="Vergi Numarası" value={taxNumber} onChange={e => setTaxNumber(e.target.value)} placeholder="0000000000" />
                                                    <Input label="Vergi Dairesi" value={taxOffice} onChange={e => setTaxOffice(e.target.value)} placeholder="Ateşehır V.D." />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Bölgesi</label>
                                            <select
                                                value={regionId}
                                                onChange={(e) => setRegionId(e.target.value)}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2.5 border bg-white text-gray-900"
                                            >
                                                <option value="">Bölge Seçin (İsteğe Bağlı)</option>
                                                {availableRegions.map(reg => (
                                                    <option key={reg.id} value={reg.id}>{reg.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Telefon" value={phone} onChange={e => setPhone(e.target.value)} placeholder="05XX..." />
                                            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" />
                                        </div>

                                        <Input label="IBAN Numarası" value={iban} onChange={e => setIban(e.target.value)} placeholder="TR00 0000 0000..." />

                                        <Input
                                            label="Konum Linki (Maps)"
                                            value={mapsLink}
                                            onChange={e => setMapsLink(e.target.value)}
                                            placeholder="https://maps.google.com/..."
                                            required
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Açık Adres</label>
                                            <textarea
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border"
                                                rows={3}
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                placeholder="Mahalle, Sokak, No..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* CONTACTS TAB CONTENT */}
                                    <div className={activeTab === 'contacts' && type === 'corporate' ? 'block space-y-4' : 'hidden'}>
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                                            <h4 className="text-sm font-medium text-blue-900 flex items-center">
                                                <UserIcon className="h-4 w-4 mr-2" />
                                                Yetkili Listesi
                                            </h4>
                                            <p className="text-xs text-blue-700 mt-1">Bu firmaya bağlı iletişim kurulacak kişileri yönetin.</p>
                                        </div>

                                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                            {contacts.map((contact, index) => (
                                                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative group hover:border-indigo-300 transition-colors">
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                        <div className="sm:col-span-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Ad Soyad"
                                                                className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-indigo-600 focus:bg-white focus:ring-0 sm:text-sm px-0 py-1 transition-colors font-medium text-gray-900"
                                                                value={contact.name}
                                                                onChange={e => handleContactChange(index, 'name', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="text"
                                                                placeholder="Departman"
                                                                className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-indigo-600 focus:bg-white focus:ring-0 text-xs px-0 py-1 transition-colors text-gray-600"
                                                                value={contact.department}
                                                                onChange={e => handleContactChange(index, 'department', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="text"
                                                                placeholder="Telefon"
                                                                className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-indigo-600 focus:bg-white focus:ring-0 text-xs px-0 py-1 transition-colors text-gray-600"
                                                                value={contact.phone}
                                                                onChange={e => handleContactChange(index, 'phone', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <input
                                                                type="email"
                                                                placeholder="Email Adresi"
                                                                className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-indigo-600 focus:bg-white focus:ring-0 text-xs px-0 py-1 transition-colors text-gray-600"
                                                                value={contact.email}
                                                                onChange={e => handleContactChange(index, 'email', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveContact(index)}
                                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddContact}
                                            className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-600 bg-white hover:bg-gray-50 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                                        >
                                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                            Yeni Yetkili Ekle
                                        </button>
                                    </div>

                                    <div className="mt-8 flex justify-end space-x-3 pt-5 border-t border-gray-100">
                                        <Button type="button" variant="secondary" onClick={onClose}>İptal</Button>
                                        <Button type="submit" isLoading={isLoading} variant="orange">
                                            {isEditing ? 'Değişiklikleri Kaydet' : 'Müşteriyi Oluştur'}
                                        </Button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
