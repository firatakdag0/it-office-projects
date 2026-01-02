'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    PlusIcon,
    PhotoIcon,
    XMarkIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const { data: job, error: jobError } = useSWR(id ? `/jobs/${id}` : null, fetcher);
    const { data: customers } = useSWR('/customers', fetcher);
    const { data: regions } = useSWR('/regions', fetcher);
    const { data: staff } = useSWR('/users', fetcher);

    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

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

    // Populate form when job data is loaded
    useEffect(() => {
        if (job) {
            setCustomerId(job.customer_id?.toString() || '');
            setRegionId(job.region_id?.toString() || '');
            setTitle(job.title || '');

            const jobTypes = ['support', 'camera', 'cabling'];
            if (jobTypes.includes(job.type)) {
                setType(job.type);
            } else {
                setType('other');
                setCustomType(job.type);
            }

            setDescription(job.description || '');
            setMaterials(job.materials || '');

            // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
            if (job.start_date) {
                const date = new Date(job.start_date);
                const formattedDate = date.toISOString().slice(0, 16);
                setScheduledAt(formattedDate);
            }

            setAssignedUserId(job.assigned_user_id?.toString() || '');
            setPrice(job.price?.toString() || '');

            setContactId(job.authorized_person_id?.toString() || '');
            setContactName(job.contact_name || '');
            setContactPhone(job.contact_phone || '');

            if (job.location_address || job.maps_url) {
                setLocationType('custom');
                setLocationAddress(job.location_address || '');
                setMapsUrl(job.maps_url || '');
            } else {
                setLocationType('customer');
            }
        }
    }, [job]);

    // Filtered contacts based on selected customer
    const activeCustomer = customers?.find((c: any) => c.id === parseInt(customerId));
    const customerContacts = activeCustomer?.contacts || [];

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('_method', 'PUT'); // For Laravel to handle PUT with FormData
        formData.append('customer_id', customerId);
        if (regionId) formData.append('region_id', regionId);
        formData.append('title', title);
        formData.append('type', type === 'other' ? customType : type);
        formData.append('description', description);
        if (materials) formData.append('materials', materials);
        if (scheduledAt) formData.append('start_date', scheduledAt);

        if (assignedUserId) formData.append('assigned_user_id', assignedUserId);
        if (price) formData.append('price', price);

        if (contactId) formData.append('authorized_person_id', contactId);
        if (contactName) formData.append('contact_name', contactName);
        if (contactPhone) formData.append('contact_phone', contactPhone);

        if (locationType === 'custom') {
            formData.append('location_address', locationAddress);
            formData.append('maps_url', mapsUrl);
        } else {
            formData.append('location_address', '');
            formData.append('maps_url', '');
        }

        files.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        try {
            await axios.post(`/jobs/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            mutate(`/jobs/${id}`);
            mutate('/jobs');
            router.push(`/jobs/${id}`);
        } catch (error: any) {
            alert('İş güncellenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bu işi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        setIsDeleting(true);
        try {
            await axios.delete(`/jobs/${id}`);
            mutate('/jobs');
            router.push('/jobs');
        } catch (error: any) {
            alert('İş silinirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsDeleting(false);
        }
    };

    if (jobError) return <div className="p-8 text-center text-red-500 font-bold">İş yüklenirken hata oluştu.</div>;
    if (!job || !customers || !staff) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            İşi Düzenle
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            #{id} numaralı iş talebinin bilgilerini güncelleyin.
                        </p>
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
                    <div className="p-6 sm:p-8 space-y-8">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-8 divide-y divide-gray-200">

                                {/* 1. Basic Info */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                                            <BriefcaseIcon className="h-5 w-5 mr-2 text-orange-500" />
                                            İş Detayları
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        <div className="sm:col-span-3">
                                            <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                                                Müşteri
                                            </label>
                                            <div className="mt-1 flex gap-2">
                                                <select
                                                    id="customer"
                                                    required
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 border bg-white"
                                                    value={customerId}
                                                    onChange={handleCustomerChange}
                                                >
                                                    <option value="">Seçiniz...</option>
                                                    {customers.map((c: any) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name} ({c.type === 'corporate' ? 'Kurumsal' : 'Bireysel'})
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCustomerModalOpen(true)}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                                >
                                                    <PlusIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                                                Bölge
                                            </label>
                                            <div className="mt-1">
                                                <select
                                                    id="region"
                                                    required
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 border bg-white"
                                                    value={regionId}
                                                    onChange={(e) => setRegionId(e.target.value)}
                                                >
                                                    <option value="">Seçiniz...</option>
                                                    {regions?.map((r: any) => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Konum Bilgisi</label>
                                            <div className="flex gap-4 mb-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="locationType"
                                                        value="customer"
                                                        checked={locationType === 'customer'}
                                                        onChange={() => setLocationType('customer')}
                                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Müşteri Konumu (Varsayılan)</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="locationType"
                                                        value="custom"
                                                        checked={locationType === 'custom'}
                                                        onChange={() => setLocationType('custom')}
                                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Farklı Konum / Şantiye</span>
                                                </label>
                                            </div>

                                            {locationType === 'custom' && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label htmlFor="location_address" className="block text-xs font-bold text-slate-700 mb-1">
                                                            Konum / Adres Tarifi
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="location_address"
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                                                            placeholder="Örn: Gebze Şantiyesi, Kat 3..."
                                                            value={locationAddress}
                                                            onChange={e => setLocationAddress(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="maps_url" className="block text-xs font-bold text-slate-700 mb-1">
                                                            Google Maps Linki
                                                        </label>
                                                        <input
                                                            type="url"
                                                            id="maps_url"
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                                                            placeholder="https://maps.google.com/..."
                                                            value={mapsUrl}
                                                            onChange={e => setMapsUrl(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {customerId && (
                                            <div className="sm:col-span-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                <label className="block text-xs font-bold text-indigo-600 mb-4 uppercase tracking-wide">Yetkili / Muhatap Bilgisi</label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {customerContacts.length > 0 && (
                                                        <div className="md:col-span-3 mb-2">
                                                            <label className="block text-xs font-bold text-slate-700 mb-2">Kayıtlı Yetkiliden Seç</label>
                                                            <select
                                                                className="w-full h-11 px-4 bg-white border border-indigo-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-indigo-900"
                                                                value={contactId}
                                                                onChange={handleContactChange}
                                                            >
                                                                <option value="">-- Listeden Seçiniz --</option>
                                                                {customerContacts.map((contact: any) => (
                                                                    <option key={contact.id} value={contact.id}>
                                                                        {contact.name} ({contact.department || 'Bölüm Yok'}) - {contact.phone || '-'}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    <div className="md:col-span-1">
                                                        <label className="block text-xs font-bold text-slate-700 mb-2">Ad Soyad</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Manuel giriş..."
                                                            className="w-full h-11 px-4 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                                                            value={contactName}
                                                            onChange={(e) => setContactName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-700 mb-2">İletişim Telefonu</label>
                                                        <input
                                                            type="text"
                                                            placeholder="05..."
                                                            className="w-full h-11 px-4 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                                                            value={contactPhone}
                                                            onChange={(e) => setContactPhone(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="sm:col-span-6">
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                İş Başlığı / Konu
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    id="title"
                                                    required
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 border"
                                                    placeholder="Örn: Yazıcı Arızası, Kamera Montajı..."
                                                    value={title}
                                                    onChange={e => setTitle(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                                İş Tipi
                                            </label>
                                            <div className="mt-1 space-y-2">
                                                <select
                                                    id="type"
                                                    required
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2.5 px-3 border bg-white"
                                                    value={type}
                                                    onChange={e => setType(e.target.value)}
                                                >
                                                    <option value="support">Teknik Destek</option>
                                                    <option value="camera">Kamera Montaj/Bakım</option>
                                                    <option value="cabling">Kablolama / Altyapı</option>
                                                    <option value="other">Diğer / Özel...</option>
                                                </select>
                                                {type === 'other' && (
                                                    <Input
                                                        placeholder="Yapılacak işi yazınız..."
                                                        value={customType}
                                                        onChange={e => setCustomType(e.target.value)}
                                                        required
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                Açıklama / Notlar
                                            </label>
                                            <div className="mt-1">
                                                <textarea
                                                    id="description"
                                                    rows={3}
                                                    required
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border"
                                                    placeholder="Arıza detayı veya yapılacak işlem..."
                                                    value={description}
                                                    onChange={e => setDescription(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label htmlFor="materials" className="block text-sm font-medium text-gray-700">
                                                Gerekli Malzemeler
                                            </label>
                                            <div className="mt-1">
                                                <textarea
                                                    id="materials"
                                                    rows={2}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border"
                                                    placeholder="Gerekli malzemeleri giriniz..."
                                                    value={materials}
                                                    onChange={e => setMaterials(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Schedule & Assignment */}
                                <div className="pt-8 space-y-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                                        <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                        Planlama & Atama
                                    </h3>

                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        <div className="sm:col-span-3">
                                            <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700">
                                                Planlanan Tarih & Saat
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="datetime-local"
                                                    id="scheduled_at"
                                                    required
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                                                    value={scheduledAt}
                                                    onChange={e => setScheduledAt(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
                                                Personel Ata
                                            </label>
                                            <div className="mt-1">
                                                <select
                                                    id="assignee"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border bg-white"
                                                    value={assignedUserId}
                                                    onChange={e => setAssignedUserId(e.target.value)}
                                                >
                                                    <option value="">Atama Yapma</option>
                                                    {staff.map((u: any) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.name} {u.role === 'manager' ? '(Yönetici)' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                                Tahmini Ücret (TL)
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-gray-500 sm:text-sm">₺</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    id="price"
                                                    className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 border"
                                                    placeholder="0.00"
                                                    value={price}
                                                    onChange={e => setPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 mt-4 flex justify-between items-center">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleDelete}
                                        isLoading={isDeleting}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-2" />
                                        İşi Sil
                                    </Button>

                                    <div className="flex space-x-3">
                                        <Button type="button" variant="secondary" onClick={() => router.back()}>
                                            İptal
                                        </Button>
                                        <Button type="submit" isLoading={isLoading} variant="orange" className="px-8">
                                            İşi Güncelle
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* New Customer Modal */}
            <CustomerFormModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                onSuccess={(newCustomer) => {
                    mutate('/customers');
                    if (newCustomer) {
                        setCustomerId(newCustomer.id);
                    }
                }}
            />
        </div>
    );
}
