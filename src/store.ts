
import { INITIAL_PRODUCTS, INITIAL_VENDORS, Product, Vendor, User } from './data';

class Store {
  private products: Product[] = [];
  private vendors: Vendor[] = [];
  private orders: any[] = [];
  private notifications: any[] = [];
  private user: User | null = null;

  constructor() {
    this.load();
  }

  private users: User[] = [];

  private load() {
    const savedProducts = localStorage.getItem('bloom_products');
    this.products = savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS;

    const savedVendors = localStorage.getItem('bloom_vendors');
    this.vendors = savedVendors ? JSON.parse(savedVendors) : INITIAL_VENDORS;

    const savedOrders = localStorage.getItem('bloom_orders');
    this.orders = savedOrders ? JSON.parse(savedOrders) : [];

    const savedNotifications = localStorage.getItem('bloom_notifications');
    this.notifications = savedNotifications ? JSON.parse(savedNotifications) : [];

    const savedUser = localStorage.getItem('bloom_user');
    this.user = savedUser ? JSON.parse(savedUser) : null;

    const savedUsers = localStorage.getItem('bloom_users');
    this.users = savedUsers ? JSON.parse(savedUsers) : [
      { id: 1, name: 'Admin', email: 'admin@bloomtech.com', role: 'admin', password: 'admin123' },
      { id: 2, name: 'Demo Vendor', email: 'vendor@bloomtech.com', role: 'vendor', vendor_id: 1, password: 'password123' },
      { id: 3, name: 'Demo Customer', email: 'customer@bloomtech.com', role: 'customer', password: 'password123' }
    ];
  }

  private save() {
    localStorage.setItem('bloom_products', JSON.stringify(this.products));
    localStorage.setItem('bloom_vendors', JSON.stringify(this.vendors));
    localStorage.setItem('bloom_orders', JSON.stringify(this.orders));
    localStorage.setItem('bloom_notifications', JSON.stringify(this.notifications));
    localStorage.setItem('bloom_user', JSON.stringify(this.user));
    localStorage.setItem('bloom_users', JSON.stringify(this.users));
  }

  getUsers() { return this.users; }

  registerUser(user: Omit<User, 'id'>) {
    const newUser = { ...user, id: Date.now() };
    this.users.push(newUser);
    this.save();
    return newUser;
  }

  findUser(email: string) {
    return this.users.find(u => u.email === email);
  }

  updateUser(userId: number, updates: Partial<User>) {
    const id = Number(userId);
    this.users = this.users.map(u => Number(u.id) === id ? { ...u, ...updates } : u);
    const updatedUser = this.users.find(u => Number(u.id) === id);
    
    // Sync to vendor if applicable
    if (updatedUser && updatedUser.role === 'vendor' && updatedUser.vendor_id) {
      this.updateVendor(Number(updatedUser.vendor_id), {
        name: updatedUser.name,
        avatar: updatedUser.avatar
      });
    }

    if (this.user && Number(this.user.id) === id) {
      this.user = { ...this.user, ...updates };
    }
    this.save();
    return updatedUser;
  }

  deleteUser(id: number) {
    const targetId = Number(id);
    this.users = this.users.filter(u => Number(u.id) !== targetId);
    this.save();
  }

  getProducts() { return this.products; }
  getVendors() { return this.vendors; }
  getOrders() { return this.orders; }
  getNotifications(userId: number, role: string) { 
    if (role === 'vendor') {
      // For vendors, we might want both shop notifications and personal ones
      // But usually vendor_id is what matters for orders
      return this.notifications.filter(n => n.vendor_id === userId || n.user_id === userId); 
    }
    return this.notifications.filter(n => n.user_id === userId); 
  }
  getUser() { return this.user; }

  setUser(user: User | null) {
    this.user = user;
    this.save();
  }

  addProduct(product: Omit<Product, 'id'>) {
    const newProduct = { ...product, id: Date.now() };
    this.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id: number, updates: Partial<Product>) {
    const targetId = Number(id);
    this.products = this.products.map(p => Number(p.id) === targetId ? { ...p, ...updates } : p);
    this.save();
  }

  deleteProduct(id: number) {
    const targetId = Number(id);
    this.products = this.products.filter(p => Number(p.id) !== targetId);
    this.save();
  }

  addOrder(order: any) {
    const newOrder = { 
      ...order, 
      id: this.orders.length + 1,
      tracking_number: 'BT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      status: 'Order Received',
      created_at: new Date().toISOString()
    };
    this.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  getOrderByTracking(tracking: string) {
    return this.orders.find(o => o.tracking_number === tracking);
  }

  addNotification(notification: any) {
    const newNotification = {
      ...notification,
      id: Date.now(),
      created_at: new Date().toISOString(),
      is_read: 0
    };
    this.notifications.unshift(newNotification);
    this.save();
    return newNotification;
  }

  updateOrderStatus(orderId: number, status: string) {
    this.orders = this.orders.map(o => {
      if (o.id === orderId) {
        const updatedOrder = { ...o, status };
        // If status is 'Accepted' or 'Approved', notify customer
        if (status === 'Accepted' || status === 'Approved') {
          this.addNotification({
            user_id: o.user_id,
            message: `Your order ${o.tracking_number} has been accepted!`,
            type: 'order_accepted'
          });
        }
        return updatedOrder;
      }
      return o;
    });
    this.save();
  }

  updateOrder(orderId: number, updates: any) {
    this.orders = this.orders.map(o => o.id === orderId ? { ...o, ...updates } : o);
    this.save();
  }

  deleteOrder(id: number) {
    const targetId = Number(id);
    this.orders = this.orders.filter(o => Number(o.id) !== targetId);
    this.save();
  }

  updateVendor(vendorId: number, updates: Partial<Vendor>) {
    const targetId = Number(vendorId);
    this.vendors = this.vendors.map(v => Number(v.id) === targetId ? { ...v, ...updates } : v);
    this.save();
  }

  addVendor(vendor: Vendor) {
    this.vendors.push({ ...vendor, id: Number(vendor.id) });
    this.save();
  }

  deleteVendor(id: number) {
    const targetId = Number(id);
    this.vendors = this.vendors.filter(v => Number(v.id) !== targetId);
    this.save();
  }
}

export const store = new Store();
