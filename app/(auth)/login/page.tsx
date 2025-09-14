'use client';

import React from 'react'
import { CiStethoscope } from 'react-icons/ci'
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {

    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const mutation = useMutation({
        mutationFn: async (data: LoginFormValues) => {
            const res = await axios.post('/api/login', data);
            return res.data;
        },

        onSuccess: (data) => {
            console.log('Login successful:', data);
            toast.success("Login successful!");
            router.push('/dashboard');
        },

        onError: (error) => {
            console.error('Login failed:', error);
             toast.error("Login failed");
        }
    });

    const onSubmit = (data: LoginFormValues) => {
        mutation.mutate(data);
    }

  return (
    <div className='flex flex-col items-center justify-center h-screen border bg-white'>

        <div className='flex flex-col border border-gray-500/20 p-8 items-center justify-center  bg-gray-500/5 rounded-lg'>
            <span className='border rounded-full bg-blue-300/30 text-blue-400'><CiStethoscope  size={50}/></span>
            <h1 className='text-3xl font-semibold my-4'>Welcome to EHR Dashboard</h1>
            <h3 className='text-md text-gray-400'>Sign in to your Healthcare Dashboard</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full mt-2 mb-2">
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                    type="email"
                    {...register("email")}
                    className="mt-1 w-full p-2 border rounded hover:border-blue-400/70"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input
                    type="password"
                    {...register("password")}
                    className="mt-1 w-full p-2 border rounded"
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-400/75 text-white py-2 rounded hover:bg-blue-700/70"
                >
                    Login
                </button>

            </form>


            <h3 className='text-gray-400'>Demo Credentials: test@demo.com / password123</h3>

        </div>
      
    </div>
  )
}

export default LoginPage
