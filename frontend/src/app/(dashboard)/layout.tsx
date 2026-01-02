'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    BriefcaseIcon,
    UsersIcon,
    ArrowLeftOnRectangleIcon,
    Cog6ToothIcon,
    MapPinIcon,
    BellIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/ui/BottomNav';
import useSWR from 'swr';
import axios from '@/lib/axios';

const navigation = [
    { name: 'Ana Sayfa', href: '/dashboard', icon: HomeIcon },
    { name: 'İşler', href: '/jobs', icon: BriefcaseIcon },
    { name: 'Müşteriler', href: '/customers', icon: UsersIcon },
    { name: 'Bildirimler', href: '/notifications', icon: BellIcon, isNotification: true },
    { name: 'Bölge Yönetimi', href: '/regions', icon: MapPinIcon, permission: 'manage_regions' },
    { name: 'Personel Yönetimi', href: '/settings/team', icon: Cog6ToothIcon, permission: 'manage_staff' },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth({ middleware: 'auth' });

    // Fetch unread notification count
    const { data: unreadData } = useSWR(user ? '/notifications/unread-count' : null, (url) => axios.get(url).then(res => res.data), {
        refreshInterval: 30000 // Refresh every 30 seconds
    });
    const unreadCount = unreadData?.count || 0;

    return (
        <div className="min-h-screen modern-gradient">
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-40 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white/90 backdrop-blur-xl pt-5 pb-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                                        <button
                                            type="button"
                                            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <span className="sr-only">Close sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>
                                <div className="flex flex-shrink-0 items-center px-6">
                                    <img
                                        className="h-10 w-auto"
                                        src="/logo.png"
                                        alt="IT Office"
                                    />
                                    <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">IT Office</span>
                                </div>
                                <div className="mt-8 h-0 flex-1 overflow-y-auto px-4">
                                    <nav className="space-y-2">
                                        {navigation.map((item: any) => {
                                            if (item.permission && !user?.permissions?.includes(item.permission) && user?.role !== 'manager') return null;

                                            const isActive = pathname === item.href;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={classNames(
                                                        isActive
                                                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                                                        'group flex items-center px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200'
                                                    )}
                                                >
                                                    <item.icon
                                                        className={classNames(
                                                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500',
                                                            'mr-4 h-6 w-6 flex-shrink-0 transition-colors'
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    <span className="flex-1">{item.name}</span>
                                                    {item.isNotification && unreadCount > 0 && (
                                                        <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                                                            {unreadCount > 9 ? '9+' : unreadCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            )
                                        })}
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                        <div className="w-14 flex-shrink-0" aria-hidden="true"></div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
                <div className="flex flex-col flex-grow glass-effect sidebar-shadow pt-8 pb-4">
                    <div className="flex flex-shrink-0 items-center px-8">
                        <img
                            className="h-12 w-auto"
                            src="/logo.png"
                            alt="IT Office"
                        />
                        <div className="ml-3 flex flex-col">
                            <span className="text-xl font-black tracking-tight text-slate-800">IT OFFICE</span>
                            <span className="text-[10px] font-bold text-orange-600 tracking-[0.2em] uppercase">Saha Destek Takip</span>
                        </div>
                    </div>
                    <div className="mt-12 flex flex-grow flex-col px-4">
                        <nav className="flex-1 space-y-2">
                            {navigation.map((item: any) => {
                                if (item.permission && !user?.permissions?.includes(item.permission) && user?.role !== 'manager') return null;

                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={classNames(
                                            isActive
                                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 scale-[1.02]'
                                                : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm',
                                            'group flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200'
                                        )}
                                    >
                                        <item.icon
                                            className={classNames(
                                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-500',
                                                'mr-3 h-5 w-5 flex-shrink-0 transition-colors'
                                            )}
                                            aria-hidden="true"
                                        />
                                        <span className="flex-1">{item.name}</span>
                                        {item.isNotification && unreadCount > 0 && (
                                            <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white group-hover:ring-orange-50 transition-all">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User profile section */}
                    <div className="flex flex-shrink-0 mt-auto p-4 flex-col gap-2">
                        <div className="group flex w-full items-center p-4 bg-white/50 hover:bg-white rounded-2xl border border-slate-100 transition-all">
                            <Link href="/profile" className="flex items-center flex-1 min-w-0 cursor-pointer">
                                <div className="inline-block h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm ring-2 ring-slate-50">
                                    {user?.name?.[0].toUpperCase()}
                                </div>
                                <div className="ml-3 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 truncate group-hover:text-orange-600 transition-colors">{user?.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user?.role === 'manager' ? 'Yönetici' : 'Saha Personeli'}</p>
                                </div>
                            </Link>
                            <button
                                onClick={logout}
                                className="ml-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Çıkış Yap"
                            >
                                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col lg:pl-72">
                <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 glass-effect lg:hidden">
                    <button
                        type="button"
                        className="px-4 text-slate-500 focus:outline-none lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex flex-1 items-center px-4 justify-between">
                        <div className="flex items-center">
                            <img
                                className="h-8 w-auto mr-3"
                                src="/logo.png"
                                alt="IT Office"
                            />
                            <span className="text-lg font-black text-slate-800">IT OFFICE</span>
                        </div>
                    </div>
                </div>

                <main className="flex-1 pb-20 lg:pb-0">
                    <div className="py-8 px-4 sm:px-6 lg:px-12">
                        <div className="mx-auto max-w-7xl">
                            {children}
                        </div>
                    </div>
                </main>
                <BottomNav />
            </div>
        </div>
    );
}
