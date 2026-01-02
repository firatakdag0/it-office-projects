'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BellIcon, CheckIcon, TrashIcon, InboxIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data.data);
        } catch (error) {
            console.error('Bildirimler alınamadı', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (error) {
            console.error('Okundu işaretlenemedi', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (error) {
            console.error('Tümü okundu işaretlenemedi', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Bildirimler</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">İşlerinizle ilgili en son güncellemeler.</p>
                </div>
                {notifications.some(n => !n.read_at) && (
                    <Button variant="secondary" onClick={markAllAsRead} className="text-xs">
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Tümünü Okundu Say
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`
                                    p-4 sm:p-6 transition-all hover:bg-slate-50/50 relative group
                                    ${notif.read_at ? 'bg-white' : 'bg-orange-50/30'}
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-xl flex-shrink-0 ${notif.read_at ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600'}`}>
                                        <BellIcon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`text-sm font-bold truncate ${notif.read_at ? 'text-slate-600' : 'text-slate-900'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: tr })}
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-relaxed mb-3 ${notif.read_at ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            {notif.link && (
                                                <Link
                                                    href={notif.link}
                                                    onClick={() => !notif.read_at && markAsRead(notif.id)}
                                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                                                >
                                                    Detayları Gör →
                                                </Link>
                                            )}
                                            {!notif.read_at && (
                                                <button
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    Okundu İşaretle
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {!notif.read_at && (
                                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-orange-500 shadow-sm animate-pulse lg:hidden"></div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <InboxIcon className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Hiç bildirim yok</h3>
                        <p className="text-sm text-slate-500 mt-1">Her şey güncel görünüyor.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
