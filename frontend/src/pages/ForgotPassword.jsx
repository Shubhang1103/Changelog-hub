import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [simulatedReset, setSimulatedReset] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data?.simulatedReset) {
        setSimulatedReset(res.data.simulatedReset);
      }
      toast.success(res.data?.message || 'Password reset link generated.');
    } catch (err) {
      toast.error('Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive password reset instructions.
          </CardDescription>
        </CardHeader>

        {submitted ? (
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Reset Instructions Dispatched</span>
              </div>
              <p className="text-xs text-slate-300">
                If an account exists for <span className="font-mono text-white">{email}</span>, instructions have been logged.
              </p>
              {simulatedReset?.token && (
                <div className="pt-2">
                  <Link to={`/reset-password/${simulatedReset.token}`}>
                    <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      Dev: Open Reset Password Page
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/login" className="block text-center">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <Input
                label="Registered Email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                loading={loading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Send Reset Link
              </Button>
            </CardContent>
          </form>
        )}

        <CardFooter className="justify-center border-t border-slate-800/60 text-xs text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 ml-1">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
