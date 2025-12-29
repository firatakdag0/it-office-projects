'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
    const { login } = useAuth({ middleware: 'guest', redirectIfAuthenticated: '/' });
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login({ login: loginIdentifier, password, setErrors });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <img
                    className="mx-auto h-12 w-auto"
                    src="/icons/icon-192x192.png"
                    alt="Saha Destek"
                />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Hesabınıza giriş yapın
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            id="login"
                            type="text"
                            label="Kullanıcı Adı veya E-posta"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            required
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {errors.length > 0 && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Giriş yapılamadı
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <ul className="list-disc pl-5 space-y-1">
                                                {errors.map((error, idx) => (
                                                    <li key={idx}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Giriş Yap
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
