import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { store } from '../store';
import { Product } from '../data';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setProducts(store.getProducts());
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const categories = ['All', 'Anniversary', 'Birthday', 'Graduation', 'Valentine’s', 'Funerals', 'Something Else'];

  const filteredProducts = products.filter(p => {
    const vendorName = p.vendor_name || 'Unknown Vendor';
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || vendorName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif">Our Collection</h1>
          <p className="text-slate-500">Find the perfect arrangement for any occasion.</p>
        </div>
        
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-end">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search flowers..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center border-b border-slate-100 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                category === c ? 'bg-rose-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-rose-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
          ))}
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
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-rose-500 shadow-sm">
                  {product.category}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-bloom-dark">{product.name}</h3>
                    <p className="text-sm text-slate-500">
                      by <Link to={`/vendor/${product.vendor_id}`} className="hover:text-rose-500 transition-colors font-medium">{product.vendor_name}</Link>
                    </p>
                  </div>
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
      
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="text-slate-300 flex justify-center"><Search size={64} /></div>
          <h3 className="text-xl font-medium">No flowers found matching your criteria.</h3>
          <button onClick={() => { setSearch(''); setCategory('All'); }} className="text-rose-500 font-medium">Clear all filters</button>
        </div>
      )}
    </div>
  );
}
