import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { CartProvider } from './store/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import VendorDashboard from './pages/VendorDashboard';
import VendorShop from './pages/VendorShop';

function ProtectedRoute({ children, adminOnly = false, vendorOnly = false }: { children: React.ReactNode, adminOnly?: boolean, vendorOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  if (vendorOnly && user.role !== 'vendor') return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/track" element={<TrackOrder />} />
                <Route path="/login" element={<Login />} />
                
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminPanel />
                  </ProtectedRoute>
                } />

                <Route path="/vendor" element={
                  <ProtectedRoute vendorOnly>
                    <VendorDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/vendor/:id" element={<VendorShop />} />
              </Routes>
            </main>
            <footer className="bg-bloom-dark text-white py-12">
              <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
                <h3 className="text-2xl font-serif">BloomTech Connect</h3>
                <p className="text-slate-400 text-sm">Handcrafting moments of joy, delivered to your doorstep.</p>
                <div className="flex justify-center gap-6 text-slate-500 text-xs uppercase tracking-widest">
                  <a href="#" className="hover:text-rose-400">Privacy Policy</a>
                  <a href="#" className="hover:text-rose-400">Terms of Service</a>
                  <a href="#" className="hover:text-rose-400">Contact Us</a>
                </div>
                <p className="text-slate-600 text-[10px] pt-8">© 2026 Earl Chester D. Bayaca.</p>
              </div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
