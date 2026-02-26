import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Flower2, Menu, X, LogOut, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { store } from '../store';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const checkNotifications = () => {
        const notifications = store.getNotifications(user.vendor_id || user.id, user.role);
        setHasUnread(notifications.some((n: any) => !n.is_read));
      };
      checkNotifications();
      const interval = setInterval(checkNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Track Order', path: '/track' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin Panel', path: '/admin' });
  }

  if (user?.role === 'vendor') {
    navLinks.push({ name: 'Vendor Dashboard', path: '/vendor' });
  }

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <Flower2 className="text-rose-500 group-hover:rotate-12 transition-transform" size={28} />
            <span className="text-xl font-serif font-bold text-bloom-dark">BloomTech</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                  location.pathname === link.path ? 'text-rose-500' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user && (
              <Link to={user.role === 'vendor' ? "/vendor" : "/profile"} className="relative p-2 hover:bg-rose-50 rounded-full transition-colors">
                <Bell size={20} className={hasUnread ? 'text-rose-500' : 'text-slate-600'} />
                {hasUnread && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                )}
              </Link>
            )}
            <Link to="/cart" className="relative p-2 hover:bg-rose-50 rounded-full transition-colors">
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-rose-500">
                  <User size={20} />
                  {user.name}
                </Link>
                <button onClick={logout} className="p-2 hover:bg-rose-50 rounded-full text-slate-500 hover:text-rose-500">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 text-sm">Login</Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="relative p-2">
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-slate-700"
                >
                  {link.name}
                </Link>
              ))}
              <hr />
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-slate-700">Profile</Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="block text-lg font-medium text-rose-500">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-lg font-medium text-rose-500">Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
