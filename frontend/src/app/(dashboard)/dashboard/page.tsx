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

    const isManager = user?.role === 'manager';

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
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                        {isManager ? 'Tekrar Hoş Geldin,' : 'İyi Çalışmalar,'} <span className="text-orange-600 font-extrabold">{user.name.split(' ')[0]}</span>!
                    </h1>
                    <p className="mt-1 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        {isManager ? 'SİSTEM VE OPERASYON ÖZETİ' : 'BUGÜNKÜ İŞLERİN VE PERFORMANS ÖZETİN'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isManager && (
                        <Link href="/jobs/create">
                            <Button
                                variant="orange"
                                className="h-12 px-8 rounded-2xl font-black text-[11px] tracking-widest shadow-xl shadow-orange-100/50 hover:shadow-orange-200/50 transition-all border-none"
                            >
                                <PlusIcon className="h-4 w-4 mr-2 stroke-[3px]" />
                                YENİ İŞ KAYDI
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {isManager ? (
                    <>
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
                            title="Saha İşlemde"
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
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Atanan Toplam İş"
                            value={stats.total_assigned}
                            icon={BriefcaseIcon}
                            color="blue"
                            link="/jobs"
                        />
                        <StatCard
                            title="Bekleyen Görevlerim"
                            value={stats.pending_jobs}
                            icon={ClockIcon}
                            color="amber"
                            link="/jobs?status=pending"
                        />
                        <StatCard
                            title="Devam Eden İşim"
                            value={stats.working_jobs}
                            icon={BriefcaseIcon}
                            color="indigo"
                            link="/jobs?status=working"
                        />
                        <StatCard
                            title="Bugün Bitirdiğim"
                            value={stats.completed_today}
                            icon={CheckCircleIcon}
                            color="green"
                            link="/jobs?status=completed"
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Jobs Table */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">
                                    {isManager ? 'Son İş Kayıtları' : 'Size Atanan Son İşler'}
                                </h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    {isManager ? 'SİSTEME DÜŞEN GÜNCEL TALEPLER' : 'TAKİBİNİZDE OLAN GÜNCEL GÖREVLER'}
                                </p>
                            </div>
                            <Link href="/jobs" className="flex items-center text-[10px] font-black text-slate-500 hover:text-orange-600 transition-colors uppercase tracking-widest bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                                TÜMÜNÜ GÖR
                                <ChevronRightIcon className="h-3.5 w-3.5 ml-2" />
                            </Link>
                        </div>
                        {/* Recent Jobs Content */}
                        <div className="lg:hidden">
                            <div className="divide-y divide-slate-50">
                                {stats.recent_jobs?.map((job: any) => (
                                    <Link
                                        key={job.id}
                                        href={`/jobs/${job.id}`}
                                        className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-all"
                                    >
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center mb-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mr-2 uppercase tracking-tighter">#{job.id}</span>
                                                <h4 className="text-sm font-black text-slate-800 truncate">{job.customer?.name}</h4>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-500 truncate tracking-tight">
                                                {job.title || job.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2.5">
                                            <StatusBadge status={job.status} />
                                            <span className="text-[10px] font-black text-slate-400 tabular-nums">
                                                {new Date(job.created_at).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="max-lg:hidden overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-50">
                                    <tr>
                                        <th className="px-8 py-5">Müşteri</th>
                                        <th className="px-8 py-5">İş / Arıza Detayı</th>
                                        <th className="px-8 py-5">Durum</th>
                                        <th className="px-8 py-5 text-right">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.recent_jobs?.map((job: any) => (
                                        <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/jobs/${job.id}`}>
                                            <td className="px-8 py-5">
                                                <div className="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">
                                                    {job.customer?.name}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[12px] font-bold text-slate-500 max-w-[250px] truncate leading-none">
                                                    {job.title || job.description}
                                                </p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <StatusBadge status={job.status} />
                                            </td>
                                            <td className="px-8 py-5 text-right font-black">
                                                <span className="text-[11px] text-slate-400 tabular-nums uppercase">
                                                    {new Date(job.created_at).toLocaleDateString('tr-TR')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {(!stats.recent_jobs || stats.recent_jobs.length === 0) && (
                            <div className="px-8 py-16 text-center text-slate-400 italic font-bold text-sm">
                                Henüz bir iş kaydı bulunmuyor.
                            </div>
                        )}
                    </div>
                </div>

                {/* Secondary Info / Quick Actions */}
                <div className="space-y-6">
                    <div className="space-y-6 flex flex-col items-stretch">
                        {/* Performance Summary / Regional Info */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">Servis Bölgeleri</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">AKTİF HİZMET ALANLARI</p>
                                </div>
                                <div className="h-10 w-10 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100/50">
                                    <span className="text-sm font-black text-orange-600">{stats.total_regions}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                                    "Saha operasyonlarınızı optimize etmek için bölgelerinizi güncel tutun."
                                </p>
                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-600 w-3/4 rounded-full"></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Verimlilik</span>
                                    <span>%75</span>
                                </div>
                            </div>

                            <Link href="/regions" className="mt-auto">
                                <button className="flex items-center justify-center w-full bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-100 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    BÖLGELERİ DÜZENLE
                                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                                </button>
                            </Link>
                        </div>

                        {/* Quick Support Account Card */}
                        <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100">
                            <h3 className="text-sm font-black text-slate-800 mb-2">Destek İhtiyacı</h3>
                            <p className="text-[11px] font-bold text-slate-500 mb-6 leading-relaxed">Operasyonel bir aksaklık durumunda teknik destekle iletişime geçin.</p>
                            <Link href="tel:05000000000" className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors shadow-sm group">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 bg-orange-600 rounded-xl flex items-center justify-center mr-3 text-white">
                                        <ClockIcon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Merkez Destek</span>
                                </div>
                                <ChevronRightIcon className="h-4 w-4 text-slate-300 group-hover:text-orange-600 transition-all group-hover:translate-x-1" />
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
            <div className={`p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 h-32 w-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-orange-50 transition-colors duration-500"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                                {title}
                            </p>
                        </div>
                        <p className="text-4xl font-black text-slate-800 tracking-tight tabular-nums">
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
        cancelled: { label: 'İPTAL EDİLDİ', class: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500' },
    };

    const s = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black border transition-colors ${s.class}`}>
            <span className={`w-1 h-1 rounded-full mr-1.5 animate-pulse ${s.dot}`}></span>
            {s.label}
        </span>
    );
}
