import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { store } from '../store';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    vendorName: '',
    vendorLocation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate API delay
    setTimeout(() => {
      if (isLogin) {
        const user = store.findUser(formData.email);
        if (user && user.password === formData.password) {
          login('mock-token', user);
          if (user.role === 'admin') navigate('/admin');
          else if (user.role === 'vendor') navigate('/vendor');
          else navigate('/shop');
        } else {
          setError('Invalid credentials. Try password123');
        }
      } else {
        // Mock register
        const existingUser = store.findUser(formData.email);
        if (existingUser) {
          setError('Email already exists');
          setLoading(false);
          return;
        }

        let vendorId;
        if (role === 'vendor') {
          const newVendor = {
            id: Date.now(),
            name: formData.vendorName || formData.name + "'s Shop",
            location: formData.vendorLocation || 'Gingoog City',
            rating: 5.0
          };
          store.addVendor(newVendor);
          vendorId = newVendor.id;
        }

        const newUser = store.registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: role as any,
          vendor_id: vendorId
        });

        login('mock-token', newUser);
        navigate(role === 'vendor' ? '/vendor' : '/shop');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-500">{isLogin ? 'Sign in to manage your gifts' : 'Join BloomTech for a premium gifting experience'}</p>
        </div>

        {!isLogin && (
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setRole('customer')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${role === 'customer' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-500'}`}
            >
              Customer
            </button>
            <button 
              onClick={() => setRole('vendor')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${role === 'vendor' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-500'}`}
            >
              Vendor
            </button>
          </div>
        )}

        {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              {role === 'vendor' && (
                <>
                  <div className="relative">
                    <input 
                      required
                      placeholder="Shop Name"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      value={formData.vendorName}
                      onChange={e => setFormData({...formData, vendorName: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <input 
                      required
                      placeholder="Shop Location"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      value={formData.vendorLocation}
                      onChange={e => setFormData({...formData, vendorLocation: e.target.value})}
                    />
                  </div>
                </>
              )}
            </>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button 
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>

        {isLogin && (
          <div className="text-center space-y-2">
            
          </div>
        )}

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 hover:text-rose-500 font-medium"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
