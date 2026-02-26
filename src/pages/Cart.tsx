import { useCart } from '../store/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-serif">Your cart is empty</h2>
        <p className="text-slate-500">Looks like you haven't added any flowers yet.</p>
        <Link to="/shop" className="btn-primary inline-block">Start Shopping</Link>
      </div>
    );
  }

  const deliveryFee = 15;
  const finalTotal = total + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif mb-12">Your Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item, i) => (
            <motion.div 
              key={`${item.id}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-6 items-center"
            >
              <img src={item.image_url} className="w-32 h-32 object-cover rounded-2xl" alt={item.name} />
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                  {item.customization.flowerType} • {item.customization.style} • {item.customization.colorTheme}
                </div>
                {item.customization.addOns.length > 0 && (
                  <p className="text-sm text-slate-500 italic">
                    Incl: {item.customization.addOns.join(', ')}
                  </p>
                )}
                {item.customization.message && (
                  <p className="text-[10px] text-slate-400 italic line-clamp-1">"{item.customization.message}"</p>
                )}
              </div>
              <div className="flex flex-col gap-2 items-center">
                <button 
                  onClick={() => navigate(`/product/${item.id}`, { state: { editItem: item } })}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-full">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"><Minus size={14} /></button>
                  <span className="w-6 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"><Plus size={14} /></button>
                </div>
              </div>
              <div className="text-xl font-serif font-bold text-rose-500 w-24 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-lg space-y-6">
            <h3 className="text-2xl font-serif">Order Summary</h3>
            <div className="space-y-4 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-bloom-dark">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-bloom-dark">${deliveryFee.toFixed(2)}</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between text-xl text-bloom-dark font-bold">
                <span>Total</span>
                <span className="text-rose-500">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest">
              Safe & Secure Checkout Guaranteed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
