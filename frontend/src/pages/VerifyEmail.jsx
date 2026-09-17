import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const VerifyEmail = () => {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = paramToken || searchParams.get('token');

  const { verifyEmail } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleVerify = async () => {
      if (!token) {
        setLoading(false);
        setErrorMessage('No verification token was provided.');
        return;
      }

      try {
        await verifyEmail(token);
        setSuccess(true);
        toast.success('Email verified successfully!');
      } catch (err) {
        setSuccess(false);
        setErrorMessage(
          err.response?.data?.message || 'Invalid or expired verification token.'
        );
      } finally {
        setLoading(false);
      }
    };

    handleVerify();
  }, [token, verifyEmail, toast]);

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-xl text-center">
        <CardHeader className="space-y-3">
          {loading ? (
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 animate-spin">
              <Loader2 className="h-7 w-7" />
            </div>
          ) : success ? (
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
          ) : (
            <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="h-7 w-7" />
            </div>
          )}

          <CardTitle className="text-2xl font-bold text-white">
            {loading
              ? 'Verifying Email...'
              : success
              ? 'Email Verified!'
              : 'Verification Failed'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">
            {loading
              ? 'Please wait while we confirm your email address token with the server.'
              : success
              ? 'Your email address has been verified. You now have full access to all features.'
              : errorMessage}
          </p>

          {!loading && (
            <Link to="/" className="inline-block w-full">
              <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Go to Product Timeline
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
