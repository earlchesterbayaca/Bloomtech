import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Package, Truck, CheckCircle2, Clock, Gift, MapPin, Edit3 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { store } from '../store';

// Fix for default marker icons in Leaflet using CDN URLs
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Delivery Icon
const deliveryIcon = L.divIcon({
  html: `<div class="bg-rose-500 p-2 rounded-full text-white shadow-lg animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [tracking, setTracking] = useState(searchParams.get('tracking') || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Simulated Real-time Location (Gingoog City, Mindanao)
  const [deliveryPos, setDeliveryPos] = useState<[number, number]>([8.8211, 125.0958]);

  const handleTrack = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!tracking) return;
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const foundOrder = store.getOrderByTracking(tracking);
      if (foundOrder) {
        setOrder(foundOrder);
        // If order has specific coordinates, use them, otherwise use Gingoog City center
        const lat = foundOrder.lat || 8.8211;
        const lng = foundOrder.lng || 125.0958;
        setDeliveryPos([lat + (Math.random() - 0.5) * 0.01, lng + (Math.random() - 0.5) * 0.01]);
      } else {
        setError('Order not found. Please check your tracking number.');
      }
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    if (searchParams.get('tracking')) handleTrack();
  }, []);

  // Simulate movement
  useEffect(() => {
    if (order && order.status === 'Out for Delivery') {
      const interval = setInterval(() => {
        setDeliveryPos(prev => [
          prev[0] + (Math.random() - 0.4) * 0.0005,
          prev[1] + (Math.random() - 0.4) * 0.0005
        ]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [order]);

  const statuses = [
    { name: 'Order Received', icon: Clock },
    { name: 'Preparing', icon: Gift },
    { name: 'Ready for Delivery', icon: Package },
    { name: 'Out for Delivery', icon: Truck },
    { name: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.name === order?.status);

  if (!order && !loading && !error && !searchParams.get('tracking')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-8">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <Package size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-serif">Track Your Order</h1>
          <p className="text-slate-500">Enter your tracking number above to see your order status.</p>
        </div>
        <form onSubmit={handleTrack} className="max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="BT-XXXXXXXXX"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              value={tracking}
              onChange={e => setTracking(e.target.value.toUpperCase())}
            />
          </div>
          <button type="submit" className="btn-primary">Track</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif">Track Your Gift</h1>
        <p className="text-slate-500">Enter your tracking number to see the progress of your delivery.</p>
        
        <form onSubmit={handleTrack} className="max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="BT-XXXXXXXXX"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              value={tracking}
              onChange={e => setTracking(e.target.value.toUpperCase())}
            />
          </div>
          <button type="submit" className="btn-primary">Track</button>
        </form>
      </div>

      {loading && <div className="text-center py-12">Searching for your order...</div>}
      
      {error && (
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl text-center max-w-md mx-auto">
          {error}
        </div>
      )}

      {order && (
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[3rem] shadow-xl space-y-12"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tracking Number</p>
                <h2 className="text-2xl font-bold text-rose-500">{order.tracking_number}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimated Delivery</p>
                <h2 className="text-2xl font-bold">{order.delivery_date || 'TBD'} {order.delivery_time ? `at ${order.delivery_time}` : ''}</h2>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-rose-500 -translate-y-1/2 transition-all duration-1000"
                style={{ width: `${Math.max(0, currentStatusIndex / (statuses.length - 1)) * 100}%` }}
              />
              
              <div className="relative flex justify-between">
                {statuses.map((s, i) => {
                  const Icon = s.icon;
                  const isCompleted = i <= currentStatusIndex;
                  const isCurrent = i === currentStatusIndex;
                  
                  return (
                    <div key={s.name} className="flex flex-col items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center z-10 transition-colors ${
                        isCompleted ? 'bg-rose-500 text-white' : 'bg-white border-2 border-slate-100 text-slate-300'
                      } ${isCurrent ? 'ring-4 ring-rose-100' : ''}`}>
                        <Icon size={20} />
                      </div>
                      <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-center max-w-[60px] ${
                        isCompleted ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        {s.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Recipient</h4>
                <p className="text-lg font-medium">{order.recipientName || 'Valued Customer'}</p>
                <p className="text-slate-500">{order.address || 'Delivery Address'}</p>
              </div>
              <div className="space-y-2 text-right">
                <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Order Total</h4>
                <p className="text-2xl font-serif font-bold text-rose-500">${(order.total_price || order.totalPrice || 0).toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-[500px] bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100 relative"
          >
            <MapContainer center={[order.lat || 8.8211, order.lng || 125.0958]} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={deliveryPos} icon={deliveryIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-rose-500">BloomTech Courier</p>
                    <p className="text-xs">Status: {order.status}</p>
                  </div>
                </Popup>
              </Marker>
              <MapUpdater center={deliveryPos} />
            </MapContainer>
            
            <div className="absolute bottom-6 left-6 right-6 glass p-4 rounded-2xl z-[1000] flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center animate-pulse">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Tracking</p>
                <p className="text-sm font-bold">{order.status === 'Out for Delivery' ? 'Courier is nearby' : 'Waiting for courier'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
