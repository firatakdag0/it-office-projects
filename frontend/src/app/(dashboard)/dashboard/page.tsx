'use client';

import { useAuth } from '@/hooks/useAuth';
import useSWR from 'swr';
import axios from '@/lib/axios';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import {
    UsersIcon,
    BriefcaseIcon,
    MapPinIcon,
    UserGroupIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowRightIcon,
    PlusIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
    const { user } = useAuth({ middleware: 'auth' });
    const { data: stats } = useSWR('/dashboard/stats', () =>
        axios.get('/dashboard/stats').then(res => res.data)
    );

    if (!user || !stats) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Tekrar Hoş Geldin, <span className="text-orange-600">{user.name.split(' ')[0]}</span>!
                    </h1>
                    <p className="mt-1 text-slate-500 font-bold uppercase tracking-widest text-[9px]">İşlem Özeti ve Günlük Rapor</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/jobs/create">
                        <Button
                            variant="orange"
                            className="h-11 px-6 rounded-xl font-black text-xs scale-100 hover:scale-105 active:scale-95 transition-all w-fit shadow-lg shadow-orange-100"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            YENİ İŞ KAYDI
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard
                    title="Toplam Müşteri"
                    value={stats.total_customers}
                    icon={UsersIcon}
                    color="blue"
                    link="/customers"
                />
                <StatCard
                    title="Bekleyen İşler"
                    value={stats.pending_jobs}
                    icon={ClockIcon}
                    color="amber"
                    link="/jobs?status=pending"
                />
                <StatCard
                    title="Devam Edenler"
                    value={stats.working_jobs}
                    icon={BriefcaseIcon}
                    color="indigo"
                    link="/jobs?status=working"
                />
                <StatCard
                    title="Bugün Tamamlanan"
                    value={stats.completed_today}
                    icon={CheckCircleIcon}
                    color="green"
                    link="/jobs?status=completed"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Jobs Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Son İş Kayıtları</h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">SİSTEME DÜŞEN SON TALEPLER</p>
                            </div>
                            <Link href="/jobs" className="flex items-center text-[10px] font-black text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-lg">
                                TÜMÜNÜ GÖR
                                <ChevronRightIcon className="h-3.5 w-3.5 ml-1.5" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-slate-50">
                                    <tr>
                                        <th className="px-6 py-4">Müşteri</th>
                                        <th className="px-6 py-4">İş/Arıza Detayı</th>
                                        <th className="px-6 py-4">Durum</th>
                                        <th className="px-6 py-4 text-right">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.recent_jobs?.map((job: any) => (
                                        <tr key={job.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">
                                                    {job.customer?.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[11px] font-bold text-slate-500 max-w-[200px] truncate leading-none">
                                                    {job.title || job.description}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={job.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                    {new Date(job.created_at).toLocaleDateString('tr-TR')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!stats.recent_jobs || stats.recent_jobs.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic font-bold text-sm">
                                                Henüz bir iş kaydı bulunmuyor.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Secondary Info / Quick Actions */}
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-100 flex flex-col justify-between relative overflow-hidden h-[240px]">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-1">Saha Operasyonu</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">EKİP DURUMU</p>
                            <p className="text-slate-300 text-sm font-bold leading-relaxed max-w-[200px]">
                                Şu an sahada <span className="text-white bg-orange-600 px-1.5 py-0.5 rounded ml-0.5">{stats.staff_count}</span> personeliniz aktif görev alıyor.
                            </p>
                        </div>
                        <div className="relative z-10 mt-auto">
                            <Link href="/settings/team">
                                <button className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                                    EKİBİ YÖNET
                                </button>
                            </Link>
                        </div>
                        <UserGroupIcon className="absolute -bottom-8 -right-8 h-40 w-40 text-white/5 rotate-12" />
                    </div>

                    {/* Regional Info */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white flex flex-col h-[200px]">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Bölgeler</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">HİZMET ALANLARI</p>
                            </div>
                            <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-lg font-black">{stats.total_regions} AKTİF</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 mb-6 leading-relaxed">Hizmet verdiğiniz bölgeleri optimize ederek saha verimliliğini artırın.</p>
                        <div className="mt-auto">
                            <Link href="/regions" className="flex items-center justify-center w-full bg-slate-50 hover:bg-orange-50 text-slate-500 hover:text-orange-600 border border-slate-100 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                BÖLGELERİ DÜZENLE
                                <ArrowRightIcon className="h-3.5 w-3.5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, link }: any) {
    const config: any = {
        blue: { bg: 'bg-blue-50/50', icon: 'bg-blue-50 text-blue-500 border-blue-100', dot: 'bg-blue-500' },
        amber: { bg: 'bg-amber-50/50', icon: 'bg-amber-50 text-amber-500 border-amber-100', dot: 'bg-amber-500' },
        indigo: { bg: 'bg-indigo-50/50', icon: 'bg-indigo-50 text-indigo-500 border-indigo-100', dot: 'bg-indigo-500' },
        green: { bg: 'bg-green-50/50', icon: 'bg-green-50 text-green-500 border-green-100', dot: 'bg-green-500' },
    };

    const c = config[color];

    return (
        <Link href={link}>
            <div className={`p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} opacity-50`}></span>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">
                                {title}
                            </p>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                            {value}
                        </p>
                    </div>
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-6 ${c.icon}`}>
                        <Icon className="h-7 w-7" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: any = {
        pending: { label: 'BEKLEMEDE', class: 'bg-yellow-50 text-yellow-600 border-yellow-100', dot: 'bg-yellow-500' },
        traveling: { label: 'YOLDA', class: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-500' },
        working: { label: 'İŞLEMDE', class: 'bg-indigo-50 text-indigo-600 border-indigo-100', dot: 'bg-indigo-500' },
        completed: { label: 'TAMAMLANDI', class: 'bg-green-50 text-green-600 border-green-100', dot: 'bg-green-500' },
        canceled: { label: 'İPTAL', class: 'bg-slate-50 text-slate-500 border-slate-100', dot: 'bg-slate-400' },
    };

    const s = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black border transition-colors ${s.class}`}>
            <span className={`w-1 h-1 rounded-full mr-1.5 animate-pulse ${s.dot}`}></span>
            {s.label}
        </span>
    );
}
