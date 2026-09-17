import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Signup = () => {
  const { signup, verifyEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationPayload, setVerificationPayload] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await signup(formData.name, formData.email, formData.password);
      toast.success('Account created successfully!');
      if (res.simulatedVerification) {
        setVerificationPayload(res.simulatedVerification);
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      const fieldErrors = {};
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
      }
      setErrors({ form: msg, ...fieldErrors });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVerify = async () => {
    if (!verificationPayload?.token) return;
    try {
      await verifyEmail(verificationPayload.token);
      toast.success('Email verified successfully!');
      navigate('/');
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
            <UserPlus className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Create Your Account</CardTitle>
          <CardDescription>
            Join to receive release notifications and interact with product updates.
          </CardDescription>
        </CardHeader>

        {verificationPayload ? (
          <CardContent className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Simulated Verification Email</span>
              </div>
              <p className="text-xs text-slate-300">
                In development mode, you can verify your account instantly with 1-click:
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-2"
                onClick={handleQuickVerify}
              >
                Verify Email Now
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Continue to Hub (Unverified Mode)
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errors.form && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-medium">
                  {errors.form}
                </div>
              )}

              <Input
                label="Full Name"
                name="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                leftIcon={<User className="h-4 w-4" />}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="jane@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                loading={loading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Create Account
              </Button>
            </CardContent>
          </form>
        )}

        <CardFooter className="justify-center border-t border-slate-800/60 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 ml-1">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
