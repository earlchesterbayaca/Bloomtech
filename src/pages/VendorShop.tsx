import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Star, ShoppingBag, ArrowLeft, Search } from 'lucide-react';
import { store } from '../store';
import { Product, Vendor } from '../data';

export default function VendorShop() {
  const { id } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const vendorId = Number(id);
    const foundVendor = store.getVendors().find(v => v.id === vendorId);
    const vendorProducts = store.getProducts().filter(p => p.vendor_id === vendorId);
    
    setVendor(foundVendor || null);
    setProducts(vendorProducts);
    setLoading(false);
  }, [id]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center">Loading Shop...</div>;
  if (!vendor) return <div className="p-20 text-center">Vendor not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <Link to="/shop" className="inline-flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors">
        <ArrowLeft size={18} /> Back to Collection
      </Link>

      {/* Vendor Hero */}
      <div className="relative bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="h-64 relative overflow-hidden bg-rose-500/10">
          {vendor.banner && (
            <img src={vendor.banner} className="w-full h-full object-cover" alt={vendor.name} />
          )}
        </div>
        <div className="px-8 pb-8 -mt-16 relative z-10 flex flex-col md:flex-row gap-8 items-end">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-lg flex items-center justify-center border-4 border-white overflow-hidden shrink-0">
            {vendor.avatar ? (
              <img src={vendor.avatar} className="w-full h-full object-cover" alt={vendor.name} />
            ) : (
              <div className="w-full h-full bg-rose-500 text-white flex items-center justify-center text-4xl font-serif">
                {vendor.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-serif">{vendor.name}</h1>
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full text-sm font-bold">
                <Star size={14} fill="currentColor" /> {vendor.rating}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-slate-500 text-sm">
              <span className="flex items-center gap-1"><MapPin size={14} /> {vendor.location}</span>
              <span className="flex items-center gap-1"><ShoppingBag size={14} /> {products.length} Products</span>
            </div>
            {vendor.bio && <p className="text-slate-600 max-w-2xl italic">"{vendor.bio}"</p>}
          </div>
        </div>
      </div>

      {/* Search & Products */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif">Shop Products</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search in this shop..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-500">This vendor hasn't published any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-bloom-dark">{product.name}</h3>
                    <div className="text-xl font-serif font-bold text-rose-500">
                      ${product.base_price.toFixed(2)}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2">{product.description}</p>
                  <Link 
                    to={`/product/${product.id}`}
                    className="btn-primary w-full inline-block text-center"
                  >
                    Customize & Order
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
