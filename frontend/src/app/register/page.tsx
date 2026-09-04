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
  full_name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/auth/register', data);
      setAuth(res.data.user, res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create your account</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Full Name" {...register('full_name', { required: 'Name is required' })} error={errors.full_name?.message} />
          <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password', { required: 'Password is required', minLength: 6 })} error={errors.password?.message} />
          {serverError && <p className="text-danger text-sm mb-4">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account? <Link href="/login" className="text-primary-600 font-medium">Login</Link>
        </p>
      </Card>
    </div>
  );
}