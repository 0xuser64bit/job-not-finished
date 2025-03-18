'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingAnimation from '@/components/ui/loading-animation';

export default function CollectEmail() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, update, status } = useSession();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingAnimation size={50} />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/user/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to save email');
      }

      // Update session to include email
      await update();
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to save email. Please try again.');
    }
  };

  // Only show form if authenticated
  if (status === 'authenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
              Welcome! Please provide your email
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              We'll use this to send you updates about your projects
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">{error}</div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full"
              >
                Continue to Dashboard
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
} 