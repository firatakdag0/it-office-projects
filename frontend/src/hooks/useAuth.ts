import useSWR from 'swr';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseAuthProps {
    middleware?: 'guest' | 'auth';
    redirectIfAuthenticated?: string;
}

interface LoginProps {
    setErrors: (errors: string[]) => void;
    [key: string]: any;
}

export const useAuth = ({ middleware, redirectIfAuthenticated }: UseAuthProps = {}) => {
    const router = useRouter();

    const { data: user, error, mutate } = useSWR('/user', () =>
        axios
            .get('/user')
            .then(res => res.data)
            .catch(error => {
                if (error.response?.status !== 409) throw error;
            })
    );

    const login = async ({ setErrors, ...props }: LoginProps) => {
        setErrors([]);

        axios
            .post('/auth/login', props)
            .then((res) => {
                localStorage.setItem('token', res.data.access_token);
                mutate();
            })
            .catch(error => {
                if (error.response?.status !== 422) throw error;
                setErrors(Object.values(error.response?.data?.errors || {}).flat() as string[]);
            });
    };

    const logout = async () => {
        if (!error) {
            await axios.post('/auth/logout').catch(() => { });
            mutate(null);
        }
        localStorage.removeItem('token');
        window.location.pathname = '/login';
    };

    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user) router.push(redirectIfAuthenticated);
        if (middleware === 'auth' && error) logout();
    }, [user, error, middleware, redirectIfAuthenticated, router]);

    return {
        user,
        login,
        logout,
        isLoading: !user && !error,
    };
};
