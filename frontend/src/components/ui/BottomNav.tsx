'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import useSWR from 'swr';
import axios from '@/lib/axios';
import {
    HomeIcon,
    BriefcaseIcon,
    UsersIcon,
    UserCircleIcon,
    BellIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolidIcon,
    BriefcaseIcon as BriefcaseSolidIcon,
    UsersIcon as UsersSolidIcon,
    UserCircleIcon as UserCircleSolidIcon,
    BellIcon as BellSolidIcon
} from '@heroicons/react/24/solid';

const navigation = [
    { name: 'Giriş', href: '/dashboard', icon: HomeIcon, activeIcon: HomeSolidIcon },
    { name: 'İşlerim', href: '/jobs', icon: BriefcaseIcon, activeIcon: BriefcaseSolidIcon },
    { name: 'Bildirimler', href: '/notifications', icon: BellIcon, activeIcon: BellSolidIcon, isNotification: true },
    { name: 'Müşteriler', href: '/customers', icon: UsersIcon, activeIcon: UsersSolidIcon },
    { name: 'Profil', href: '/profile', icon: UserCircleIcon, activeIcon: UserCircleSolidIcon },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth({ middleware: 'auth' });

    // Fetch unread notification count
    const { data: unreadData } = useSWR(user ? '/notifications/unread-count' : null, (url) => axios.get(url).then(res => res.data), {
        refreshInterval: 30000
    });
    const unreadCount = unreadData?.count || 0;

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center z-50 h-16 pb-safe">
            {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = isActive ? item.activeIcon : item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center transition-all duration-200 relative w-full h-full ${isActive ? 'text-orange-600 scale-110' : 'text-slate-400'
                            }`}
                    >
                        <div className={`p-2 rounded-2xl ${isActive ? 'bg-orange-50' : ''}`}>
                            <Icon className="h-7 w-7" />
                        </div>
                        {item.isNotification && unreadCount > 0 && (
                            <span className="absolute top-3 right-1/2 translate-x-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm ring-1 ring-red-100">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
