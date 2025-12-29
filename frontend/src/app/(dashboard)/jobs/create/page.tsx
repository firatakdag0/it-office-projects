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
    XMarkIcon
} from '@heroicons/react/24/outline';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function CreateJobPage() {
    const router = useRouter();
    const { data: customers } = useSWR('/customers', fetcher);
    const { data: staff } = useSWR('/users', fetcher);

    const [isLoading, setIsLoading] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [type, setType] = useState('support');
    const [customType, setCustomType] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [assignedUserId, setAssignedUserId] = useState('');
    const [price, setPrice] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    // Pre-fill location from customer if selected
    useEffect(() => {
        if (customerId && customers) {
            const customer = customers.find((c: any) => c.id === parseInt(customerId));
            // Future: If we implement map selection, we can pre-fill coordinates here
            // setLatitude(customer.latitude);
            // setLongitude(customer.longitude);
        }
    }, [customerId, customers]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('customer_id', customerId);
        formData.append('type', type === 'other' ? customType : type);
        formData.append('description', description);
        if (scheduledAt) formData.append('scheduled_at', scheduledAt);
        if (assignedUserId) formData.append('assigned_user_id', assignedUserId);
        if (price) formData.append('price', price);

        files.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        try {
            await axios.post('/jobs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Refresh cache and redirect
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

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Yeni İş Oluştur
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Müşteri için yeni bir servis veya montaj talebi oluşturun.
                        </p>
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
                    <div className="p-6 sm:p-8 space-y-8">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-8 divide-y divide-gray-200">

                                {/* 1. Basic Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                                            <BriefcaseIcon className="h-5 w-5 mr-2 text-orange-500" />
                                            İş Detayları
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Müşteri ve yapılacak işin türünü seçin.
                                        </p>
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
                                                    onChange={e => setCustomerId(e.target.value)}
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
                                            <label className="block text-sm font-medium text-gray-700">
                                                Ekran Görüntüsü / Dosya Ekle
                                            </label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors cursor-pointer relative">
                                                <div className="space-y-1 text-center">
                                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600">
                                                        <label
                                                            htmlFor="file-upload"
                                                            className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                                                        >
                                                            <span>Dosya Yükle</span>
                                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*,.pdf" />
                                                        </label>
                                                        <p className="pl-1">veya sürükleyip bırakın</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, PDF (max 10MB)
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    accept="image/*,.pdf"
                                                />
                                            </div>

                                            {/* Preview List */}
                                            {files.length > 0 && (
                                                <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                                    {files.map((file, index) => (
                                                        <li key={index} className="relative group rounded-lg border border-gray-200 bg-white p-2 flex items-center shadow-sm">
                                                            <div className="flex-1 truncate text-xs text-gray-600">
                                                                {file.name}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                className="ml-2 text-gray-400 hover:text-red-500"
                                                            >
                                                                <XMarkIcon className="h-4 w-4" />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Schedule & Assignment */}
                                <div className="pt-8 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                                            <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                            Planlama & Atama
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            İşin ne zaman ve kim tarafından yapılacağını belirleyin.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        <div className="sm:col-span-3">
                                            <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700">
                                                Planlanan Tarih & Saat
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="datetime-local"
                                                    id="scheduled_at"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                                                    value={scheduledAt}
                                                    onChange={e => setScheduledAt(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
                                                Personel Ata (Opsiyonel)
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

                                <div className="pt-8 mt-4 flex justify-end space-x-3">
                                    <Button type="button" variant="secondary" onClick={() => router.back()}>
                                        İptal
                                    </Button>
                                    <Button type="submit" isLoading={isLoading} variant="orange" className="px-8">
                                        İşi Oluştur
                                    </Button>
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
                    // Optionally set as selected customer
                }}
            />
        </div>
    );
}
