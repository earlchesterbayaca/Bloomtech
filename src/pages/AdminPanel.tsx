import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Package, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Store as StoreIcon,
  Search,
  Filter,
  Plus,
  Star
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { store } from '../store';

type AdminTab = 'dashboard' | 'orders' | 'products' | 'vendors' | 'users';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [editType, setEditType] = useState<AdminTab | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const allOrders = store.getOrders();
    const allProducts = store.getProducts();
    const allVendors = store.getVendors();
    const allUsers = store.getUsers();
    const revenue = allOrders.reduce((sum, o) => sum + (o.total_price || o.totalPrice || 0), 0);
    
    setStats({
      revenue,
      orderCount: allOrders.length,
      profit: revenue * 0.3,
      expenses: revenue * 0.7,
      productCount: allProducts.length,
      vendorCount: allVendors.length,
      userCount: allUsers.length
    });
    setOrders(allOrders);
    setProducts(allProducts);
    setVendors(allVendors);
    setUsers(allUsers);
    setLoading(false);
  };

  const handleUpdateOrderStatus = (orderId: number, newStatus: string) => {
    store.updateOrderStatus(orderId, newStatus);
    fetchData();
  };

  const handleDeleteOrder = (id: number) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      store.deleteOrder(id);
      fetchData();
      alert('Order deleted successfully');
    }
  };

  const handleDeleteUser = (id: number) => {
    if (Number(user?.id) === Number(id)) {
      alert('You cannot delete your own admin account while logged in.');
      return;
    }
    if (confirm('Are you sure you want to delete this user? All their data will be permanently removed.')) {
      store.deleteUser(id);
      fetchData();
      alert('User deleted successfully');
    }
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      store.deleteProduct(id);
      fetchData();
      alert('Product deleted successfully');
    }
  };

  const handleDeleteVendor = (id: number) => {
    if (confirm('Are you sure you want to delete this vendor? This will not delete their products but they will lose access.')) {
      store.deleteVendor(id);
      fetchData();
      alert('Vendor deleted successfully');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editType) return;

    switch (editType) {
      case 'users':
        store.updateUser(Number(editingItem.id), editingItem);
        break;
      case 'vendors':
        store.updateVendor(Number(editingItem.id), editingItem);
        break;
      case 'products':
        store.updateProduct(Number(editingItem.id), editingItem);
        break;
      case 'orders':
        store.updateOrder(Number(editingItem.id), editingItem);
        break;
    }

    setEditingItem(null);
    setEditType(null);
    fetchData();
  };

  const handleAddVendor = () => {
    const name = prompt('Enter Vendor Name:');
    const location = prompt('Enter Vendor Location:');
    if (name && location) {
      const newVendor = {
        id: Date.now(),
        name,
        location,
        rating: 5.0
      };
      store.addVendor(newVendor);
      fetchData();
    }
  };

  if (loading) return <div className="p-12 text-center">Loading Dashboard...</div>;

  const chartData = [
    { name: 'Week 1', rev: stats.revenue * 0.2 },
    { name: 'Week 2', rev: stats.revenue * 0.45 },
    { name: 'Week 3', rev: stats.revenue * 0.7 },
    { name: 'Week 4', rev: stats.revenue },
  ];

  const filteredOrders = orders.filter(o => 
    o.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.recipientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif">Admin Control Center</h1>
          <p className="text-slate-500">Global oversight of BloomTech Connect operations.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto max-w-full">
          {(['dashboard', 'orders', 'products', 'vendors', 'users'] as AdminTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white shadow-sm text-rose-500' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Total Orders', value: stats.orderCount, icon: ShoppingBag, color: 'text-rose-500', bg: 'bg-rose-50' },
                { label: 'Active Vendors', value: stats.vendorCount, icon: StoreIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Total Users', value: stats.userCount, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts & Recent Activity */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold">Revenue Growth</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fb7185" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="rev" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold">Recent Orders</h3>
                <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
                  {Array.isArray(orders) && orders.slice(0, 5).map(order => (
                    <div key={order.id} className="p-4 bg-slate-50 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm">{order.tracking_number}</p>
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{order.recipientName} • ${(order.total_price || order.totalPrice || 0).toFixed(2)}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="w-full py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    View All Orders
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  placeholder="Search by tracking number or recipient..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Order</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-sm">{order.tracking_number}</p>
                        <p className="text-[10px] text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium">{order.recipientName}</p>
                        <p className="text-xs text-slate-500">{order.recipientPhone}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-rose-500">${(order.total_price || order.totalPrice || 0).toFixed(2)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-xs bg-slate-100 border-none rounded-lg px-3 py-1.5 font-bold focus:ring-2 focus:ring-rose-500"
                        >
                          <option>Order Received</option>
                          <option>Preparing</option>
                          <option>Ready for Delivery</option>
                          <option>Out for Delivery</option>
                          <option>Delivered</option>
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingItem({ ...order, type: 'order' }); }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="View Details"
                        >
                          <Search size={18} className="pointer-events-none" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(order); setEditType('orders'); }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={18} className="pointer-events-none" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} className="pointer-events-none" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="p-12 text-center text-slate-400">No orders found matching your search.</div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  placeholder="Search products or vendors..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => navigate('/vendor')}
                className="btn-primary px-8 flex items-center gap-2"
              >
                <Plus size={18} />
                Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4 group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                    <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm truncate">{product.name}</h4>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingItem({ ...product, type: 'product' }); }}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                          title="View Details"
                        >
                          <Search size={16} className="pointer-events-none" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(product); setEditType('products'); }}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={16} className="pointer-events-none" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} className="pointer-events-none" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{product.category}</p>
                    <p className="text-xs text-slate-500 truncate">by {product.vendor_name}</p>
                    <p className="text-sm font-bold text-rose-500">${product.base_price}</p>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                No products found.
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'vendors' && (
          <motion.div
            key="vendors"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  placeholder="Search vendors by name or location..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={handleAddVendor}
                className="btn-primary px-8 flex items-center gap-2"
              >
                <Plus size={18} />
                Add New Vendor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVendors.map(vendor => (
                <div key={vendor.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                      <StoreIcon size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{vendor.name}</h4>
                      <p className="text-xs text-slate-500">{vendor.location} • Rating: {vendor.rating}</p>
                    </div>
                  </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingItem({ ...vendor, type: 'vendor' }); }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="View Details"
                        >
                          <Search size={18} className="pointer-events-none" />
                        </button>
                        <Link 
                          to={`/vendor/${vendor.id}`}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="View Shop"
                        >
                          <StoreIcon size={18} className="pointer-events-none" />
                        </Link>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(vendor); setEditType('vendors'); }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={18} className="pointer-events-none" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteVendor(vendor.id); }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} className="pointer-events-none" />
                        </button>
                      </div>
                </div>
              ))}
            </div>
            {filteredVendors.length === 0 && (
              <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                No vendors found.
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  placeholder="Search users by name or email..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${
                          u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' :
                          u.role === 'vendor' ? 'bg-amber-50 text-amber-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingItem({ ...u, type: 'user' }); }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="View Details"
                        >
                          <Search size={18} className="pointer-events-none" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(u); setEditType('users'); }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={18} className="pointer-events-none" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} className="pointer-events-none" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingItem(null)}
              className="absolute inset-0 bg-bloom-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif capitalize">{viewingItem.type} Details</h2>
                <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {viewingItem.type === 'user' && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 overflow-hidden">
                        {viewingItem.avatar ? <img src={viewingItem.avatar} className="w-full h-full object-cover" /> : viewingItem.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</h4>
                        <p className="text-xl font-bold">{viewingItem.name}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</h4>
                        <p className="text-slate-600">{viewingItem.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</h4>
                        <span className="inline-block px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-xs font-bold uppercase tracking-widest">
                          {viewingItem.role}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</h4>
                        <p className="text-slate-600">{viewingItem.location || 'Not set'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bio</h4>
                        <p className="text-slate-600 italic">{viewingItem.bio || 'No bio provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {viewingItem.type === 'vendor' && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center">
                        <StoreIcon size={48} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shop Name</h4>
                        <p className="text-xl font-bold">{viewingItem.name}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</h4>
                        <p className="text-slate-600">{viewingItem.location}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rating</h4>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star size={16} fill="currentColor" /> {viewingItem.rating}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bio</h4>
                        <p className="text-slate-600 italic">{viewingItem.bio || 'No shop bio provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {viewingItem.type === 'product' && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <img src={viewingItem.image_url} className="w-full h-64 object-cover rounded-[2rem]" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Product Name</h4>
                        <p className="text-xl font-bold">{viewingItem.name}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vendor</h4>
                        <p className="text-slate-600">{viewingItem.vendor_name}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price</h4>
                        <p className="text-2xl font-bold text-rose-500">${viewingItem.base_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</h4>
                        <p className="text-slate-600">{viewingItem.category}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</h4>
                        <p className="text-slate-600 text-sm">{viewingItem.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {viewingItem.type === 'order' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tracking Number</h4>
                        <p className="text-xl font-bold text-rose-500">{viewingItem.tracking_number}</p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</h4>
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest">
                          {viewingItem.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient</h4>
                        <p className="font-bold">{viewingItem.recipientName}</p>
                        <p className="text-slate-500">{viewingItem.recipientPhone}</p>
                        <p className="text-slate-600 text-sm">{viewingItem.address}</p>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Summary</h4>
                        <div className="space-y-2">
                          {viewingItem.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <hr className="border-slate-100" />
                          <div className="flex justify-between font-bold text-lg text-rose-500">
                            <span>Total</span>
                            <span>${viewingItem.total_price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-bloom-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-8 md:p-12 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif capitalize">Edit {editType?.slice(0, -1)}</h2>
                <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-6">
                {editType === 'users' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Name</label>
                      <input 
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        value={editingItem.name}
                        onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</label>
                      <input 
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        value={editingItem.email}
                        onChange={e => setEditingItem({...editingItem, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Role</label>
                      <select 
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        value={editingItem.role}
                        onChange={e => setEditingItem({...editingItem, role: e.target.value})}
                      >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </>
                )}

                {editType === 'vendors' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Shop Name</label>
                      <input 
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        value={editingItem.name}
                        onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Location</label>
                      <input 
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        value={editingItem.location}
                        onChange={e => setEditingItem({...editingItem, location: e.target.value})}
                      />
                    </div>
                  </>
                )}

                {editType === 'products' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Product Name</label>
                      <input 
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        value={editingItem.name}
                        onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Price</label>
                      <input 
                        type="number"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        value={editingItem.base_price}
                        onChange={e => setEditingItem({...editingItem, base_price: Number(e.target.value)})}
                      />
                    </div>
                  </>
                )}

                {editType === 'orders' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Status</label>
                      <select 
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        value={editingItem.status}
                        onChange={e => setEditingItem({...editingItem, status: e.target.value})}
                      >
                        <option>Order Received</option>
                        <option>Preparing</option>
                        <option>Ready for Delivery</option>
                        <option>Out for Delivery</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Recipient Name</label>
                      <input 
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        value={editingItem.recipientName}
                        onChange={e => setEditingItem({...editingItem, recipientName: e.target.value})}
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="btn-primary w-full py-4">Save Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
