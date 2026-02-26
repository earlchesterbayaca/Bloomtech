import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Minus, Calendar, Check, Info, AlertCircle } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { store } from '../store';
import { Product } from '../data';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart, removeFromCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const editItem = location.state?.editItem;

  // Customization State
  const [flowerType, setFlowerType] = useState(editItem?.customization.flowerType || 'Standard');
  const [colorTheme, setColorTheme] = useState(editItem?.customization.colorTheme || 'Original');
  const [style, setStyle] = useState(editItem?.customization.style || 'Classic');
  const [message, setMessage] = useState(editItem?.customization.message || '');
  const [addOns, setAddOns] = useState<string[]>(editItem?.customization.addOns || []);
  const [quantity, setQuantity] = useState(editItem?.quantity || 1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isSameDay, setIsSameDay] = useState(false);

  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      const foundProduct = store.getProducts().find(p => p.id === Number(id));
      if (foundProduct) {
        setProduct(foundProduct);
        setActiveImage(foundProduct.image_url);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found</div>;

  const productImages = product.images && product.images.length > 0 ? product.images : [product.image_url];

  const qualityOptions = product.qualities || [{ name: 'Standard', price: 0 }, { name: 'Premium', price: 20 }];
  const themeOptions = product.themes || ['Original', 'Pastel', 'Vibrant', 'White & Green'];
  const styleOptions = product.styles || [{ name: 'Classic', price: 0 }, { name: 'Modern', price: 15 }];
  const addOnOptions = product.addOns || [
    { name: 'Chocolates', price: 15 },
    { name: 'Teddy Bear', price: 20 },
    { name: 'Premium Wrapping', price: 10 },
  ];

  const customizationFee = 
    (qualityOptions.find(q => q.name === flowerType)?.price || 0) + 
    (styleOptions.find(s => s.name === style)?.price || 0) +
    (isSameDay ? 10 : 0);

  const addOnsTotal = addOns.reduce((sum, name) => {
    const option = addOnOptions.find(o => o.name === name);
    return sum + (option?.price || 0);
  }, 0);
  const unitPrice = product.base_price + customizationFee + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (user?.role === 'vendor' && user.vendor_id === product.vendor_id) {
      alert("You cannot order your own products.");
      return;
    }
    if (editItem) {
      removeFromCart(editItem.id);
    }
    addToCart({
      id: product.id,
      vendor_id: product.vendor_id,
      name: product.name,
      price: unitPrice,
      quantity,
      image_url: product.image_url,
      customization: {
        flowerType,
        colorTheme,
        style,
        message,
        addOns
      }
    });
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left: Image Gallery */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[3rem] overflow-hidden shadow-2xl bg-slate-50 aspect-[4/5]"
          >
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>
          
          {productImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === img ? 'border-rose-500 ring-2 ring-rose-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Angle ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Customization */}
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-rose-500 font-bold uppercase tracking-widest text-xs">{product.category}</span>
            <h1 className="text-5xl font-serif">{product.name}</h1>
            <p className="text-slate-500">
              by <Link to={`/vendor/${product.vendor_id}`} className="hover:text-rose-500 transition-colors font-medium">{product.vendor_name}</Link>
            </p>
            <div className="text-3xl font-serif font-bold text-rose-500 mt-4">
              ${unitPrice.toFixed(2)}
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">{product.description}</p>

          <hr className="border-slate-200" />

          {/* Customization Options */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Flower Quality</label>
              <div className="flex gap-4">
                {qualityOptions.map(opt => (
                  <button
                    key={opt.name}
                    onClick={() => setFlowerType(opt.name)}
                    className={`flex-1 py-3 rounded-2xl border-2 transition-all ${
                      flowerType === opt.name ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 hover:border-rose-200'
                    }`}
                  >
                    {opt.name} {opt.price > 0 && `(+ $${opt.price})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Color Theme</label>
              <div className="flex flex-wrap gap-3">
                {themeOptions.map(theme => (
                  <button
                    key={theme}
                    onClick={() => setColorTheme(theme)}
                    className={`px-6 py-2 rounded-full border-2 transition-all text-sm font-medium ${
                      colorTheme === theme ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 hover:border-rose-200'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Arrangement Style</label>
              <div className="flex gap-4">
                {styleOptions.map(opt => (
                  <button
                    key={opt.name}
                    onClick={() => setStyle(opt.name)}
                    className={`flex-1 py-3 rounded-2xl border-2 transition-all ${
                      style === opt.name ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 hover:border-rose-200'
                    }`}
                  >
                    {opt.name} {opt.price > 0 && `(+ $${opt.price})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Add-Ons</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {addOnOptions.map(opt => (
                  <button
                    key={opt.name}
                    onClick={() => setAddOns(prev => prev.includes(opt.name) ? prev.filter(a => a !== opt.name) : [...prev, opt.name])}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      addOns.includes(opt.name) ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 hover:border-rose-200'
                    }`}
                  >
                    <div className="text-sm font-bold">{opt.name}</div>
                    <div className="text-xs opacity-70">+${opt.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Delivery Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3 flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl border border-slate-100 hover:bg-rose-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-rose-500"
                    checked={isSameDay}
                    onChange={e => setIsSameDay(e.target.checked)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Same-Day Delivery</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">+ $10.00 Fee</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Personal Message</label>
              <textarea 
                placeholder="Write a heartfelt note..."
                className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none h-32"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between gap-8 pt-6">
              <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-full">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-rose-50"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-rose-50"
                >
                  <Plus size={18} />
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={user?.role === 'vendor' && user.vendor_id === product.vendor_id}
                className={`btn-primary flex-1 py-4 text-lg ${
                  user?.role === 'vendor' && user.vendor_id === product.vendor_id ? 'opacity-50 cursor-not-allowed grayscale' : ''
                }`}
              >
                {user?.role === 'vendor' && user.vendor_id === product.vendor_id 
                  ? 'Your Own Product' 
                  : `Add to Cart — $${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
