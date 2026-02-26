import { useState } from 'react';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CreditCard, Truck, MapPin, Phone, User } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { store } from '../store';

// Fix for default marker icons
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationPicker({ setCoords }: { setCoords: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      setCoords(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    address: '',
    deliveryDate: '',
    deliveryTime: '10:00',
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiry: '',
    cvc: '',
    lat: 8.8211,
    lng: 125.0958
  });

  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    
    setProcessing(true);
    // Mock Payment Delay
    await new Promise(r => setTimeout(r, 2000));

    const order = store.addOrder({
      items,
      total_price: total + 15,
      address: formData.address,
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      delivery_date: formData.deliveryDate,
      delivery_time: formData.deliveryTime,
      payment_method: formData.paymentMethod,
      lat: formData.lat,
      lng: formData.lng,
      user_name: user.name,
      user_id: user.id
    });

    // Notify vendors
    const vendorIds = Array.from(new Set(items.map(item => item.vendor_id)));
    vendorIds.forEach(vId => {
      store.addNotification({
        vendor_id: vId,
        message: `New order received! Tracking: ${order.tracking_number}`,
        type: 'new_order'
      });
    });

    clearCart();
    navigate(`/track?tracking=${order.tracking_number}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif mb-12 text-center">Checkout</h1>
      
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Truck className="text-rose-500" size={20} /> Delivery Details
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  placeholder="Recipient Name"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={formData.recipientName}
                  onChange={e => setFormData({...formData, recipientName: e.target.value})}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  placeholder="Recipient Phone"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={formData.recipientPhone}
                  onChange={e => setFormData({...formData, recipientPhone: e.target.value})}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea 
                  required
                  placeholder="Full Delivery Address"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none h-24"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  required
                  type="date"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={formData.deliveryDate}
                  onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                />
                <input 
                  required
                  type="time"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={formData.deliveryTime}
                  onChange={e => setFormData({...formData, deliveryTime: e.target.value})}
                />
              </div>

              {/* Delivery Spot Map */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Pinpoint Delivery Spot</label>
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 relative">
                  <MapContainer 
                    center={[formData.lat, formData.lng]} 
                    zoom={14} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[formData.lat, formData.lng]} />
                    <LocationPicker setCoords={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))} />
                  </MapContainer>
                  <div className="absolute bottom-2 right-2 z-[1000] bg-white/90 px-2 py-1 rounded text-[8px] font-bold uppercase text-slate-500">
                    Click map to set pin
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="text-rose-500" size={20} /> Payment Method
            </h3>
            
            <div className="space-y-3">
              {['credit_card', 'gcash', 'cod'].map(method => (
                <label key={method} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-rose-200'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method} 
                    checked={formData.paymentMethod === method}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-5 h-5 accent-rose-500"
                  />
                  <span className="font-bold capitalize">
                    {method === 'credit_card' ? 'Credit Card' : method === 'gcash' ? 'GCash' : 'Cash on Delivery'}
                  </span>
                </label>
              ))}
            </div>

            {formData.paymentMethod === 'credit_card' && (
              <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                <input 
                  required
                  placeholder="Card Number"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={formData.cardNumber}
                  onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    value={formData.expiry}
                    onChange={e => setFormData({...formData, expiry: e.target.value})}
                  />
                  <input 
                    required
                    placeholder="CVC"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    value={formData.cvc}
                    onChange={e => setFormData({...formData, cvc: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-rose-50 p-8 rounded-[2.5rem] space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total to Pay</span>
              <span className="text-rose-500">${(total + 15).toFixed(2)}</span>
            </div>
            <button 
              disabled={processing}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing Payment...' : 'Complete Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
