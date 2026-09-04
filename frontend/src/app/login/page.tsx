'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome back</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password', { required: 'Password is required' })} error={errors.password?.message} />
          {serverError && <p className="text-danger text-sm mb-4">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Don&apos;t have an account? <Link href="/register" className="text-primary-600 font-medium">Register</Link>
        </p>
      </Card>
    </div>
  );
}