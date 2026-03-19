import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Toemen Hub</h1>
          <p className="text-primary-foreground/60 text-sm mt-1">
            {isLogin ? 'Log in op het dashboard' : 'Account aanmaken'}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-elevated space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">{error}</div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mailadres"
              className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord" onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full pl-10 pr-10 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            onClick={handleSubmit} disabled={loading || !email || !password}
            className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-bold text-sm disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : isLogin ? 'Inloggen' : 'Account aanmaken'}
          </motion.button>

          <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
            {isLogin ? 'Nog geen account? Registreer' : 'Al een account? Log in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
