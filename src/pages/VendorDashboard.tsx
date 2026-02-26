import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit3, Package, DollarSign, Tag, Image as ImageIcon, X, Bell, Upload, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { store } from '../store';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [publishing, setPublishing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [vendorData, setVendorData] = useState({ name: '', location: '', bio: '', banner: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.vendor_id) {
      const v = store.getVendors().find(v => v.id === user.vendor_id);
      if (v) {
        setVendorData({ 
          name: v.name, 
          location: v.location, 
          bio: v.bio || '',
          banner: v.banner || ''
        });
      }
    }
  }, [user]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    base_price: '',
    category: 'Anniversary',
    image_url: '',
    images: [] as string[],
    qualities: [{ name: 'Standard', price: 0 }, { name: 'Premium', price: 20 }],
    themes: ['Original', 'Pastel', 'Vibrant', 'White & Green'],
    styles: [{ name: 'Classic', price: 0 }, { name: 'Modern', price: 15 }],
    addOns: [{ name: 'Chocolates', price: 15 }, { name: 'Teddy Bear', price: 20 }, { name: 'Premium Wrapping', price: 10 }]
  });

  const handleAddOption = (field: 'qualities' | 'styles' | 'addOns') => {
    setNewProduct(prev => ({
      ...prev,
      [field]: [...prev[field], { name: '', price: 0 }]
    }));
  };

  const handleRemoveOption = (field: 'qualities' | 'styles' | 'addOns', index: number) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (field: 'qualities' | 'styles' | 'addOns', index: number, key: 'name' | 'price', value: string | number) => {
    setNewProduct(prev => {
      const newList = [...prev[field]];
      newList[index] = { ...newList[index], [key]: value };
      return { ...prev, [field]: newList };
    });
  };

  const handleAddTheme = () => {
    setNewProduct(prev => ({ ...prev, themes: [...prev.themes, ''] }));
  };

  const handleRemoveTheme = (index: number) => {
    setNewProduct(prev => ({ ...prev, themes: prev.themes.filter((_, i) => i !== index) }));
  };

  const handleThemeChange = (index: number, value: string) => {
    setNewProduct(prev => {
      const newList = [...prev.themes];
      newList[index] = value;
      return { ...prev, themes: newList };
    });
  };

  useEffect(() => {
    const fetchData = () => {
      fetchProducts();
      fetchOrders();
      fetchNotifications();
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchProducts = () => {
    const allProducts = store.getProducts();
    const vendorProducts = user?.role === 'vendor' 
      ? allProducts.filter(p => p.vendor_id === user.vendor_id)
      : allProducts;
    setProducts(vendorProducts);
    setLoading(false);
  };

  const fetchOrders = () => {
    if (!user) return;
    const allOrders = store.getOrders();
    // An order might have items from multiple vendors. 
    // For simplicity, we show orders that contain at least one item from this vendor.
    const vendorOrders = allOrders.filter(order => 
      order.items.some((item: any) => item.vendor_id === user.vendor_id)
    );
    setOrders(vendorOrders);
  };

  const fetchNotifications = () => {
    if (!user) return;
    const userNotifications = store.getNotifications(user.vendor_id || user.id, user.role);
    setNotifications(userNotifications);
  };

  const handleApproveOrder = (orderId: number) => {
    store.updateOrderStatus(orderId, 'Accepted');
    fetchOrders();
    fetchNotifications();
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVendorData(prev => ({ ...prev, banner: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.vendor_id) {
      store.updateVendor(user.vendor_id, vendorData);
      alert('Shop settings updated successfully!');
      setActiveTab('products');
    }
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setNewProduct(prev => {
            if (!prev.image_url) {
              return { ...prev, image_url: result, images: [...prev.images, result] };
            }
            return { ...prev, images: [...prev.images, result] };
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image_url: index === 0 ? (newImages[0] || '') : prev.image_url
      };
    });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setError('');
    
    setTimeout(() => {
      const productData = {
        ...newProduct,
        base_price: Number(newProduct.base_price),
        vendor_id: Number(user?.vendor_id || 1),
        vendor_name: user?.name || 'Demo Vendor',
        qualities: newProduct.qualities.filter(q => q.name),
        themes: newProduct.themes.filter(t => t),
        styles: newProduct.styles.filter(s => s.name),
        addOns: newProduct.addOns.filter(a => a.name)
      };

      if (editingId) {
        store.updateProduct(Number(editingId), productData);
      } else {
        store.addProduct(productData);
      }
      
      setShowAddModal(false);
      setEditingId(null);
      setNewProduct({ 
        name: '', 
        description: '', 
        base_price: '', 
        category: 'Anniversary', 
        image_url: '',
        images: [],
        qualities: [{ name: 'Standard', price: 0 }, { name: 'Premium', price: 20 }],
        themes: ['Original', 'Pastel', 'Vibrant', 'White & Green'],
        styles: [{ name: 'Classic', price: 0 }, { name: 'Modern', price: 15 }],
        addOns: [{ name: 'Chocolates', price: 15 }, { name: 'Teddy Bear', price: 20 }, { name: 'Premium Wrapping', price: 10 }]
      });
      fetchProducts();
      setPublishing(false);
    }, 800);
  };

  const handleEdit = (product: any) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      base_price: product.base_price.toString(),
      category: product.category,
      image_url: product.image_url,
      images: product.images || [product.image_url],
      qualities: product.qualities || [],
      themes: product.themes || [],
      styles: product.styles || [],
      addOns: product.addOns || []
    });
    setEditingId(product.id);
    setShowAddModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    store.deleteProduct(Number(id));
    fetchProducts();
    alert('Product deleted successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif">Vendor Dashboard</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-slate-500">Manage your shop's inventory and listings.</p>
            {user?.vendor_id && (
              <Link 
                to={`/vendor/${user.vendor_id}`} 
                className="text-rose-500 text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                View Public Shop <ChevronRight size={12} />
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsRead();
              }}
              className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 relative hover:bg-rose-50 transition-colors"
            >
              <Bell size={20} className="text-slate-600" />
              {notifications.some(n => !n.is_read) && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold">Notifications</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {notifications.length} Total
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-slate-50 flex gap-3 ${!n.is_read ? 'bg-rose-50/30' : ''}`}>
                          <div className="w-8 h-8 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center shrink-0">
                            <Package size={14} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm leading-snug">{n.message}</p>
                            <p className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Add New Product
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 border-b border-slate-100 pb-4">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-rose-500 text-white' : 'text-slate-500 hover:bg-rose-50'}`}
        >
          My Products
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-rose-500 text-white' : 'text-slate-500 hover:bg-rose-50'}`}
        >
          Manage Orders {orders.filter(o => o.status === 'Order Received').length > 0 && (
            <span className="ml-2 bg-white text-rose-500 px-2 py-0.5 rounded-full text-[10px]">
              {orders.filter(o => o.status === 'Order Received').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-rose-500 text-white' : 'text-slate-500 hover:bg-rose-50'}`}
        >
          Shop Settings
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />)}
        </div>
      ) : activeTab === 'products' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group"
            >
              <div className="h-48 relative overflow-hidden">
                <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="p-2 bg-white/90 text-slate-600 rounded-full hover:text-rose-500"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                    className="p-2 bg-white/90 text-rose-500 rounded-full hover:bg-rose-50"
                  >
                    <Trash2 size={18} className="pointer-events-none" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <span className="text-rose-500 font-bold">${product.base_price}</span>
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{product.category}</p>
                <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : activeTab === 'orders' ? (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Package className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-xl font-medium text-slate-500">No orders yet</h3>
            </div>
          ) : (
            orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8"
              >
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1 bg-rose-50 text-rose-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {order.tracking_number}
                    </span>
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      order.status === 'Accepted' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{order.recipientName}</h3>
                    <p className="text-slate-500 text-sm">{order.address}</p>
                  </div>
                  <div className="flex gap-4">
                    {order.items.filter((item: any) => item.vendor_id === user?.vendor_id).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <img src={item.image_url} className="w-10 h-10 rounded-lg object-cover" />
                        <span className="text-xs font-medium">{item.quantity}x {item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right space-y-4">
                  <p className="text-2xl font-serif font-bold text-rose-500">${order.total_price.toFixed(2)}</p>
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                    >
                      View Details
                    </button>
                    {order.status === 'Order Received' && (
                      <button 
                        onClick={() => handleApproveOrder(order.id)}
                        className="btn-primary py-2 px-8 flex items-center gap-2"
                      >
                        <CheckCircle size={18} /> Approve Order
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-serif">Shop Settings</h2>
            <p className="text-slate-500">Customize how your shop appears to customers.</p>
          </div>

          <form onSubmit={handleUpdateVendor} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Shop Banner</label>
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className="relative h-40 bg-slate-100 rounded-3xl overflow-hidden cursor-pointer group border-2 border-dashed border-slate-200 hover:border-rose-300 transition-all"
              >
                {vendorData.banner ? (
                  <>
                    <img src={vendorData.banner} className="w-full h-full object-cover" alt="Banner" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="text-white" size={24} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Upload size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest mt-2">Upload Shop Banner</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={bannerInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleBannerUpload} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Shop Name</label>
              <input 
                className="w-full px-6 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                value={vendorData.name}
                onChange={e => setVendorData({...vendorData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Location</label>
              <input 
                className="w-full px-6 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                value={vendorData.location}
                onChange={e => setVendorData({...vendorData, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Shop Bio</label>
              <textarea 
                className="w-full px-6 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none h-32 resize-none"
                placeholder="Describe your shop's unique style..."
                value={vendorData.bio}
                onChange={e => setVendorData({...vendorData, bio: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary w-full py-4">Save Shop Settings</button>
          </form>
        </motion.div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-bloom-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Recipient Information</h4>
                    <p className="font-bold text-lg">{selectedOrder.recipientName}</p>
                    <p className="text-slate-500">{selectedOrder.recipientPhone}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Delivery Details</h4>
                    <p className="text-slate-600"><span className="font-bold">Date:</span> {selectedOrder.delivery_date}</p>
                    <p className="text-slate-600"><span className="font-bold">Time:</span> {selectedOrder.delivery_time}</p>
                    <p className="text-slate-600 mt-2"><span className="font-bold">Address:</span> {selectedOrder.address}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Payment Method</h4>
                    <p className="text-slate-600 uppercase font-bold text-xs">{selectedOrder.payment_method?.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Items from your shop</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.filter((item: any) => item.vendor_id === user?.vendor_id).map((item: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-2xl space-y-3">
                        <div className="flex gap-3">
                          <img src={item.image_url} className="w-16 h-16 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.quantity}x — ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-[10px] space-y-1">
                          <p><span className="font-bold text-slate-400 uppercase">Quality:</span> {item.customization.flowerType}</p>
                          <p><span className="font-bold text-slate-400 uppercase">Theme:</span> {item.customization.colorTheme}</p>
                          <p><span className="font-bold text-slate-400 uppercase">Style:</span> {item.customization.style}</p>
                          {item.customization.addOns.length > 0 && (
                            <p><span className="font-bold text-slate-400 uppercase">Add-ons:</span> {item.customization.addOns.join(', ')}</p>
                          )}
                          {item.customization.message && (
                            <div className="mt-2 p-2 bg-white rounded-lg border border-slate-100 italic text-slate-600">
                              "{item.customization.message}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedOrder.status === 'Order Received' && (
                <button 
                  onClick={() => {
                    handleApproveOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Approve Order
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-bloom-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => { setShowAddModal(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm text-center">{error}</div>}

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Product Name</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Base Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required
                        type="number"
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        value={newProduct.base_price}
                        onChange={e => setNewProduct({...newProduct, base_price: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select 
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none appearance-none"
                        value={newProduct.category}
                        onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      >
                        <option>Anniversary</option>
                        <option>Birthday</option>
                        <option>Graduation</option>
                        <option>Valentine’s</option>
                        <option>Funerals</option>
                        <option>Something Else</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Product Images (Multiple)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {newProduct.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                        <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-white/80 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-rose-300 hover:bg-rose-50 transition-all"
                    >
                      <Plus className="text-slate-400" size={20} />
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Add Image</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        placeholder="Or paste image URL and press Enter..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value;
                            if (val) {
                              setNewProduct(prev => ({
                                ...prev,
                                image_url: prev.image_url || val,
                                images: [...prev.images, val]
                              }));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Description</label>
                  <textarea 
                    required
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none h-24"
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>

                {/* Customization Options UI */}
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Customization Options</h3>
                  
                  {/* Qualities */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Flower Qualities</label>
                      <button type="button" onClick={() => handleAddOption('qualities')} className="text-rose-500 text-[10px] font-bold uppercase">+ Add Quality</button>
                    </div>
                    {newProduct.qualities.map((q, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          placeholder="Name (e.g. Standard)"
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={q.name}
                          onChange={e => handleOptionChange('qualities', i, 'name', e.target.value)}
                        />
                        <input 
                          type="number"
                          placeholder="Price"
                          className="w-20 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={q.price}
                          onChange={e => handleOptionChange('qualities', i, 'price', Number(e.target.value))}
                        />
                        <button type="button" onClick={() => handleRemoveOption('qualities', i)} className="text-slate-300 hover:text-rose-500"><X size={16} /></button>
                      </div>
                    ))}
                  </div>

                  {/* Themes */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Color Themes</label>
                      <button type="button" onClick={handleAddTheme} className="text-rose-500 text-[10px] font-bold uppercase">+ Add Theme</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newProduct.themes.map((t, i) => (
                        <div key={i} className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                          <input 
                            className="bg-transparent text-xs focus:outline-none w-20"
                            value={t}
                            onChange={e => handleThemeChange(i, e.target.value)}
                          />
                          <button type="button" onClick={() => handleRemoveTheme(i)} className="text-slate-400 hover:text-rose-500"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Styles */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Arrangement Styles</label>
                      <button type="button" onClick={() => handleAddOption('styles')} className="text-rose-500 text-[10px] font-bold uppercase">+ Add Style</button>
                    </div>
                    {newProduct.styles.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          placeholder="Name (e.g. Classic)"
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={s.name}
                          onChange={e => handleOptionChange('styles', i, 'name', e.target.value)}
                        />
                        <input 
                          type="number"
                          placeholder="Price"
                          className="w-20 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={s.price}
                          onChange={e => handleOptionChange('styles', i, 'price', Number(e.target.value))}
                        />
                        <button type="button" onClick={() => handleRemoveOption('styles', i)} className="text-slate-300 hover:text-rose-500"><X size={16} /></button>
                      </div>
                    ))}
                  </div>

                  {/* Add-ons */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Add-ons</label>
                      <button type="button" onClick={() => handleAddOption('addOns')} className="text-rose-500 text-[10px] font-bold uppercase">+ Add Add-on</button>
                    </div>
                    {newProduct.addOns.map((a, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          placeholder="Name (e.g. Chocolates)"
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={a.name}
                          onChange={e => handleOptionChange('addOns', i, 'name', e.target.value)}
                        />
                        <input 
                          type="number"
                          placeholder="Price"
                          className="w-20 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={a.price}
                          onChange={e => handleOptionChange('addOns', i, 'price', Number(e.target.value))}
                        />
                        <button type="button" onClick={() => handleRemoveOption('addOns', i)} className="text-slate-300 hover:text-rose-500"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={publishing}
                  className="btn-primary w-full py-4 text-lg mt-4 flex items-center justify-center gap-2"
                >
                  {publishing ? 'Publishing...' : editingId ? 'Update Product' : 'Publish Product'} <CheckCircle size={18} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
