'use client';

import { useState, Fragment, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import axios from '@/lib/axios';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const [notifsRes, countRes] = await Promise.all([
                axios.get('/notifications'),
                axios.get('/notifications/unread-count')
            ]);
            setNotifications(notifsRes.data.data);
            setUnreadCount(countRes.data.count);
        } catch (error) {
            console.error('Bildirimler alınamadı', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling for new notifications every 1 minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Okundu işaretlenemedi', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error('Tümü okundu işaretlenemedi', error);
        }
    };

    return (
        <Menu as="div" className="relative ml-3">
            <div>
                <Menu.Button className="relative flex rounded-full bg-white p-2 text-slate-400 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all">
                    <span className="sr-only">Bildirimleri aç</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-2xl bg-white py-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-100 overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Bildirimler</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-bold text-orange-600 hover:text-orange-700"
                            >
                                Tümünü Okundu Say
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <Menu.Item key={notif.id}>
                                    {({ active }) => (
                                        <div
                                            className={`
                                                px-4 py-3 border-b border-slate-50 last:border-0 transition-colors
                                                ${notif.read_at ? 'bg-white' : 'bg-orange-50/30'}
                                                ${active ? 'bg-slate-50' : ''}
                                            `}
                                        >
                                            <Link href={notif.link || '#'} onClick={() => markAsRead(notif.id)}>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold leading-tight ${notif.read_at ? 'text-slate-800' : 'text-slate-900'}`}>
                                                        {notif.title}
                                                    </span>
                                                    <p className="mt-1 text-[11px] text-slate-500 leading-normal">
                                                        {notif.message}
                                                    </p>
                                                    <span className="mt-1.5 text-[9px] font-medium text-slate-400 capitalize">
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: tr })}
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </Menu.Item>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <BellIcon className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-xs text-slate-400 font-medium italic">Henüz bildirim yok.</p>
                            </div>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 bg-slate-50 text-center border-t border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Son 15 bildirim gösteriliyor</span>
                        </div>
                    )}
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
