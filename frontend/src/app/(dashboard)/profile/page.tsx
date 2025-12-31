'use client';

import { useAuth } from '@/hooks/useAuth';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    IdentificationIcon,
    ShieldCheckIcon,
    MapPinIcon,
    HeartIcon
} from '@heroicons/react/24/outline';

function DetailRow({ icon: Icon, label, value, color = 'slate' }: any) {
    const colorClasses = {
        slate: 'bg-slate-50 text-slate-500',
        orange: 'bg-orange-50 text-orange-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} mr-4`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">{label}</p>
                <p className="font-bold text-slate-700">{value || '-'}</p>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { user } = useAuth({ middleware: 'auth' });

    if (!user) {
        return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Profil yükleniyor...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-black text-slate-800">Profilim</h1>
                <p className="text-slate-500 mt-2 font-medium">Kişisel bilgilerinizi ve hesap detaylarınızı buradan görüntüleyebilirsiniz.</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative">
                    <div className="absolute -bottom-16 left-8 p-1 bg-white rounded-full">
                        <div className="h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center text-4xl font-black text-slate-300 border-4 border-slate-50 shadow-inner">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                    </div>
                </div>
                <div className="pt-20 pb-8 px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">{user.name}</h2>
                            <div className="flex items-center mt-2 space-x-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-700">
                                    {user.role === 'manager' ? 'Yönetici' : 'Saha Personeli'}
                                </span>
                                {user.username && (
                                    <span className="flex items-center text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                                        <span className="text-slate-400 mr-1">@</span>{user.username}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account & Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">İletişim Bilgileri</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <DetailRow
                            icon={EnvelopeIcon}
                            label="E-Posta Adresi"
                            value={user.email}
                            color="blue"
                        />
                        <DetailRow
                            icon={PhoneIcon}
                            label="Telefon Numarası"
                            value={user.phone}
                            color="green"
                        />
                        <DetailRow
                            icon={MapPinIcon}
                            label="Adres"
                            value={user.address}
                            color="slate"
                        />
                    </div>
                </div>

                {/* Personal & Corporate Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Kurumsal & Kişisel</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <DetailRow
                            icon={BuildingOfficeIcon}
                            label="Departman"
                            value={user.department}
                            color="orange"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow
                                icon={HeartIcon}
                                label="Kan Grubu"
                                value={user.blood_group}
                                color="red"
                            />
                            <DetailRow
                                icon={IdentificationIcon}
                                label="Ehliyet"
                                value={user.driver_license}
                                color="slate"
                            />
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    {user.emergency_contact_name && (
                        <div className="mt-6 pt-6 border-t border-slate-200/60">
                            <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4 ml-1">Acil Durum İletişim</h3>
                            <DetailRow
                                icon={PhoneIcon}
                                label={user.emergency_contact_name}
                                value={user.emergency_contact_phone}
                                color="red"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Permissions */}
            {user.permissions && user.permissions.length > 0 && (
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <ShieldCheckIcon className="h-6 w-6 text-orange-500" />
                        <h3 className="text-lg font-black text-slate-800">Sistem Yetkileri</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {user.permissions.map((perm: string) => (
                            <span
                                key={perm}
                                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 shadow-sm"
                            >
                                {perm.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
