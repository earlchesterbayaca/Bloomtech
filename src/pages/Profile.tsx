import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { motion } from 'motion/react';
import { ShoppingBag, MapPin, Calendar, ChevronRight, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { store } from '../store';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      const allOrders = store.getOrders();
      const myOrders = user?.role === 'customer' 
        ? allOrders.filter(o => o.user_id === user.id)
        : allOrders;
      setOrders(myOrders);

      if (user) {
        const myNotifs = store.getNotifications(user.id, user.role);
        setNotifications(myNotifs);
      }

      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', avatar: '', bio: '', location: '' });

  useEffect(() => {
    if (user) {
      setEditData({ 
        name: user.name, 
        avatar: user.avatar || '', 
        bio: user.bio || '', 
        location: user.location || '' 
      });
    }
  }, [user]);

  const handleUpdateProfile = () => {
    if (!user) return;
    const updatedUser = store.updateUser(Number(user.id), editData);
    if (updatedUser) {
      updateUser(updatedUser);
      alert('Profile updated successfully!');
    }
    setIsEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="relative group">
          <div className="w-32 h-32 bg-rose-500 text-white rounded-full flex items-center justify-center text-4xl font-serif overflow-hidden border-4 border-white shadow-xl">
            {editData.avatar ? (
              <img src={editData.avatar} className="w-full h-full object-cover" alt={user.name} />
            ) : (
              user.name[0]
            )}
          </div>
          {isEditing && (
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-[10px] font-bold uppercase">Change</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          )}
        </div>
        
        <div className="text-center md:text-left space-y-4 flex-1">
          {isEditing ? (
            <div className="space-y-4 max-w-md mx-auto md:mx-0">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                <input 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bio</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none h-24 resize-none"
                  placeholder="Tell us about yourself..."
                  value={editData.bio}
                  onChange={e => setEditData({...editData, bio: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</label>
                <input 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="City, Country"
                  value={editData.location}
                  onChange={e => setEditData({...editData, location: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleUpdateProfile} className="btn-primary py-2 px-6 text-sm">Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="btn-secondary py-2 px-6 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl font-serif">{user.name}</h1>
                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <Edit3 size={18} />
                </button>
              </div>
              <p className="text-slate-500">{user.email}</p>
              {user.bio && <p className="text-slate-600 max-w-lg italic">"{user.bio}"</p>}
              {user.location && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin size={14} /> {user.location}
                </div>
              )}
              <div className="inline-block px-4 py-1 bg-rose-50 text-rose-500 rounded-full text-xs font-bold uppercase tracking-widest">
                {user.role} Account
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <h2 className="text-2xl font-serif">Your Order History</h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] text-center space-y-4">
              <ShoppingBag className="mx-auto text-slate-200" size={48} />
              <p className="text-slate-500">You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn-primary inline-block">Browse Flowers</Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map(order => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-rose-500">{order.tracking_number}</span>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-tighter ${
                        order.status === 'Accepted' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {order.delivery_date || 'TBD'}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {(order.address || order.delivery_address || '').slice(0, 30)}...</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-serif font-bold">${order.total_price.toFixed(2)}</p>
                    <Link 
                      to={`/track?tracking=${order.tracking_number}`}
                      className="text-rose-500 text-sm font-medium flex items-center gap-1 hover:underline"
                    >
                      View Status <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-serif">Notifications</h2>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={n.id} className={`p-6 border-b border-slate-50 last:border-0 ${!n.is_read ? 'bg-rose-50/30' : ''}`}>
                  <p className="text-sm leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
