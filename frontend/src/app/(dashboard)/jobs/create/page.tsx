'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import useSWR, { mutate } from 'swr';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CustomerFormModal from '@/components/customers/CustomerFormModal';
import {
    BriefcaseIcon,
    CalendarIcon,
    UserIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    PlusIcon,
    PhotoIcon,
    XMarkIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function CreateJobPage() {
    const router = useRouter();
    const { data: customers } = useSWR('/customers', fetcher);
    const { data: regions } = useSWR('/regions', fetcher);
    const { data: staff } = useSWR('/users', fetcher);

    const [isLoading, setIsLoading] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [customerToEdit, setCustomerToEdit] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(1);

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [regionId, setRegionId] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState('support');
    const [customType, setCustomType] = useState('');
    const [description, setDescription] = useState('');
    const [materials, setMaterials] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [assignedUserId, setAssignedUserId] = useState('');
    const [price, setPrice] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [contactId, setContactId] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [locationType, setLocationType] = useState('customer');
    const [locationAddress, setLocationAddress] = useState('');
    const [mapsUrl, setMapsUrl] = useState('');

    // Filtered contacts based on selected customer
    const activeCustomer = customers?.find((c: any) => c.id === parseInt(customerId));
    const customerContacts = activeCustomer?.contacts || [];

    useEffect(() => {
        if (customerId && customers) {
            const customer = customers.find((c: any) => c.id === parseInt(customerId));
            if (!contactId && customer) {
                setContactPhone(customer.phone || '');
            }
            if (customer && customer.region_id) {
                setRegionId(customer.region_id.toString());
            }
        }
    }, [customerId, customers, contactId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setCustomerId(id);
        const customer = customers?.find((c: any) => c.id === parseInt(id));
        if (customer) {
            setContactId('');
            setContactName('');
            setContactPhone(customer.phone || '');
            if (customer.region_id) setRegionId(customer.region_id.toString());
        } else {
            setContactPhone('');
            setRegionId('');
        }
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setContactId(id);
        if (id === 'manual') {
            setContactName('');
            setContactPhone('');
            return;
        }
        if (id) {
            const contact = customerContacts.find((c: any) => c.id === parseInt(id));
            if (contact) {
                setContactName(contact.name);
                setContactPhone(contact.phone || '');
            }
        } else {
            setContactName('');
            setContactPhone(activeCustomer?.phone || '');
        }
    };

    const nextStep = () => {
        if (currentStep === 1 && !customerId) {
            alert('Lütfen bir müşteri seçiniz.');
            return;
        }
        if (currentStep === 2 && (!title || !description)) {
            alert('Lütfen iş başlığı ve açıklama alanlarını doldurunuz.');
            return;
        }
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduledAt) {
            alert('Lütfen planlanan tarih ve saat bilgisini giriniz.');
            return;
        }
        setIsLoading(true);

        const formData = new FormData();
        formData.append('customer_id', customerId);
        if (regionId) formData.append('region_id', regionId);
        formData.append('title', title);
        formData.append('type', type === 'other' ? customType : type);
        formData.append('description', description);
        if (materials) formData.append('materials', materials);
        if (scheduledAt) formData.append('start_date', scheduledAt);
        formData.append('status', 'pending');
        formData.append('priority', 'medium');

        if (assignedUserId) formData.append('assigned_user_id', assignedUserId);
        if (price) formData.append('price', price);

        if (contactId && contactId !== 'manual') formData.append('authorized_person_id', contactId);
        if (contactName) formData.append('contact_name', contactName);
        if (contactPhone) formData.append('contact_phone', contactPhone);
        if (locationType === 'custom') {
            if (locationAddress) formData.append('location_address', locationAddress);
            if (mapsUrl) formData.append('maps_url', mapsUrl);
        }

        files.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        try {
            await axios.post('/jobs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            mutate('/jobs');
            router.push('/jobs');
        } catch (error: any) {
            alert('İş oluşturulurken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    if (!customers || !staff) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    const steps = [
        { id: 1, name: 'Müşteri & Konum', icon: UserIcon },
        { id: 2, name: 'İş Detayları', icon: BriefcaseIcon },
        { id: 3, name: 'Planlama', icon: CalendarIcon },
    ];

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Yeni İş <span className="text-orange-600">Oluştur</span></h1>
                <p className="mt-1 text-slate-400 font-bold uppercase tracking-widest text-[10px]">OPERASYONEL SERVİS VE MONTAJ KAYDI</p>
            </div>

            {/* Stepper */}
            <div className="mb-12">
                <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${isActive ? 'bg-orange-600 border-orange-100 text-white scale-110 shadow-xl shadow-orange-100' :
                                    isCompleted ? 'bg-green-500 border-green-100 text-white shadow-lg shadow-green-100' :
                                        'bg-white border-slate-50 text-slate-300'
                                    }`}>
                                    {isCompleted ? <CheckIcon className="h-6 w-6 stroke-[3px]" /> : <Icon className="h-6 w-6 stroke-[2px]" />}
                                </div>
                                <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
                                    {step.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col transition-all duration-500">
                        {/* Step 1: Customer & Location */}
                        {currentStep === 1 && (
                            <div className="p-8 sm:p-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-10 text-center">
                                    <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-50 text-blue-600 rounded-3xl mb-4 border border-blue-100">
                                        <UserIcon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800">Müşteri Seçimi</h3>
                                    <p className="text-sm font-bold text-slate-400 mt-1">İşin yapılacağı müşteriyi ve tam konumu belirleyin.</p>
                                </div>

                                <div className="space-y-8 max-w-xl mx-auto">
                                    <div className="relative group">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">MÜŞTERİ SEÇİN *</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <select
                                                    value={customerId}
                                                    onChange={handleCustomerChange}
                                                    required
                                                    className="w-full h-14 pl-4 pr-10 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                                >
                                                    <option value="">-- Müşteri Listesi --</option>
                                                    {customers.map((c: any) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name} {c.type === 'corporate' ? '(Kurumsal)' : '(Bireysel)'}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronRightIcon className="h-5 w-5 rotate-90" />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomerToEdit(null);
                                                    setIsCustomerModalOpen(true);
                                                }}
                                                className="h-14 w-14 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-600 transition-all shadow-sm"
                                            >
                                                <PlusIcon className="h-6 w-6 stroke-[3px]" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">MÜŞTERİ YETKİLİSİ / MUHATTAP</label>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <select
                                                        value={contactId}
                                                        onChange={handleContactChange}
                                                        disabled={!customerId}
                                                        className="w-full h-14 pl-4 pr-10 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none disabled:opacity-50"
                                                    >
                                                        <option value="">-- Yetkili Seçin (Opsiyonel) --</option>
                                                        {customerContacts.map((c: any) => (
                                                            <option key={c.id} value={c.id}>{c.name} {c.department ? `(${c.department})` : ''}</option>
                                                        ))}
                                                        <option value="manual">+ El ile veri gir...</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <ChevronRightIcon className="h-5 w-5 rotate-90" />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (activeCustomer) {
                                                            setCustomerToEdit(activeCustomer);
                                                            setIsCustomerModalOpen(true);
                                                        }
                                                    }}
                                                    disabled={!customerId}
                                                    title="Müşteri kartını düzenle / Yetkili ekle"
                                                    className="h-14 w-14 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-600 transition-all shadow-sm disabled:opacity-50"
                                                >
                                                    <PlusIcon className="h-6 w-6 stroke-[3px]" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            {contactId === 'manual' && (
                                                <div className="mb-6 animate-in zoom-in-95 duration-200">
                                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">YETKİLİ ADI SOYADI *</label>
                                                    <input
                                                        type="text"
                                                        value={contactName}
                                                        onChange={(e) => setContactName(e.target.value)}
                                                        placeholder="Örn: Kübra Hanım (Muhasebe)"
                                                        className="w-full h-14 px-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                                    />
                                                </div>
                                            )}
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">İLETİŞİM TELEFONU</label>
                                            <input
                                                type="text"
                                                value={contactPhone}
                                                onChange={(e) => setContactPhone(e.target.value)}
                                                placeholder="05..."
                                                className="w-full h-14 px-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">İŞ ADRESİ / KONUM</label>

                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm mb-4">
                                            <span className="text-sm font-bold text-slate-700">Farklı adres girmek istiyorum</span>
                                            <button
                                                type="button"
                                                onClick={() => setLocationType(locationType === 'custom' ? 'customer' : 'custom')}
                                                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${locationType === 'custom' ? 'bg-orange-600' : 'bg-slate-200'
                                                    }`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${locationType === 'custom' ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        {locationType === 'customer' ? (
                                            <div className="px-5 py-4 border-2 border-dashed border-slate-200 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="flex items-start gap-3">
                                                    <MapPinIcon className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-orange-600/80">VARSAYILAN MÜŞTERİ ADRESİ</p>
                                                        <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                                            {activeCustomer?.address || 'Müşteri adresi tanımlanmamış. Lütfen müşteri kartından adres ekleyin veya yukarıdaki butonu kullanarak manuel adres girişi yapın.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <Input
                                                    placeholder="Açık Adres / Konum Tarifi"
                                                    value={locationAddress}
                                                    onChange={e => setLocationAddress(e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Google Maps Linki (Opsiyonel)"
                                                    value={mapsUrl}
                                                    onChange={e => setMapsUrl(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Job Details */}
                        {currentStep === 2 && (
                            <div className="p-8 sm:p-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-10 text-center">
                                    <div className="inline-flex items-center justify-center h-16 w-16 bg-orange-50 text-orange-600 rounded-3xl mb-4 border border-orange-100">
                                        <BriefcaseIcon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800">İş Detayları</h3>
                                    <p className="text-sm font-bold text-slate-400 mt-1">Yapılacak işle ilgili tüm ayrıntıları ve dosyaları ekleyin.</p>
                                </div>

                                <div className="space-y-8 max-w-xl mx-auto">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">İŞ BAŞLIĞI *</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            required
                                            placeholder="Örn: Güvenlik Kamerası Arızası"
                                            className="w-full h-14 px-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">İŞ TİPİ</label>
                                            <select
                                                value={type}
                                                onChange={e => setType(e.target.value)}
                                                className="w-full h-14 px-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-500 transition-all outline-none"
                                            >
                                                <option value="support">Teknik Destek</option>
                                                <option value="camera">Kamera Kurulum</option>
                                                <option value="cabling">Kablolama</option>
                                                <option value="other">Diğer...</option>
                                            </select>
                                        </div>
                                        {type === 'other' && (
                                            <div className="animate-in zoom-in-95 duration-200">
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">ÖZEL TİP</label>
                                                <input
                                                    type="text"
                                                    value={customType}
                                                    onChange={e => setCustomType(e.target.value)}
                                                    className="w-full h-14 px-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-500 transition-all outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">AÇIKLAMA / NOTLAR *</label>
                                        <textarea
                                            rows={3}
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            required
                                            placeholder="İşin kapsamını veya arıza detayını buraya yazın..."
                                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[2rem] text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">KULLANILACAK MALZEMELER</label>
                                        <textarea
                                            rows={2}
                                            value={materials}
                                            onChange={e => setMaterials(e.target.value)}
                                            placeholder="İş için gerekecek (veya kullanılan) malzemeleri buraya yazın..."
                                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[2rem] text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                                        />
                                    </div>

                                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">DOSYA EKLE (MAX 10MB)</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {files.map((file, index) => (
                                                <div key={index} className="relative aspect-square bg-white rounded-2xl border border-slate-200 p-2 flex flex-col items-center justify-center group overflow-hidden shadow-sm">
                                                    <DocumentTextIcon className="h-8 w-8 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                                    <span className="mt-1 text-[8px] font-black text-slate-400 truncate w-full text-center px-1 uppercase">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="absolute top-1 right-1 h-6 w-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <XMarkIcon className="h-4 w-4 stroke-[3px]" />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all group">
                                                <PhotoIcon className="h-8 w-8 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                                <span className="mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Yükle</span>
                                                <input type="file" className="hidden" multiple onChange={handleFileChange} accept="image/*,.pdf" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Planning */}
                        {currentStep === 3 && (
                            <div className="p-8 sm:p-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-10 text-center">
                                    <div className="inline-flex items-center justify-center h-16 w-16 bg-indigo-50 text-indigo-600 rounded-3xl mb-4 border border-indigo-100">
                                        <CalendarIcon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800">Planlama & Atama</h3>
                                    <p className="text-sm font-bold text-slate-400 mt-1">İşin ne zaman ve kim tarafından yapılacağını belirleyerek işlemi tamamlayın.</p>
                                </div>

                                <div className="space-y-8 max-w-xl mx-auto">
                                    <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                                        <div className="grid grid-cols-1 gap-8">
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 text-center">RANDEVU TARİHİ VE SAATİ *</label>
                                                <input
                                                    type="datetime-local"
                                                    value={scheduledAt}
                                                    onChange={e => setScheduledAt(e.target.value)}
                                                    required
                                                    className="w-full h-16 px-6 bg-white border-2 border-slate-100 rounded-3xl text-sm font-black text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-center"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">PERSONEL ATA</label>
                                                    <select
                                                        value={assignedUserId}
                                                        onChange={e => setAssignedUserId(e.target.value)}
                                                        className="w-full h-14 px-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-500 transition-all outline-none"
                                                    >
                                                        <option value="">Sonra Ata</option>
                                                        {staff.map((u: any) => (
                                                            <option key={u.id} value={u.id}>{u.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">SERVİS ÜCRETİ (₺)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={price}
                                                            onChange={e => setPrice(e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full h-14 pl-8 pr-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black text-indigo-600 focus:border-indigo-500 transition-all outline-none"
                                                        />
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100 flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-xl bg-green-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-lg shadow-green-100">
                                            <CheckIcon className="h-5 w-5 stroke-[3px]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-green-700 uppercase tracking-widest mb-1">Kayda Hazır</p>
                                            <p className="text-[11px] font-bold text-green-600 leading-relaxed">Tüm zorunlu alanları doldurdunuz. "Kaydı Tamamla" butonuna basarak iş emrini sisteme işleyebilirsiniz.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="mt-auto p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={currentStep === 1 ? () => router.back() : prevStep}
                                className="flex items-center text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors px-6 py-3 rounded-2xl"
                            >
                                <ChevronLeftIcon className="h-4 w-4 mr-2 stroke-[3px]" />
                                {currentStep === 1 ? 'İptal' : 'Geri Dön'}
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center h-14 px-10 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95"
                                >
                                    Sonraki Adım
                                    <ChevronRightIcon className="h-4 w-4 ml-2 stroke-[3px]" />
                                </button>
                            ) : (
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    variant="orange"
                                    className="h-14 px-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-100 active:scale-95 border-none"
                                >
                                    KAYDI TAMAMLA
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* New Customer Modal */}
            <CustomerFormModal
                isOpen={isCustomerModalOpen}
                customerToEdit={customerToEdit}
                onClose={() => setIsCustomerModalOpen(false)}
                onSuccess={(newCustomer) => {
                    mutate('/customers');
                    if (newCustomer && !customerToEdit) {
                        setCustomerId(newCustomer.id.toString());
                    }
                }}
            />
        </div>
    );
}
