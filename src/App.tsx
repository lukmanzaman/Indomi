/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { getAddressFromCoords } from "./services/geminiService";
import { 
  Signal, Wifi, BatteryFull, Bell, ChevronDown, Search, 
  SlidersHorizontal, Flame, Utensils, Soup, IceCream, 
  Star, Clock, Bike, Home, ReceiptText, User, 
  ArrowLeft, MapPin, Wallet, CreditCard, CheckCircle, 
  Circle, ShoppingBag, Minus, Plus, QrCode, Banknote, Tag,
  Settings, Lock, Phone, Mail, HelpCircle, LogOut, Trash2, BellRing, Bird, Cookie,
  AlertTriangle, TrendingUp, BarChart3, ShoppingCart,
  Package, Egg, Leaf, Box, Droplet, Sparkles, X
} from "lucide-react";

type View = 'welcome' | 'login' | 'home' | 'detail' | 'checkout' | 'status' | 'owner';

interface CartItem {
  item: any;
  quantity: number;
  toppings: string[];
  spiciness: number;
  totalPrice: number;
}

interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  total: number;
  timestamp: Date;
  status: 'diterima' | 'dimasak' | 'diantar' | 'selesai';
}

export default function App() {
  const [view, setView] = useState<View>('welcome');
  const [address, setAddress] = useState('Jl. Gourmet No. 123, Kota Kuliner');
  const [mapsUrl, setMapsUrl] = useState<string | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeOrder, setActiveOrder] = useState<{
    id: string;
    startTime: number;
    status: 'diterima' | 'dimasak' | 'diantar' | 'selesai';
    isExtended: boolean;
  } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [initialHomeTab, setInitialHomeTab] = useState('home');
  const [cart, setCart] = useState<CartItem | null>(null);

  const [userRole, setUserRole] = useState<'guest' | 'customer' | 'owner'>('guest');
  const [customerName, setCustomerName] = useState('Pelanggan');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Indomie Goreng', stock: 15, unit: 'bks', max: 100, min: 10, used: 50, icon: 'Package', color: 'bg-orange-100 text-orange-600' },
    { id: 2, name: 'Indomie Kuah Soto', stock: 20, unit: 'bks', max: 100, min: 10, used: 30, icon: 'Soup', color: 'bg-yellow-100 text-yellow-600' },
    { id: 3, name: 'Telur', stock: 42, unit: 'butir', max: 100, min: 10, used: 45, icon: 'Egg', color: 'bg-amber-100 text-amber-600' },
    { id: 4, name: 'Cabe', stock: 0.5, unit: 'kg', max: 2, min: 0.2, used: 1.2, icon: 'Flame', color: 'bg-red-100 text-red-600' },
    { id: 5, name: 'Caisim', stock: 1.5, unit: 'kg', max: 3, min: 0.2, used: 1.2, icon: 'Leaf', color: 'bg-green-100 text-green-600' },
    { id: 6, name: 'Alat Makan', stock: 50, unit: 'set', max: 200, min: 20, used: 120, icon: 'Utensils', color: 'bg-slate-100 text-slate-600' },
    { id: 7, name: 'Packaging', stock: 30, unit: 'pcs', max: 200, min: 40, used: 150, icon: 'Box', color: 'bg-stone-100 text-stone-600' },
    { id: 8, name: 'Saos Tomat', stock: 2, unit: 'btl', max: 5, min: 2, used: 1, icon: 'Droplet', color: 'bg-red-50 text-red-500' },
    { id: 9, name: 'Saos Sambal', stock: 3, unit: 'btl', max: 5, min: 2, used: 2, icon: 'Droplet', color: 'bg-orange-50 text-orange-500' },
    { id: 10, name: 'Kaldu', stock: 0.5, unit: 'kg', max: 1, min: 0.1, used: 0.2, icon: 'Soup', color: 'bg-amber-50 text-amber-700' },
    { id: 11, name: 'Garam', stock: 0.8, unit: 'kg', max: 2, min: 0.1, used: 0.1, icon: 'Sparkles', color: 'bg-blue-50 text-blue-500' },
  ]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        // Initial coordinate display
        setAddress(`Mencari alamat... (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        
        // Fetch real address using Gemini + Google Maps grounding
        const result = await getAddressFromCoords(latitude, longitude);
        setAddress(result.text);
        setMapsUrl(result.url);
      }, (error) => {
        console.error("Error getting location:", error);
      });
    }
  }, []);

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setView('detail');
  };

  const handlePlaceOrder = () => {
    if (!cart) return;

    // 1. Create Order Record
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: customerName,
      items: [cart],
      total: cart.totalPrice,
      timestamp: new Date(),
      status: 'diterima'
    };
    setOrders(prev => [newOrder, ...prev]);

    // 2. Update Stats
    setActiveOrder({
      id: newOrder.id,
      startTime: Date.now(),
      status: 'diterima',
      isExtended: false
    });
    setTotalOrders(prev => prev + 1);
    setTotalRevenue(prev => prev + cart.totalPrice);

    // 3. Deduct Inventory
    const newInventory = [...inventory];
    
    // Deduct Main Item
    if (cart.item.name.includes('Goreng')) {
      const idx = newInventory.findIndex(i => i.name === 'Indomie Goreng');
      if (idx > -1) newInventory[idx].stock = Math.max(0, newInventory[idx].stock - cart.quantity);
    } else if (cart.item.name.includes('Soto')) {
      const idx = newInventory.findIndex(i => i.name === 'Indomie Kuah Soto');
      if (idx > -1) newInventory[idx].stock = Math.max(0, newInventory[idx].stock - cart.quantity);
    }

    // Deduct Toppings
    cart.toppings.forEach(topping => {
      if (topping.includes('Telur')) {
        const idx = newInventory.findIndex(i => i.name === 'Telur');
        if (idx > -1) newInventory[idx].stock = Math.max(0, newInventory[idx].stock - cart.quantity);
      }
      if (topping.includes('Caisim')) {
        const idx = newInventory.findIndex(i => i.name === 'Caisim');
        if (idx > -1) newInventory[idx].stock = Math.max(0, newInventory[idx].stock - (0.1 * cart.quantity)); // Assume 100g per portion
      }
    });

    // Deduct Spiciness (Cabe)
    if (cart.spiciness > 0) {
      const idx = newInventory.findIndex(i => i.name === 'Cabe');
      if (idx > -1) newInventory[idx].stock = Math.max(0, newInventory[idx].stock - (0.01 * cart.spiciness * cart.quantity)); // 10g per level
    }

    // Deduct Packaging & Utensils
    const pkgIdx = newInventory.findIndex(i => i.name === 'Packaging');
    if (pkgIdx > -1) newInventory[pkgIdx].stock = Math.max(0, newInventory[pkgIdx].stock - cart.quantity);
    
    const utnIdx = newInventory.findIndex(i => i.name === 'Alat Makan');
    if (utnIdx > -1) newInventory[utnIdx].stock = Math.max(0, newInventory[utnIdx].stock - cart.quantity);

    setInventory(newInventory);
    setView('status');
  };

  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'selesai') return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - activeOrder.startTime) / 1000; // seconds
      
      let newStatus = activeOrder.status;
      
      if (elapsed > 5 && activeOrder.status === 'diterima') {
        newStatus = 'dimasak';
        setNotification('Pesanan Anda sedang dimasak oleh koki!');
        setTimeout(() => setNotification(null), 5000);
      }
      
      // Timer check for completion (5 mins = 300s) as a safety fallback
      const duration = activeOrder.isExtended ? 600 : 300; 
      if (elapsed >= duration && activeOrder.status !== 'selesai') {
         newStatus = 'selesai';
         setNotification('Pesanan telah sampai! Selamat menikmati.');
         setTimeout(() => setNotification(null), 5000);
      }

      if (newStatus !== activeOrder.status) {
        setActiveOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-0 md:p-4 bg-stone-100">
      <div className="w-full max-w-[430px] bg-[#F5F2EA] h-screen md:h-[884px] md:max-h-[95vh] flex flex-col relative shadow-2xl md:rounded-[3rem] overflow-hidden border-0 md:border-8 border-white/20">
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 20 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-12 left-6 right-6 z-[100] bg-[#3D2B1F] text-white p-4 rounded-2xl shadow-2xl text-center text-sm font-bold pointer-events-none"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>
        {view === 'welcome' && (
          <WelcomeScreen onStart={() => setView('login')} />
        )}
        {view === 'login' && (
          <LoginScreen 
            onLogin={(role, name, phone, email) => {
              setUserRole(role);
              setCustomerName(name);
              setCustomerPhone(phone || '');
              setCustomerEmail(email || '');
              setView('home');
            }}
          />
        )}
        {view === 'owner' && (
          <OwnerScreen 
            inventory={inventory}
            totalRevenue={totalRevenue}
            totalOrders={totalOrders}
            orders={orders}
            onUpdateStock={(id, newStock) => {
              setInventory(inventory.map(item => 
                item.id === id ? { ...item, stock: newStock } : item
              ));
            }}
            onUpdateItem={(updatedItem) => {
              setInventory(inventory.map(item => 
                item.id === updatedItem.id ? updatedItem : item
              ));
            }}
            onLogout={() => {
              setUserRole('guest');
              setView('welcome');
            }}
            onSwitchToCustomer={() => {
              setView('home');
            }}
            onUpdateOrderStatus={(orderId, status) => {
              // Update orders history
              setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
              
              // Update active order if it matches
              if (activeOrder && activeOrder.id === orderId) {
                setActiveOrder(prev => prev ? { ...prev, status } : null);
                
                // Trigger specific notifications based on status
                if (status === 'dimasak') {
                  setNotification('Pesanan Anda sedang dimasak oleh koki!');
                } else if (status === 'diantar') {
                  setNotification('Pesanan Anda sudah selesai dan siap diantar!');
                } else if (status === 'selesai') {
                  setNotification('Pesanan telah sampai! Selamat menikmati.');
                }
                
                setTimeout(() => setNotification(null), 5000);
              }
            }}
          />
        )}
        {view === 'home' && (
          <HomeScreen 
            address={address} 
            mapsUrl={mapsUrl}
            onCheckout={() => setView('checkout')} 
            onSelectItem={handleSelectItem}
            hasActiveOrder={!!activeOrder}
            initialTab={initialHomeTab}
            onAddressChange={(newAddr) => setAddress(newAddr)}
            onViewStatus={() => setView('status')}
            cart={cart}
            userRole={userRole}
            onOpenOwnerDashboard={() => setView('owner')}
            onLogout={() => {
              setUserRole('guest');
              setView('welcome');
            }}
          />
        )}
        {view === 'detail' && (
          <DetailScreen 
            item={selectedItem} 
            onBack={() => setView('home')} 
            onAddToCart={(cartDetails) => {
              setCart(cartDetails);
              setView('checkout');
            }}
          />
        )}
        {view === 'checkout' && (
          <CheckoutScreen 
            address={address} 
            mapsUrl={mapsUrl}
            cart={cart}
            onBack={() => setView('home')} 
            onOrderPlaced={handlePlaceOrder}
          />
        )}
        {view === 'status' && (
          <StatusScreen 
            onBack={() => setView('home')} 
            onGoHome={(tab = 'home') => {
              setInitialHomeTab(tab);
              setView('home');
            }}
            activeOrder={activeOrder}
            onClearOrder={() => setActiveOrder(null)}
            cart={cart}
            onExtendOrder={() => setActiveOrder(prev => prev ? { ...prev, isExtended: true } : null)}
            customerName={customerName}
            customerPhone={customerPhone}
            customerEmail={customerEmail}
          />
        )}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-8 pt-6 pb-2">
      <span className="text-sm font-bold">9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal size={16} strokeWidth={2.5} />
        <Wifi size={16} strokeWidth={2.5} />
        <BatteryFull size={18} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#F5F2EA]">
      <StatusBar />
      <div className="flex-1 flex flex-col items-center px-8 pt-6 pb-8 overflow-y-auto overflow-x-hidden">
        <div className="relative flex flex-col items-center mb-6">
          <div className="relative flex h-80 w-80 items-center justify-center rounded-full bg-white/40 border border-[#3D2B1F]/10 shadow-sm">
            <div className="z-10 flex h-64 w-64 items-center justify-center rounded-full bg-[#3D2B1F] text-[#F5F2EA] shadow-2xl overflow-hidden">
              <img 
                src="https://raw.githubusercontent.com/Dinni-hub/logo-indomi-nite/main/WhatsApp%20Image%202026-02-12%20at%2011.24.46.jpeg" 
                alt="Indomi Nite Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <h1 className="text-4xl font-serif tracking-tight text-[#3D2B1F] mt-8 text-center leading-tight">
            Indomi Nite
          </h1>
          <p className="text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-[11px] mt-2">
            Solusi Laper Anak Kampus
          </p>
          <div className="h-0.5 w-12 bg-[#D4AF37]/40 mt-4 mb-4 rounded-full"></div>
          <p className="text-center text-lg font-medium text-[#3D2B1F]/70 leading-relaxed max-w-[280px]">
            Custom Topping & Level Pedas Sesukamu
          </p>
        </div>

        <div className="w-full mb-8">
          <div className="h-72 w-full overflow-hidden rounded-3xl border-4 border-white shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#3D2B1F]/60 via-transparent to-transparent z-10"></div>
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKO7KHjxAk_mEk_mb5yr4o07P27NqJOV1THZEZfmA5XE4vv6GYZfO0Se_rnFhcIodGm_NkJrd1MCI5yocdiltPdRj69if69wCSyDZwBHsH22O-BuKuZOUHgsSIlCdWpZOTzzToz22grwdhDth-sX5Bw7e2dY6WQ1TsPYamAVpldEw7R76cCCtTzXwta4_yNvjJAImGlxn1FHK0KVXeF6JveJfAnWdWlbvSqnw1aOYIvNH6rk9Vmt-OSCGrzOXBwmpQJkn-JBXpLro"
              alt="Gourmet noodle dish"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 left-6 z-20">
              <span className="rounded-full bg-[#F5F2EA]/95 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#3D2B1F] shadow-sm">
                Koleksi Unggulan
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 mb-12 mt-auto">
          <button 
            onClick={() => onStart()}
            className="flex w-full items-center justify-center rounded-2xl h-16 bg-[#3D2B1F] text-[#F5F2EA] text-xl font-bold shadow-xl transition-colors hover:bg-black active:scale-95"
          >
            Mulai
          </button>
        </div>

        {/* Branding Footer */}
        <div className="w-full flex flex-col items-center mb-12">
          <div className="bg-white rounded-[1.5rem] p-4 w-full max-w-[300px] border border-[#3D2B1F]/10 shadow-sm flex flex-col items-center">
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#3D2B1F]/50 mb-3">Proudly Powered By</p>
            <div className="flex items-center justify-center gap-8 w-full">
              <div className="h-14 w-14 flex items-center justify-center">
                <img 
                  src="https://raw.githubusercontent.com/Dinni-hub/logo-ai-campus-bg-putih/main/AI_Campus-removebg-preview.png" 
                  alt="AI Campus Logo" 
                  className="max-h-full max-w-full object-contain scale-[1.3]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="h-8 w-px bg-[#3D2B1F]/10"></div>
              <div className="h-14 w-14 flex items-center justify-center">
                <img 
                  src="https://raw.githubusercontent.com/Dinni-hub/logo/main/Logo%20MBD.png" 
                  alt="MBD Logo" 
                  className="max-h-full max-w-full object-contain scale-[1.7]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
          <p className="mt-2 text-[10px] font-medium text-[#3D2B1F]/60 tracking-wide text-center">
            Karya Mahasiswa Manajemen Bisnis Digital ISTTS (AI Campus)
          </p>
        </div>
      </div>
      <div className="mb-3 flex w-full justify-center">
        <div className="h-1.5 w-36 rounded-full bg-[#3D2B1F]/20"></div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (role: 'customer' | 'owner', name: string, phone: string, email: string) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name || !phone || !email) {
      setError('Mohon lengkapi semua data.');
      return;
    }

    if (email.toLowerCase() === 'indominite@gmail.com') {
      onLogin('owner', name, phone, email);
    } else {
      // Simulate sending data to owner
      console.log(`Sending customer data to owner: ${name}, ${phone}, ${email}`);
      onLogin('customer', name, phone, email);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F2EA] px-8 py-10">
      <StatusBar />
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-[#3D2B1F] mb-2">Selamat Datang</h1>
          <p className="text-[#3D2B1F]/60">Silakan isi data diri Anda untuk melanjutkan.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2 mb-1 block">Nama Lengkap</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 bg-white rounded-2xl px-6 text-sm font-medium border border-[#3D2B1F]/10 focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/20"
              placeholder="Masukkan nama Anda"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2 mb-1 block">Nomor WhatsApp</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-14 bg-white rounded-2xl px-6 text-sm font-medium border border-[#3D2B1F]/10 focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/20"
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2 mb-1 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 bg-white rounded-2xl px-6 text-sm font-medium border border-[#3D2B1F]/10 focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/20"
              placeholder="nama@email.com"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4 font-bold">{error}</p>
        )}

        <button 
          onClick={handleSubmit}
          className="w-full h-16 bg-[#3D2B1F] text-[#F5F2EA] rounded-2xl font-bold text-sm uppercase tracking-widest mt-8 shadow-xl hover:bg-black transition-colors"
        >
          Masuk Aplikasi
        </button>
      </div>
    </div>
  );
}

function OwnerScreen({ inventory, totalRevenue, totalOrders, orders, onUpdateStock, onUpdateItem, onLogout, onSwitchToCustomer, onUpdateOrderStatus }: { inventory: any[], totalRevenue: number, totalOrders: number, orders: Order[], onUpdateStock: (id: number, stock: number) => void, onUpdateItem: (item: any) => void, onLogout: () => void, onSwitchToCustomer: () => void, onUpdateOrderStatus: (orderId: string, status: 'diterima' | 'dimasak' | 'diantar' | 'selesai') => void }) {
  const [activeTab, setActiveTab] = useState<'beranda' | 'laporan' | 'stok' | 'pengaturan'>('beranda');
  const [viewDetail, setViewDetail] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Icon mapping
  const IconMap: any = {
    Package, Soup, Egg, Flame, Leaf, Utensils, Box, Droplet, Sparkles
  };

  // Calculate daily sales from orders
  const dailyData = useMemo(() => {
    const hours = ['10:30', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const data = hours.map(h => ({ time: h, sales: 0 }));
    
    orders.forEach(order => {
      const h = order.timestamp.getHours();
      const m = order.timestamp.getMinutes();
      let timeStr = '';
      
      if (h === 10 && m >= 30) timeStr = '10:30';
      else if (h >= 11 && h <= 17) timeStr = `${h.toString().padStart(2, '0')}:00`;
      
      const index = data.findIndex(d => d.time === timeStr);
      if (index !== -1) {
        data[index].sales += 1; // Count orders
      }
    });
    return data;
  }, [orders]);

  const handleDownloadReport = () => {
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    let csvContent = "Laporan Penjualan Indomi Nite\n";
    csvContent += `Tanggal: ${date}\n\n`;
    csvContent += "ID Pesanan,Pelanggan,Menu,Total,Waktu,Status\n";
    
    orders.forEach(order => {
      const items = order.items.map(i => i.item.name).join('; ');
      const time = order.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      csvContent += `${order.id},${order.customerName},${items},${order.total},${time},${order.status}\n`;
    });
    
    csvContent += `\nTotal Pendapatan: Rp ${totalRevenue.toLocaleString()}\n`;
    csvContent += `Total Pesanan: ${totalOrders}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_IndomiNite_${date.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = months.map((m, i) => ({ name: m, sales: 0, index: i }));
    
    orders.forEach(order => {
      const monthIdx = order.timestamp.getMonth();
      data[monthIdx].sales += 1;
    });
    
    // Return last 6 months ending with current
    const end = currentMonth + 1;
    const start = Math.max(0, end - 6);
    return data.slice(start, end);
  }, [orders]);

  // Calculate total items sold
  const totalItemsSold = totalOrders; 

  const lowStockItems = inventory.filter(item => item.stock <= (item.min || 0));

  if (viewDetail) {
    return (
      <div className="flex flex-col h-full bg-[#F5F2EA] relative">
        <StatusBar />
        
        {/* Header */}
        <div className="px-6 pt-4 pb-4 flex items-center justify-between">
          <button 
            onClick={() => setViewDetail(false)}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#3D2B1F]/5 text-[#3D2B1F]"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold text-[#3D2B1F]">Detail Perhitungan Bahan</h2>
          <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#3D2B1F]/5 text-[#3D2B1F]">
            <div className="flex gap-1">
              <div className="h-1 w-1 bg-[#3D2B1F] rounded-full"></div>
              <div className="h-1 w-1 bg-[#3D2B1F] rounded-full"></div>
              <div className="h-1 w-1 bg-[#3D2B1F] rounded-full"></div>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#3D2B1F]">Ringkasan Penggunaan</h3>
            <p className="text-xs text-[#3D2B1F]/40">Update terakhir: Hari ini, 18:30</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-[#3D2B1F]/5 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-[#3D2B1F]/60">
                <Trash2 size={14} />
                <span className="text-xs font-bold">Total Terpakai</span>
              </div>
              <p className="text-2xl font-bold text-[#3D2B1F] leading-none mb-1">{totalItemsSold}</p>
              <p className="text-lg font-bold text-[#3D2B1F] mb-2">Porsi</p>
              <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                <TrendingUp size={10} /> Baru Mulai
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#3D2B1F]/5 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-[#3D2B1F]/60">
                <AlertTriangle size={14} />
                <span className="text-xs font-bold">Total Pendapatan</span>
              </div>
              <p className="text-2xl font-bold text-[#3D2B1F] leading-none mb-1">{(totalRevenue / 1000).toFixed(0)}k</p>
              <p className="text-lg font-bold text-[#3D2B1F] mb-2">Rupiah</p>
              <p className="text-[10px] font-bold text-[#3D2B1F]/40 flex items-center gap-1">
                -
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#3D2B1F]">Daftar Bahan Baku</h3>
            <button className="text-xs font-bold text-[#D4AF37]">Lihat Semua</button>
          </div>

          <div className="space-y-4 mb-8">
            {inventory.map((item) => {
              const IconComponent = IconMap[item.icon] || Package;
              const isLowStock = item.stock <= (item.min || 0);
              return (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-[#3D2B1F]/5 shadow-sm flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center ${item.color}`}>
                    <IconComponent size={32} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#3D2B1F] text-sm">{item.name}</p>
                    <p className="text-xs text-[#3D2B1F]/40 mt-1">Dibutuhkan: {item.max} {item.unit} | Stok: {item.stock} {item.unit}</p>
                    <div className="h-1.5 w-full bg-[#3D2B1F]/5 rounded-full mt-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isLowStock ? 'bg-red-500' : item.stock < item.max * 0.5 ? 'bg-orange-400' : 'bg-green-500'}`}
                        style={{ width: `${(item.stock / item.max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    {isLowStock ? (
                      <>
                        <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-1">
                          <AlertTriangle size={14} fill="currentColor" />
                        </div>
                        <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider">KRITIS</span>
                      </>
                    ) : item.stock < item.max * 0.5 ? (
                      <>
                        <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-1">
                          <AlertTriangle size={14} fill="currentColor" />
                        </div>
                        <span className="text-[8px] font-bold text-orange-500 uppercase tracking-wider">MENIPIS</span>
                      </>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                        <CheckCircle size={14} fill="currentColor" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F2EA] relative">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between bg-white shadow-sm z-10 relative">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="text-[#3D2B1F] p-2 -ml-2 rounded-full hover:bg-[#3D2B1F]/5"
        >
          <div className="space-y-1">
            <div className="w-5 h-0.5 bg-[#3D2B1F]"></div>
            <div className="w-3 h-0.5 bg-[#3D2B1F]"></div>
            <div className="w-5 h-0.5 bg-[#3D2B1F]"></div>
          </div>
        </button>
        <h1 className="text-lg font-bold text-[#3D2B1F]">Indomi Nite</h1>
        <button 
          onClick={() => setActiveTab('pengaturan')}
          className="h-9 w-9 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-colors"
        >
          <User size={18} />
        </button>
      </div>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-64 bg-[#F5F2EA] z-50 shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-serif font-bold text-[#3D2B1F]">Menu</h2>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#3D2B1F] shadow-sm"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-2 flex-1">
                {[
                  { id: 'beranda', label: 'Beranda', icon: Home },
                  { id: 'laporan', label: 'Laporan', icon: BarChart3 },
                  { id: 'stok', label: 'Stok', icon: Package },
                  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
                ].map((menu) => (
                  <button 
                    key={menu.id}
                    onClick={() => {
                      setActiveTab(menu.id as any);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${activeTab === menu.id ? 'bg-[#3D2B1F] text-white shadow-lg' : 'text-[#3D2B1F] hover:bg-[#3D2B1F]/5'}`}
                  >
                    <menu.icon size={20} />
                    <span className="font-bold text-sm">{menu.label}</span>
                  </button>
                ))}
                
                {/* Switch to Customer Mode Button */}
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSwitchToCustomer();
                  }}
                  className="w-full p-4 rounded-xl flex items-center gap-4 transition-all text-[#3D2B1F] hover:bg-[#3D2B1F]/5 mt-4 border-t border-[#3D2B1F]/10"
                >
                  <Utensils size={20} />
                  <span className="font-bold text-sm">Mode Pelanggan</span>
                </button>
              </div>

              <div className="pt-6 border-t border-[#3D2B1F]/10">
                <button 
                  onClick={onLogout}
                  className="w-full p-4 rounded-xl bg-red-50 text-red-600 font-bold flex items-center gap-4 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="text-sm">Keluar</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-6 pb-24 pt-6">
        {activeTab === 'beranda' && (
          <>
            {/* Alert Banner */}
            {lowStockItems.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                    <AlertTriangle size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#3D2B1F]">Stok Menipis: {lowStockItems.length} Item</p>
                    <p className="text-[10px] text-[#3D2B1F]/60">
                      {lowStockItems.slice(0, 2).map(i => i.name).join(', ')} {lowStockItems.length > 2 ? '...' : ''} hampir habis.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('stok')}
                  className="bg-[#A05E2B] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm"
                >
                  Cek
                </button>
              </div>
            )}

            {/* Sales Summary Card */}
            <div className="bg-[#FDFCF8] rounded-3xl p-8 mb-8 text-center relative overflow-hidden border border-[#3D2B1F]/5 shadow-sm">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#3D2B1F 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
              <p className="text-4xl font-serif font-bold text-[#A05E2B] mb-2 relative z-10">{totalItemsSold}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A05E2B]/60 relative z-10">Porsi Terjual</p>
            </div>

            {/* Active Orders Section */}
            {orders.filter(o => o.status !== 'selesai').length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#3D2B1F]">Pesanan Aktif</h3>
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">
                    {orders.filter(o => o.status !== 'selesai').length} Pesanan
                  </span>
                </div>
                <div className="space-y-3">
                  {orders.filter(o => o.status !== 'selesai').map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-2xl border border-[#3D2B1F]/5 shadow-sm flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#3D2B1F] text-sm">{order.customerName}</p>
                          <p className="text-[10px] text-[#3D2B1F]/50">
                            {order.items[0].item.name} • {order.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                          order.status === 'diterima' ? 'bg-blue-50 text-blue-600' :
                          order.status === 'dimasak' ? 'bg-orange-50 text-orange-600' :
                          'bg-purple-50 text-purple-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        {order.status === 'diterima' && (
                          <button 
                            onClick={() => onUpdateOrderStatus(order.id, 'dimasak')}
                            className="flex-1 bg-[#D4AF37] text-white text-[10px] font-bold py-2 rounded-xl shadow-sm hover:bg-[#B5952F] transition-all"
                          >
                            Mulai Masak
                          </button>
                        )}
                        {order.status === 'dimasak' && (
                          <button 
                            onClick={() => onUpdateOrderStatus(order.id, 'diantar')}
                            className="flex-1 bg-orange-500 text-white text-[10px] font-bold py-2 rounded-xl shadow-sm hover:bg-orange-600 transition-all"
                          >
                            Siap Diantar
                          </button>
                        )}
                        {(order.status === 'diantar' || order.status === 'dimasak' || order.status === 'diterima') && (
                          <button 
                            onClick={() => onUpdateOrderStatus(order.id, 'selesai')}
                            className="flex-1 bg-[#3D2B1F] text-white text-[10px] font-bold py-2 rounded-xl shadow-lg hover:bg-black transition-all"
                          >
                            Selesaikan
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Summary */}
            <div className="bg-white rounded-2xl p-5 mb-8 shadow-sm border border-[#3D2B1F]/5">
              <h3 className="font-bold text-[#3D2B1F] text-sm mb-4">Laporan Hari Ini</h3>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="sales" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock List Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#3D2B1F]">Stok Bahan Baku</h3>
              <button 
                onClick={() => setViewDetail(true)}
                className="text-xs font-bold text-[#A05E2B]"
              >
                Lihat Detail
              </button>
            </div>

            {/* Stock List Preview */}
            <div className="space-y-4">
              {inventory.slice(0, 3).map((item) => {
                const IconComponent = IconMap[item.icon] || Package;
                const isLowStock = item.stock <= (item.min || 0);
                return (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-[#3D2B1F]/5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.color}`}>
                           <IconComponent size={24} />
                        </div>
                        <p className="font-bold text-[#3D2B1F]">{item.name}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isLowStock ? 'bg-red-50 text-red-500' : 'bg-[#F5F2EA] text-[#3D2B1F]/60'}`}>
                        Sisa {item.stock} {item.unit}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#F5F2EA] rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full ${isLowStock ? 'bg-red-500' : item.stock < item.max * 0.5 ? 'bg-orange-400' : 'bg-green-500'}`}
                        style={{ width: `${(item.stock / item.max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'laporan' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#3D2B1F]">Laporan Penjualan</h2>
              <button 
                onClick={handleDownloadReport}
                className="flex items-center gap-2 bg-[#3D2B1F] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-black transition-all active:scale-95"
              >
                <ReceiptText size={14} /> Download CSV
              </button>
            </div>
            
            {/* Report Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#3D2B1F]/5">
                <p className="text-[10px] font-bold text-[#3D2B1F]/40 uppercase tracking-widest mb-1">Total Omzet</p>
                <p className="text-xl font-bold text-[#3D2B1F]">Rp {totalRevenue.toLocaleString()}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-600">
                  <TrendingUp size={10} /> +12% vs Kemarin
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#3D2B1F]/5">
                <p className="text-[10px] font-bold text-[#3D2B1F]/40 uppercase tracking-widest mb-1">Total Pesanan</p>
                <p className="text-xl font-bold text-[#3D2B1F]">{totalOrders} Pesanan</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#3D2B1F]/40">
                  Rata-rata Rp {(totalOrders > 0 ? totalRevenue / totalOrders : 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#3D2B1F]/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#3D2B1F]">Grafik Penjualan (10:30 - 17:00)</h3>
                <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-full">Real-time</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorSales2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="sales" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorSales2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#3D2B1F]/5">
              <h3 className="font-bold text-[#3D2B1F] mb-4">Riwayat Pesanan Terbaru</h3>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-center text-sm text-[#3D2B1F]/40 py-4">Belum ada pesanan hari ini.</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b border-[#3D2B1F]/5 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-[#3D2B1F] text-sm">{order.customerName}</p>
                        <p className="text-[10px] text-[#3D2B1F]/50">
                          {order.items[0].item.name} + {order.items[0].toppings.length} topping • {order.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#3D2B1F] text-sm">Rp {order.total.toLocaleString()}</p>
                        {order.status === 'selesai' ? (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Selesai</span>
                        ) : (
                          <button 
                            onClick={() => onUpdateOrderStatus(order.id, 'selesai')}
                            className="text-[10px] font-bold text-white bg-[#3D2B1F] px-2 py-1 rounded-lg hover:bg-black transition-colors mt-1"
                          >
                            Selesaikan
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#3D2B1F]/5">
              <h3 className="font-bold text-[#3D2B1F] mb-4">Penjualan Bulanan</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} cursor={{fill: '#F5F2EA'}} />
                    <Bar dataKey="sales" fill="#3D2B1F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stok' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[#3D2B1F]">Manajemen Stok</h2>
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isEditMode ? 'bg-[#D4AF37] text-white' : 'text-[#D4AF37] bg-[#D4AF37]/10'}`}
              >
                <Settings size={12} /> {isEditMode ? 'Selesai Edit' : 'Edit Bahan'}
              </button>
            </div>
            {inventory.map((item) => {
              const IconComponent = IconMap[item.icon] || Package;
              const isLowStock = item.stock <= (item.min || 0);
              return (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-[#3D2B1F]/5 shadow-sm flex items-center justify-between relative group">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.color}`}>
                         <IconComponent size={16} />
                      </div>
                      <p className="font-bold text-[#3D2B1F]">{item.name}</p>
                    </div>
                    <p className={`text-xs font-bold ${item.stock === 0 ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-green-600'}`}>
                      {item.stock === 0 ? 'Habis' : isLowStock ? 'Stok Menipis' : 'Tersedia'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isEditMode ? (
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="h-8 w-8 rounded-full bg-[#D4AF37] text-white flex items-center justify-center hover:bg-[#B5952F] transition-colors shadow-sm"
                      >
                        <Settings size={16} />
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                          className="h-8 w-8 rounded-full bg-[#3D2B1F]/5 flex items-center justify-center text-[#3D2B1F] hover:bg-[#3D2B1F]/10"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="min-w-[3rem] px-2 text-center font-bold text-[#3D2B1F] text-sm">{item.stock} {item.unit}</span>
                        <button 
                          onClick={() => onUpdateStock(item.id, item.stock + 1)}
                          className="h-8 w-8 rounded-full bg-[#3D2B1F] text-white flex items-center justify-center hover:bg-black"
                        >
                          <Plus size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Edit Modal */}
            <AnimatePresence>
              {editingItem && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-[#3D2B1F]">Edit Bahan</h3>
                      <button 
                        onClick={() => setEditingItem(null)}
                        className="h-8 w-8 rounded-full bg-[#F5F2EA] flex items-center justify-center text-[#3D2B1F]"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2 mb-1 block">Nama Bahan</label>
                        <input 
                          type="text" 
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                          className="w-full h-12 bg-[#F5F2EA] rounded-xl px-4 text-sm font-bold text-[#3D2B1F] border-none focus:ring-2 focus:ring-[#3D2B1F]/10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2 mb-1 block">Satuan</label>
                          <input 
                            type="text" 
                            value={editingItem.unit}
                            onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                            className="w-full h-12 bg-[#F5F2EA] rounded-xl px-4 text-sm font-bold text-[#3D2B1F] border-none focus:ring-2 focus:ring-[#3D2B1F]/10"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2 mb-1 block">Stok Saat Ini</label>
                          <input 
                            type="number" 
                            value={editingItem.stock}
                            onChange={(e) => setEditingItem({...editingItem, stock: parseFloat(e.target.value)})}
                            className="w-full h-12 bg-[#F5F2EA] rounded-xl px-4 text-sm font-bold text-[#3D2B1F] border-none focus:ring-2 focus:ring-[#3D2B1F]/10"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2 mb-1 block">Min Stok</label>
                          <input 
                            type="number" 
                            value={editingItem.min}
                            onChange={(e) => setEditingItem({...editingItem, min: parseFloat(e.target.value)})}
                            className="w-full h-12 bg-[#F5F2EA] rounded-xl px-4 text-sm font-bold text-[#3D2B1F] border-none focus:ring-2 focus:ring-[#3D2B1F]/10"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2 mb-1 block">Max Stok</label>
                          <input 
                            type="number" 
                            value={editingItem.max}
                            onChange={(e) => setEditingItem({...editingItem, max: parseFloat(e.target.value)})}
                            className="w-full h-12 bg-[#F5F2EA] rounded-xl px-4 text-sm font-bold text-[#3D2B1F] border-none focus:ring-2 focus:ring-[#3D2B1F]/10"
                          />
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          onUpdateItem(editingItem);
                          setEditingItem(null);
                        }}
                        className="w-full h-14 bg-[#3D2B1F] text-white rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-transform"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'pengaturan' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#3D2B1F] mb-4">Pengaturan</h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#3D2B1F]/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-[#D4AF37] flex items-center justify-center text-white text-2xl font-bold">
                  O
                </div>
                <div>
                  <h3 className="font-bold text-[#3D2B1F]">Owner Account</h3>
                  <p className="text-xs text-[#3D2B1F]/60">indominite@gmail.com</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                    <CheckCircle size={10} />
                    <span className="text-[9px] font-bold">Terhubung & Sinkronisasi Otomatis</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                 <button 
                  onClick={onSwitchToCustomer}
                  className="w-full py-4 rounded-xl bg-[#3D2B1F]/5 text-[#3D2B1F] font-bold flex items-center justify-center gap-2 hover:bg-[#3D2B1F]/10 transition-colors"
                >
                  <Utensils size={20} /> Mode Pelanggan
                </button>
              </div>

              <button 
                onClick={onLogout}
                className="w-full py-4 rounded-xl bg-red-50 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
              >
                <LogOut size={20} /> Keluar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bg-white h-20 border-t border-[#3D2B1F]/5 flex items-center justify-around px-6">
        <button 
          onClick={() => setActiveTab('beranda')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'beranda' ? 'text-[#3D2B1F]' : 'text-[#3D2B1F]/30'}`}
        >
          <Home size={20} />
          <span className="text-[9px] font-bold">Beranda</span>
        </button>
        <button 
          onClick={() => setActiveTab('laporan')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'laporan' ? 'text-[#3D2B1F]' : 'text-[#3D2B1F]/30'}`}
        >
          <BarChart3 size={20} />
          <span className="text-[9px] font-bold">Laporan</span>
        </button>
        <button 
          onClick={() => setActiveTab('stok')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'stok' ? 'text-[#3D2B1F]' : 'text-[#3D2B1F]/30'}`}
        >
          <ReceiptText size={20} />
          <span className="text-[9px] font-bold">Stok</span>
        </button>
        <button 
          onClick={() => setActiveTab('pengaturan')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'pengaturan' ? 'text-[#3D2B1F]' : 'text-[#3D2B1F]/30'}`}
        >
          <Settings size={20} />
          <span className="text-[9px] font-bold">Pengaturan</span>
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ address, mapsUrl, onCheckout, onSelectItem, hasActiveOrder, initialTab = 'home', onAddressChange, onViewStatus, cart, onLogout, userRole, onOpenOwnerDashboard }: { address: string, mapsUrl?: string, onCheckout: () => void, onSelectItem: (item: any) => void, hasActiveOrder: boolean, initialTab?: string, onAddressChange: (addr: string) => void, onViewStatus?: () => void, cart?: any, onLogout?: () => void, userRole?: 'guest' | 'customer' | 'owner', onOpenOwnerDashboard?: () => void }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeCategory, setActiveCategory] = useState('Pedas');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [profileSubView, setProfileSubView] = useState<string | null>(null);

  const itemType = useMemo(() => {
    if (!cart?.item) return 'Indomie';
    if (cart.item.categories.includes('Snack')) return 'Snack';
    return 'Indomie';
  }, [cart]);

  // Profile States
  const [userProfile, setUserProfile] = useState({
    name: 'Penggemar Kuliner',
    email: 'gourmet@indominite.com',
    phone: '+62 812 3456 7890'
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('qris');
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Rumah', detail: address, isMain: true }
  ]);
  const [notifSettings, setNotifSettings] = useState({
    promo: true,
    status: true,
    newsletter: false
  });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({ label: '', detail: '' });

  // Drag to scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    // Sync main address when prop changes
    setAddresses(prev => prev.map(addr => 
      addr.isMain ? { ...addr, detail: address } : addr
    ));
  }, [address]);

  useEffect(() => {
    setActiveTab(initialTab);
    setProfileSubView(null); // Reset subview when tab changes
  }, [initialTab]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePromoClick = () => {
    setActiveTab('promo');
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const menuItems = [
    { 
      name: 'Indomie Goreng Spesial', 
      type: 'Spesial • Piring', 
      price: 'Rp 12.000', 
      priceNum: 12000,
      rating: '4.9', 
      time: '5-10 min', 
      delivery: 'Gratis Ongkir', 
      img: 'https://raw.githubusercontent.com/Dinni-hub/indomi-spesial-goreng/main/Ganti_mangkuk_dengan_piring_e4560afe3d%20(1).jpeg', 
      categories: ['Spesial'],
      description: 'Lebih lengkap, lebih nikmat, lebih memuaskan.'
    },
    { 
      name: 'Indomie Kuah Soto Spesial', 
      type: 'Spesial • Alat Makan', 
      price: 'Rp 12.000', 
      priceNum: 12000,
      rating: '4.9', 
      time: '5-10 min', 
      delivery: 'Gratis Ongkir', 
      img: 'https://raw.githubusercontent.com/Dinni-hub/indomi-spesial-goreng/main/Hapus_ikon_hp_nya_ganti_dengan_alat_makan_500ca4d878.jpeg', 
      categories: ['Spesial'],
      description: 'Kuah lebih kaya, topping lebih lengkap.'
    },
    { 
      name: 'Indomie Goreng Pedas', 
      type: 'Pedas • Level 1-5', 
      price: 'Rp 7.000', 
      priceNum: 7000,
      rating: '4.9', 
      time: '5-10 min', 
      delivery: 'Gratis Ongkir', 
      img: 'https://raw.githubusercontent.com/Dinni-hub/indomi-spesial-goreng/main/Hapus_teks_mangkuk_mi_f790bfc56a.jpeg', 
      categories: ['Pedas'],
      description: 'Gurih, pedas, dan bikin ketagihan di setiap suapan.'
    },
    { 
      name: 'Indomie Kuah Soto Pedas', 
      type: 'Pedas • Cabe Iris', 
      price: 'Rp 7.000', 
      priceNum: 7000,
      rating: '4.9', 
      time: '5-10 min', 
      delivery: 'Gratis Ongkir', 
      img: 'https://raw.githubusercontent.com/Dinni-hub/indomi-spesial-goreng/main/Sambal_selain_cabe_iris_hapus_49076cdee3.jpeg', 
      categories: ['Pedas'],
      description: 'Hangat, pedas, dan penuh rasa di setiap sendokannya.'
    },
    { 
      name: 'Indomie Goreng Klasik', 
      type: 'Klasik • Polos', 
      price: 'Rp 6.000', 
      priceNum: 6000,
      rating: '4.9', 
      time: '5-10 min', 
      delivery: 'Gratis Ongkir', 
      img: 'https://raw.githubusercontent.com/Dinni-hub/indomi-spesial-goreng/main/Tolong_buatkan_indomi_goreng_polos_dengan_taburan__05ef31bed7.jpeg', 
      categories: ['Klasik'],
      description: 'Original, gurih, dan tak pernah gagal.'
    },
    { 
      name: 'Indomie Kuah Soto Klasik', 
      type: 'Klasik • Gurih', 
      price: 'Rp 6.000', 
      priceNum: 6000,
      rating: '4.9', 
      time: '5-10 min', 
      delivery: 'Gratis Ongkir', 
      img: 'https://raw.githubusercontent.com/Dinni-hub/indomi-klasik/main/Gemini_Generated_Image_pb3x59pb3x59pb3x.png', 
      categories: ['Klasik'],
      description: 'Hangat, gurih, dan penuh kenyamanan.'
    },
    { 
      name: 'Telur Gulung', 
      type: 'Snack • Gurih', 
      price: 'Rp 1.000 / tusuk', 
      priceNum: 1000,
      rating: '4.9', 
      time: '5-10 min', 
      delivery: 'Gratis Ongkir', 
      img: 'https://raw.githubusercontent.com/Dinni-hub/telur-gulung-2/main/Telur%20Gulung%20Jajanan%20Lezat%20Gampang%20Dibuat%20-%20Resep%20_%20ResepKoki.jpg', 
      categories: ['Snack', 'Spesial Buat Kamu'],
      description: 'Lembut, gurih, dan bikin nagih.'
    },
  ];

  return (
    <motion.div 
      key="home"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#F5F2EA]"
    >
      <StatusBar />

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 left-6 right-6 z-[100] bg-[#3D2B1F] text-white p-4 rounded-2xl shadow-2xl text-center text-sm font-bold"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      
      {activeTab === 'home' && (
        <div className="flex-1 overflow-y-auto pb-40">
          {/* Header */}
          <div className="px-6 pt-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#3D2B1F]/50">{getGreeting()}</p>
              <h2 className="text-2xl font-serif text-[#3D2B1F]">Indomi Nite</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#3D2B1F]/5">
                <Bell size={20} />
              </button>
              <div 
                className="h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer"
                onClick={() => setActiveTab('profile')}
              >
                <img src="https://picsum.photos/seed/user/100/100" alt="Profile" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="px-6 mt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#3D2B1F] flex items-center justify-center text-white shadow-lg">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-[#3D2B1F]">Kirim ke Rumah</p>
                  <ChevronDown size={14} className="text-[#3D2B1F]/50" />
                </div>
                <p className="text-xs text-[#3D2B1F]/60 truncate max-w-[200px]">{address}</p>
                {mapsUrl && (
                  <a 
                    href={mapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#D4AF37] font-bold flex items-center gap-1 hover:underline mt-1"
                  >
                    <MapPin size={10} /> Lihat di Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar (Static in Home) */}
          <div className="px-6 mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40" size={20} />
              <input 
                type="text" 
                placeholder="Cari Indomie mewah..." 
                className="w-full h-14 bg-white rounded-2xl pl-12 pr-14 text-sm font-medium border border-[#3D2B1F]/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/10"
                onClick={() => setActiveTab('search')}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center border-l border-[#3D2B1F]/10">
                <SlidersHorizontal size={18} className="text-[#3D2B1F]/60" />
              </button>
            </div>
          </div>

          {/* Special Tonight */}
          <div className="mt-6 w-full overflow-hidden">
            <div className="px-6 flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-[#3D2B1F]">Spesial Buat Kamu</h3>
              <button className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">Lihat Semua</button>
            </div>
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex gap-6 overflow-x-auto px-6 pb-4 no-scrollbar snap-x snap-mandatory ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  if (isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  onSelectItem(menuItems[0]);
                }}
                className="min-w-[280px] w-[280px] h-[240px] rounded-[2.5rem] overflow-hidden relative shadow-xl border-4 border-white snap-center shrink-0"
              >
                  <img 
                    src={menuItems[0].img} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    alt={menuItems[0].name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <span className="bg-[#3D2B1F] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 inline-block">Pilihan Koki</span>
                    <h4 className="text-2xl font-bold">{menuItems[0].name}</h4>
                  </div>
                </motion.div>
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    if (isDragging) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    onSelectItem(menuItems[1]);
                  }}
                  className="min-w-[280px] w-[280px] h-[240px] rounded-[2.5rem] overflow-hidden relative shadow-xl border-4 border-white snap-center shrink-0"
                >
                  <img 
                    src={menuItems[1].img} 
                    className="absolute inset-0 w-full h-full object-cover object-center" 
                    alt={menuItems[1].name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h4 className="text-2xl font-bold">{menuItems[1].name}</h4>
                  </div>
                </motion.div>
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    if (isDragging) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    onSelectItem(menuItems[6]);
                  }}
                  className="min-w-[280px] w-[280px] h-[240px] rounded-[2.5rem] overflow-hidden relative shadow-xl border-4 border-white snap-center shrink-0"
                >
                  <img 
                    src={menuItems[6].img} 
                    className="absolute inset-0 w-full h-full object-cover object-center" 
                    alt={menuItems[6].name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <span className="bg-[#D4AF37] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 inline-block text-[#3D2B1F]">Snack Favorit</span>
                    <h4 className="text-2xl font-bold">{menuItems[6].name}</h4>
                  </div>
                </motion.div>
              </div>
            </div>

          {/* Categories */}
          <div className="mt-6">
            <div className="px-6 mb-3">
              <h3 className="text-xl font-bold text-[#3D2B1F]">Kategori</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar">
              {[
                { name: 'Pedas', icon: <Flame size={20} /> },
                { name: 'Klasik', icon: <Utensils size={20} /> },
                { name: 'Spesial', icon: <Soup size={20} /> },
                { name: 'Snack', icon: <Cookie size={20} /> },
              ].map((cat, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveCategory(cat.name)}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-md transition-all ${activeCategory === cat.name ? 'bg-[#3D2B1F] text-white' : 'bg-white text-[#3D2B1F]'}`}>
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-bold text-[#3D2B1F]">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu Section */}
          <div className="mt-6 px-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#3D2B1F]">Menu {activeCategory}</h3>
              <button className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">Lihat Semua</button>
            </div>
            <div className="space-y-6">
              {menuItems.filter(item => item.categories.includes(activeCategory)).map((rest, i) => (
                <div 
                  key={i} 
                  onClick={() => onSelectItem(rest)}
                  className="bg-white/50 p-4 rounded-[2rem] flex gap-4 border border-white shadow-sm cursor-pointer"
                >
                  <div className="h-24 w-24 rounded-3xl overflow-hidden shrink-0">
                    <img src={rest.img} className="w-full h-full object-cover object-center" alt={rest.name} referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#3D2B1F]">{rest.name}</h4>
                      <div className="bg-[#3D2B1F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> {rest.rating}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#3D2B1F]/60 mt-1">{rest.type} • {rest.price}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#3D2B1F]/70">
                        <Clock size={12} className="text-[#D4AF37]" /> {rest.time}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#3D2B1F]/70">
                        <Bike size={12} className="text-[#D4AF37]" /> {rest.delivery}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {menuItems.filter(item => item.categories.includes(activeCategory)).length === 0 && (
                <p className="text-center text-[#3D2B1F]/40 py-10">Belum ada menu untuk kategori ini.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="px-6 pt-4 flex-1 flex flex-col overflow-y-auto pb-40">
          <h2 className="text-3xl font-serif text-[#3D2B1F] mb-6">Cari</h2>
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Indomie mewah..." 
              className="w-full h-14 bg-white rounded-2xl pl-12 pr-14 text-sm font-medium border border-[#3D2B1F]/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/10"
            />
          </div>
          
          {searchQuery ? (
            <div className="space-y-6">
              {menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase())).map((rest, i) => (
                <div 
                  key={i} 
                  onClick={() => onSelectItem(rest)}
                  className="bg-white/50 p-4 rounded-[2rem] flex gap-4 border border-white shadow-sm cursor-pointer"
                >
                  <div className="h-24 w-24 rounded-3xl overflow-hidden shrink-0">
                    <img src={rest.img} className="w-full h-full object-cover object-center" alt={rest.name} referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#3D2B1F]">{rest.name}</h4>
                      <div className="bg-[#3D2B1F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> {rest.rating}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#3D2B1F]/60 mt-1">{rest.type} • {rest.price}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#3D2B1F]/70">
                        <Clock size={12} className="text-[#D4AF37]" /> {rest.time}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#3D2B1F]/70">
                        <Bike size={12} className="text-[#D4AF37]" /> {rest.delivery}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-[#3D2B1F]/40 py-10">Tidak ada menu yang cocok dengan pencarian Anda.</p>
              )}
            </div>
          ) : (
            <p className="text-center text-[#3D2B1F]/40 mt-20">Ketik untuk mencari Indomie favorit Anda...</p>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="px-6 pt-4 flex-1 flex flex-col overflow-y-auto pb-40">
          <h2 className="text-3xl font-serif text-[#3D2B1F] mb-6">Pesanan Saya</h2>
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
            <div className="h-24 w-24 rounded-full bg-[#3D2B1F]/5 flex items-center justify-center text-[#3D2B1F]/20 mb-4">
              <ReceiptText size={48} />
            </div>
            {hasActiveOrder ? (
              <>
                <p className="text-[#3D2B1F]/60 font-bold">Ada pesanan aktif!</p>
                <p className="text-xs text-[#3D2B1F]/40 mt-1">{itemType} spesialmu sedang dalam proses.</p>
                <button 
                  onClick={() => onViewStatus && onViewStatus()}
                  className="mt-8 px-8 py-3 bg-[#D4AF37] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#D4AF37]/30"
                >
                  Lihat Status Pesanan
                </button>
              </>
            ) : (
              <>
                <p className="text-[#3D2B1F]/60 font-bold">Tidak ada pesanan aktif</p>
                <p className="text-xs text-[#3D2B1F]/40 mt-1">Keinginan makan malam Anda akan muncul di sini.</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="mt-8 px-8 py-3 bg-[#3D2B1F] text-white rounded-xl font-bold text-sm"
                >
                  Pesan Sekarang
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'promo' && (
        <div className="px-6 pt-4 flex-1 flex flex-col overflow-y-auto pb-40">
          <h2 className="text-3xl font-serif text-[#3D2B1F] mb-6">Promo Spesial</h2>
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
            <div className="h-24 w-24 rounded-full bg-[#3D2B1F]/5 flex items-center justify-center text-[#3D2B1F]/20 mb-4">
              <Tag size={48} />
            </div>
            <div className="max-w-[280px]">
              <h3 className="text-[#3D2B1F] font-bold text-lg mb-2">Halo, Sobat Indomi! 👋</h3>
              <p className="text-sm text-[#3D2B1F]/60 leading-relaxed">
                Maaf ya, saat ini belum ada promo yang tersedia untukmu. 
                Tapi tenang saja, pantau terus halaman ini untuk kejutan menarik lainnya!
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('home')}
              className="mt-8 px-8 py-3 bg-[#3D2B1F] text-white rounded-xl font-bold text-sm"
            >
              Kembali ke Menu
            </button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="px-6 pt-4 flex-1 flex flex-col overflow-y-auto pb-40">
          {!profileSubView ? (
            <>
              <h2 className="text-3xl font-serif text-[#3D2B1F] mb-8">Profil</h2>
              <div className="flex flex-col items-center mb-10">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
                  <img src="https://picsum.photos/seed/user/200/200" className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                </div>
                <h3 className="text-xl font-bold text-[#3D2B1F]">{userProfile.name}</h3>
                <p className="text-sm text-[#3D2B1F]/50">{userProfile.email}</p>
              </div>
              <div className="space-y-4 pb-36">
                {[
                  { name: 'Pengaturan Akun', icon: <Settings size={20} /> },
                  { name: 'Metode Pembayaran', icon: <CreditCard size={20} /> },
                  { name: 'Alamat Pengiriman', icon: <MapPin size={20} /> },
                  { name: 'Notifikasi', icon: <BellRing size={20} /> },
                  { name: 'Pusat Bantuan', icon: <HelpCircle size={20} /> }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setProfileSubView(item.name)}
                    className="bg-white p-5 rounded-2xl flex items-center justify-between border border-[#3D2B1F]/5 shadow-sm cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-[#3D2B1F]/40">{item.icon}</div>
                      <span className="font-bold text-[#3D2B1F] text-sm md:text-base">{item.name}</span>
                    </div>
                    <ChevronDown size={18} className="text-[#3D2B1F]/30 -rotate-90" />
                  </motion.div>
                ))}
                
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    showNotification("Anda telah keluar.");
                    if (onLogout) onLogout();
                  }}
                  className="w-full mt-4 p-5 rounded-2xl flex items-center justify-center gap-3 bg-red-50 text-red-600 font-bold border border-red-100"
                >
                  <LogOut size={20} />
                  Keluar Akun
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setProfileSubView(null)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-[#3D2B1F]/5 shadow-sm"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-serif text-[#3D2B1F]">{profileSubView}</h2>
              </div>

              {profileSubView === 'Pengaturan Akun' && (
                <div className="space-y-6 pb-36">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={userProfile.name} 
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="w-full h-14 bg-white rounded-2xl px-6 text-sm font-medium border border-[#3D2B1F]/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2">Email</label>
                    <input 
                      type="email" 
                      value={userProfile.email} 
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      className="w-full h-14 bg-white rounded-2xl px-6 text-sm font-medium border border-[#3D2B1F]/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2">Nomor Telepon</label>
                    <input 
                      type="tel" 
                      value={userProfile.phone} 
                      onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                      className="w-full h-14 bg-white rounded-2xl px-6 text-sm font-medium border border-[#3D2B1F]/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/10" 
                    />
                  </div>
                  <button 
                    onClick={() => {
                      showNotification("Profil berhasil diperbarui!");
                      setProfileSubView(null);
                    }}
                    className="w-full h-16 bg-[#3D2B1F] text-white rounded-2xl font-bold shadow-lg mt-4 active:scale-95 transition-transform"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              )}

              {profileSubView === 'Metode Pembayaran' && (
                <div className="space-y-4 pb-36">
                  <div 
                    onClick={() => setSelectedPaymentMethod('qris')}
                    className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${selectedPaymentMethod === 'qris' ? 'bg-[#3D2B1F] text-white border-[#3D2B1F] shadow-lg' : 'bg-white text-[#3D2B1F] border-[#3D2B1F]/5 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${selectedPaymentMethod === 'qris' ? 'bg-white/10' : 'bg-blue-50 text-blue-600'}`}>
                        <QrCode size={24} />
                      </div>
                      <div>
                        <p className="font-bold">QRIS</p>
                        <p className={`text-xs ${selectedPaymentMethod === 'qris' ? 'text-white/60' : 'text-[#3D2B1F]/40'}`}>Scan & Bayar</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'qris' ? <CheckCircle size={20} /> : <div className="text-[#D4AF37] text-xs font-bold">PILIH</div>}
                  </div>
                  <div 
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${selectedPaymentMethod === 'cash' ? 'bg-[#3D2B1F] text-white border-[#3D2B1F] shadow-lg' : 'bg-white text-[#3D2B1F] border-[#3D2B1F]/5 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${selectedPaymentMethod === 'cash' ? 'bg-white/10' : 'bg-green-50 text-green-600'}`}>
                        <Banknote size={24} />
                      </div>
                      <div>
                        <p className="font-bold">Tunai (Cash)</p>
                        <p className={`text-xs ${selectedPaymentMethod === 'cash' ? 'text-white/60' : 'text-[#3D2B1F]/40'}`}>Bayar di Tempat</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'cash' ? <CheckCircle size={20} /> : <div className="text-[#D4AF37] text-xs font-bold">PILIH</div>}
                  </div>
                </div>
              )}

              {profileSubView === 'Alamat Pengiriman' && (
                <div className="space-y-4 pb-36 relative">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className={`p-5 rounded-2xl border transition-all ${addr.isMain ? 'bg-white border-[#3D2B1F]/20 shadow-md ring-2 ring-[#3D2B1F]/5' : 'bg-white border-[#3D2B1F]/5 shadow-sm opacity-80'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Home size={16} className={addr.isMain ? "text-[#D4AF37]" : "text-[#3D2B1F]/30"} />
                          <span className={`font-bold ${addr.isMain ? 'text-[#3D2B1F]' : 'text-[#3D2B1F]/60'}`}>{addr.label}</span>
                        </div>
                        {addr.isMain ? (
                          <div className="bg-[#3D2B1F] text-white text-[8px] font-bold px-2 py-0.5 rounded-full">UTAMA</div>
                        ) : (
                          <button 
                            onClick={() => {
                              const updated = addresses.map(a => ({
                                ...a,
                                isMain: a.id === addr.id
                              }));
                              setAddresses(updated);
                              onAddressChange(addr.detail);
                              showNotification(`Alamat ${addr.label} dipilih sebagai utama.`);
                            }}
                            className="text-[9px] font-bold text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full hover:bg-[#D4AF37] hover:text-white transition-colors"
                          >
                            PILIH
                          </button>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${addr.isMain ? 'text-[#3D2B1F]/80' : 'text-[#3D2B1F]/40'}`}>{addr.detail}</p>
                      <div className="flex gap-4 mt-4 pt-4 border-t border-[#3D2B1F]/5">
                        <button 
                          onClick={() => showNotification('Fitur ubah alamat akan segera hadir.')}
                          className="text-xs font-bold text-[#3D2B1F]/60 hover:text-[#3D2B1F] transition-colors"
                        >
                          Ubah
                        </button>
                        {!addr.isMain && (
                          <button 
                            onClick={() => {
                              setAddresses(addresses.filter(a => a.id !== addr.id));
                            }}
                            className="text-xs font-bold text-red-500/60"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsAddingAddress(true)}
                    className="w-full h-16 border-2 border-dashed border-[#3D2B1F]/20 rounded-2xl font-bold text-[#3D2B1F]/60 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Plus size={20} /> Tambah Alamat Baru
                  </button>

                  <AnimatePresence>
                    {isAddingAddress && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center"
                      >
                        <motion.div 
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          className="w-full max-w-[430px] bg-[#F5F2EA] rounded-t-[3rem] p-8 shadow-2xl"
                        >
                          <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-serif text-[#3D2B1F]">Tambah Alamat</h3>
                            <button 
                              onClick={() => setIsAddingAddress(false)}
                              className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm"
                            >
                              <Plus size={20} className="rotate-45" />
                            </button>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2">Label Alamat (Rumah, Kantor, dll)</label>
                              <input 
                                type="text" 
                                placeholder="Contoh: Kantor"
                                value={newAddressForm.label}
                                onChange={(e) => setNewAddressForm({...newAddressForm, label: e.target.value})}
                                className="w-full h-14 bg-white rounded-2xl px-6 text-sm font-medium border border-[#3D2B1F]/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/10" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2">Alamat Lengkap</label>
                              <textarea 
                                placeholder="Masukkan alamat lengkap Anda..."
                                value={newAddressForm.detail}
                                onChange={(e) => setNewAddressForm({...newAddressForm, detail: e.target.value})}
                                className="w-full h-32 bg-white rounded-2xl p-6 text-sm font-medium border border-[#3D2B1F]/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/10 resize-none" 
                              />
                            </div>
                            <button 
                              onClick={() => {
                                if (!newAddressForm.label || !newAddressForm.detail) {
                                  return showNotification("Mohon isi semua data alamat.");
                                }
                                const newAddr = {
                                  id: Date.now(),
                                  label: newAddressForm.label,
                                  detail: newAddressForm.detail,
                                  isMain: false
                                };
                                setAddresses([...addresses, newAddr]);
                                setIsAddingAddress(false);
                                setNewAddressForm({ label: '', detail: '' });
                                showNotification("Alamat baru ditambahkan!");
                              }}
                              className="w-full h-16 bg-[#3D2B1F] text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
                            >
                              Simpan Alamat
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {profileSubView === 'Notifikasi' && (
                <div className="space-y-4 pb-36">
                  {[
                    { key: 'promo', title: 'Promo & Penawaran', desc: 'Dapatkan info diskon terbaru' },
                    { key: 'status', title: 'Status Pesanan', desc: 'Update real-time pesananmu' },
                    { key: 'newsletter', title: 'Email Newsletter', desc: 'Berita kuliner mingguan' }
                  ].map((notif) => (
                    <div key={notif.key} className="bg-white p-5 rounded-2xl border border-[#3D2B1F]/5 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#3D2B1F]">{notif.title}</p>
                        <p className="text-xs text-[#3D2B1F]/40">{notif.desc}</p>
                      </div>
                      <div 
                        onClick={() => setNotifSettings({...notifSettings, [notif.key]: !notifSettings[notif.key as keyof typeof notifSettings]})}
                        className={`h-6 w-12 rounded-full relative p-1 cursor-pointer transition-colors ${notifSettings[notif.key as keyof typeof notifSettings] ? 'bg-[#3D2B1F]' : 'bg-[#3D2B1F]/10'}`}
                      >
                        <motion.div 
                          animate={{ x: notifSettings[notif.key as keyof typeof notifSettings] ? 24 : 0 }}
                          className="h-4 w-4 bg-white rounded-full shadow-sm"
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {profileSubView === 'Pusat Bantuan' && (
                <div className="space-y-4 pb-36">
                  <div className="bg-white p-6 rounded-3xl border border-[#3D2B1F]/5 shadow-sm text-center">
                    <div className="h-20 w-20 rounded-full bg-[#3D2B1F]/5 flex items-center justify-center text-[#3D2B1F] mx-auto mb-4">
                      <HelpCircle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-[#3D2B1F] mb-2">Ada Kendala?</h3>
                    <p className="text-sm text-[#3D2B1F]/60 mb-6">Tim dukungan kami siap membantumu 24/7 untuk setiap pesanan.</p>
                    <a 
                      href="https://wa.me/6285648695615" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full h-14 bg-[#3D2B1F] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                    >
                      <Phone size={18} /> Hubungi Kami
                    </a>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F]/40 ml-2 mt-4">Pertanyaan Populer</p>
                    {[
                      { q: 'Cara membatalkan pesanan', a: 'Anda dapat membatalkan pesanan dalam waktu 1 menit setelah pemesanan dilakukan melalui tab Pesanan Saya.' },
                      { q: 'Metode pembayaran tersedia', a: 'Kami menerima pembayaran via QRIS (Gopay, OVO, Dana, dll) dan Tunai saat pemesanan.' },
                      { q: 'Area jangkauan pengiriman', a: 'Saat ini kami melayani pengiriman untuk area kampus dan sekitarnya dalam radius 1km.' }
                    ].map((faq, i) => (
                      <div key={i} className="bg-white rounded-xl border border-[#3D2B1F]/5 overflow-hidden">
                        <div 
                          onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                        >
                          <span className="text-sm font-bold text-[#3D2B1F]">{faq.q}</span>
                          <ChevronDown size={16} className={`text-[#3D2B1F]/30 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                        </div>
                        <AnimatePresence>
                          {expandedFaq === i && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4"
                            >
                              <p className="text-xs text-[#3D2B1F]/60 leading-relaxed border-t border-[#3D2B1F]/5 pt-3">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Owner Dashboard Button */}
      {userRole === 'owner' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenOwnerDashboard}
          className="absolute bottom-28 right-6 z-50 h-14 w-14 rounded-full bg-[#D4AF37] text-white shadow-xl flex items-center justify-center border-4 border-[#F5F2EA]"
        >
          <Settings size={24} />
        </motion.button>
      )}

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-24 bg-[#3D2B1F] flex items-center justify-between px-10 rounded-t-[3.5rem] shadow-2xl z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-white' : 'text-white/40'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'search' ? 'text-white' : 'text-white/40'}`}
        >
          <Search size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
        </button>
        <button 
          onClick={() => {
            if (hasActiveOrder && onViewStatus) {
              onViewStatus();
            } else {
              setActiveTab('orders');
            }
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'orders' ? 'text-white' : 'text-white/40'}`}
        >
          <div className="relative">
            <ReceiptText size={24} />
            {hasActiveOrder && (
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-[#3D2B1F]"></div>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Orders</span>
        </button>
        <button 
          onClick={handlePromoClick}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'promo' ? 'text-white' : 'text-white/40'}`}
        >
          <Tag size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Promo</span>
        </button>
        <button 
          onClick={handleProfileClick}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-white/40'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </div>
    </motion.div>
  );
}

function CheckoutScreen({ address, mapsUrl, cart, onBack, onOrderPlaced }: { address: string, mapsUrl?: string, cart: CartItem | null, onBack: () => void, onOrderPlaced: () => void }) {
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cash'>('qris');

  if (!cart) return null;

  const totalPayment = cart.totalPrice;

  const toppingsPriceMap: {[key: string]: number} = {
    'Telur Rebus Utuh': 3000,
    'Telur Rebus Mi': 3000,
    'Caisim': 1000,
  };

  const basePrice = cart.item.priceNum * cart.quantity;
  const toppingsCost = cart.toppings.reduce((acc: number, t: string) => acc + (toppingsPriceMap[t] || 0), 0) * cart.quantity;
  const spicinessCost = (cart.spiciness * 1000) * cart.quantity;

  return (
    <motion.div 
      key="checkout"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full overflow-y-auto pb-36"
    >
      <StatusBar />
      
      {/* Header */}
      <div className="flex items-center px-6 pt-4 pb-2 sticky top-0 bg-[#F5F2EA]/90 backdrop-blur-sm z-20">
        <button 
          onClick={onBack}
          className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#3D2B1F]/5"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="flex-1 text-center text-xl font-serif font-bold pr-10">Pembayaran</h2>
      </div>

      {/* Selection */}
      <div className="px-6 mt-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D2B1F]/50 mb-4 border-b border-[#3D2B1F]/10 pb-2">Pilihan Anda</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-md">
              <img src={cart.item.img} className="w-full h-full object-cover grayscale-[0.2]" alt={cart.item.name} referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <p className="font-serif font-bold text-[#3D2B1F]">{cart.item.name}</p>
              {!cart.item.categories.includes('Snack') && (
                <div className="text-[11px] text-[#3D2B1F]/50 mt-1 space-y-0.5">
                  {cart.spiciness > 0 && (
                    <p>Level {cart.spiciness} (+Rp {(cart.spiciness * 1000).toLocaleString()})</p>
                  )}
                  {cart.toppings.length > 0 && (
                    <p>{cart.toppings.join(', ')} (+Rp {cart.toppings.reduce((acc: number, t: string) => acc + (toppingsPriceMap[t] || 0), 0).toLocaleString()})</p>
                  )}
                </div>
              )}
              <p className="font-bold text-[#3D2B1F] mt-1">Rp {cart.totalPrice.toLocaleString()}</p>
            </div>
            <div className="bg-[#3D2B1F]/5 rounded-full px-3 py-1.5 flex items-center gap-3">
              <span className="text-sm font-bold">{cart.quantity}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="px-6 mt-10">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D2B1F]/50 mb-3">Lokasi Pengiriman</h3>
        <div className="bg-[#3D2B1F]/5 p-5 rounded-2xl border border-[#3D2B1F]/10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#3D2B1F]/10 flex items-center justify-center text-[#3D2B1F]">
            <MapPin size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#3D2B1F]">{address}</p>
            {mapsUrl && (
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-[#D4AF37] font-bold flex items-center gap-1 hover:underline mt-1"
              >
                <MapPin size={10} /> Lihat di Google Maps
              </a>
            )}
          </div>
          <ChevronDown size={18} className="text-[#3D2B1F]/30 -rotate-90" />
        </div>
      </div>

      {/* Payment */}
      <div className="px-6 mt-10">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D2B1F]/50 mb-3">Metode Pembayaran</h3>
        <div className="space-y-3">
          <button 
            onClick={() => setPaymentMethod('qris')}
            className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all ${paymentMethod === 'qris' ? 'bg-[#3D2B1F] text-white shadow-lg' : 'bg-[#3D2B1F]/5 border border-[#3D2B1F]/10 text-[#3D2B1F]'}`}
          >
            <QrCode size={20} />
            <div className="flex-1 text-left">
              <p className="text-sm font-bold">QRIS</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Scan untuk membayar</p>
            </div>
            {paymentMethod === 'qris' && <CheckCircle size={20} />}
          </button>
          <button 
            onClick={() => setPaymentMethod('cash')}
            className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all ${paymentMethod === 'cash' ? 'bg-[#3D2B1F] text-white shadow-lg' : 'bg-[#3D2B1F]/5 border border-[#3D2B1F]/10 text-[#3D2B1F]'}`}
          >
            <Banknote size={20} />
            <div className="flex-1 text-left">
              <p className="text-sm font-bold">Tunai (Cash)</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Siapkan uang pas ya!</p>
            </div>
            {paymentMethod === 'cash' && <CheckCircle size={20} />}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mx-6 mt-10 p-6 rounded-3xl bg-[#3D2B1F]/5 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#3D2B1F]/50">Subtotal</span>
          <span className="font-bold text-[#3D2B1F]">Rp {cart.totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#3D2B1F]/50">Biaya Pengiriman</span>
          <span className="font-bold text-green-600">Gratis</span>
        </div>
        <div className="h-px bg-[#3D2B1F]/10 w-full"></div>
        <div className="flex justify-between items-end pt-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D2B1F]">Total Pembayaran</span>
          <span className="text-3xl font-serif font-bold text-[#3D2B1F] leading-none">Rp {totalPayment.toLocaleString()}</span>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 w-full p-6 bg-[#F5F2EA]/90 backdrop-blur-md border-t border-[#3D2B1F]/5">
        <motion.button 
          onClick={onOrderPlaced}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#3D2B1F] text-[#F5F2EA] h-16 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl"
        >
          Buat Pesanan
          <ShoppingBag size={20} />
        </motion.button>
        <div className="h-6 w-full flex justify-center items-end mt-4">
          <div className="w-32 h-1.5 bg-[#3D2B1F]/10 rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailScreen({ item, onBack, onAddToCart }: { item: any, onBack: () => void, onAddToCart: (cartDetails: CartItem) => void }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [spiciness, setSpiciness] = useState(0);

  const toppings = [
    { name: 'Telur Rebus Utuh', price: 3000 },
    { name: 'Telur Rebus Mi', price: 3000 },
    { name: 'Caisim', price: 1000 },
  ];

  const isSnack = item.categories.includes('Snack');

  const toggleTopping = (name: string) => {
    setSelectedToppings(prev => 
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    );
  };

  const spicinessCost = spiciness * 1000;
  const toppingsCost = selectedToppings.reduce((acc, t) => {
    const topping = toppings.find(top => top.name === t);
    return acc + (topping?.price || 0);
  }, 0);

  const totalPrice = (item.priceNum + toppingsCost + spicinessCost) * quantity;

  const handleAddToCart = () => {
    onAddToCart({
      item,
      quantity,
      toppings: selectedToppings,
      spiciness,
      totalPrice
    });
  };

  return (
    <motion.div 
      key="detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-full overflow-y-auto pb-36 bg-white"
    >
      <div className="relative h-[350px] w-full">
        <img 
          src={item.img} 
          className={`w-full h-full object-cover ${item.name === 'Indomie Goreng Pedas' ? 'object-[center_30%]' : 'object-center'}`}
          alt={item.name} 
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <button 
            onClick={onBack}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <button className="h-10 w-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white">
            <SlidersHorizontal size={20} className="rotate-90" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#F5F2EA] -mt-10 rounded-t-[3rem] px-8 pt-8 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] max-w-[200px]">{item.name}</h2>
          <p className="text-xl font-bold text-[#3D2B1F]">{item.price}</p>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} fill="#D4AF37" className="text-[#D4AF37]" />
          <span className="text-sm font-bold text-[#3D2B1F]">{item.rating} (120+ ulasan)</span>
        </div>

        <p className="text-sm text-[#3D2B1F]/70 leading-relaxed mb-6">
          {item.description}
        </p>

        {!isSnack && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Tambahan Menu</h3>
              <div className="space-y-3">
                {toppings.map((topping, i) => (
                  <div 
                    key={i} 
                    onClick={() => toggleTopping(topping.name)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${selectedToppings.includes(topping.name) ? 'bg-[#3D2B1F] border-[#3D2B1F]' : 'border-[#3D2B1F]/20'}`}>
                        {selectedToppings.includes(topping.name) && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <span className="font-bold text-[#3D2B1F]">{topping.name}</span>
                    </div>
                    <span className="text-sm text-[#3D2B1F]/50 font-bold">+Rp {topping.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Level Pedas Sesukamu</h3>
              <div className="flex items-center gap-4">
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <button 
                    key={level}
                    onClick={() => setSpiciness(level)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${spiciness === level ? 'bg-red-700 text-white shadow-lg scale-110' : 'bg-white text-[#3D2B1F] border border-[#3D2B1F]/10'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#3D2B1F]/40 mt-3 font-bold uppercase tracking-widest">
                {spiciness === 0 ? 'Tidak Pedas' : spiciness <= 2 ? 'Pedas Sedang' : 'Sangat Pedas'}
              </p>
            </div>
          </>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#3D2B1F] mb-3">Instruksi Khusus</h3>
          <textarea 
            placeholder="Contoh: Tanpa daun bawang, ekstra pedas..."
            className="w-full h-24 bg-white rounded-3xl p-6 text-sm font-medium border border-[#3D2B1F]/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B1F]/10 resize-none"
          ></textarea>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full p-6 bg-[#F5F2EA]/90 backdrop-blur-md border-t border-[#3D2B1F]/5 flex items-center gap-6 z-50">
        <div className="flex items-center gap-6 bg-white rounded-2xl px-4 py-3 border border-[#3D2B1F]/10 shadow-sm">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-[#3D2B1F]/5 text-[#3D2B1F] hover:bg-[#3D2B1F]/10 transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="text-xl font-bold text-[#3D2B1F] w-6 text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-[#3D2B1F] text-white hover:bg-black transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <motion.button 
          onClick={handleAddToCart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-[#3D2B1F] text-[#F5F2EA] h-16 rounded-2xl font-bold text-sm uppercase tracking-[0.1em] flex items-center justify-center shadow-xl"
        >
          Buat Pesanan Rp {totalPrice.toLocaleString()}
        </motion.button>
      </div>
    </motion.div>
  );
}

function StatusScreen({ onBack, onGoHome, activeOrder, onClearOrder, cart, onExtendOrder, customerName, customerPhone, customerEmail }: { onBack: () => void, onGoHome: (tab?: string) => void, activeOrder: any, onClearOrder?: () => void, cart?: any, onExtendOrder: () => void, customerName: string, customerPhone: string, customerEmail: string }) {
  const [timeLeft, setTimeLeft] = useState(0);

  const itemType = useMemo(() => {
    if (!cart?.item) return 'Indomie';
    if (cart.item.categories.includes('Snack')) return 'Snack';
    return 'Indomie';
  }, [cart]);

  const generateReceiptText = () => {
    if (!cart) return '';
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    let text = `*NOTA PEMBELIAN INDOMI NITE*\n`;
    text += `--------------------------------\n`;
    text += `ID Pesanan: #${activeOrder?.id || 'N/A'}\n`;
    text += `Tanggal: ${date} ${time}\n`;
    text += `Pelanggan: ${customerName}\n`;
    text += `--------------------------------\n`;
    text += `*Item:*\n`;
    text += `- ${cart.item.name} x${cart.quantity}\n`;
    if (cart.toppings.length > 0) {
      text += `  Topping: ${cart.toppings.join(', ')}\n`;
    }
    text += `  Level Pedas: ${cart.spiciness}\n`;
    text += `--------------------------------\n`;
    text += `*TOTAL: Rp ${cart.totalPrice.toLocaleString()}*\n`;
    text += `--------------------------------\n`;
    text += `Terima kasih sudah memesan di Indomi Nite!`;
    return text;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateReceiptText());
    const url = `https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${text}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Nota Pembelian Indomi Nite - #${activeOrder?.id}`);
    const body = encodeURIComponent(generateReceiptText().replace(/\*/g, ''));
    const url = `mailto:${customerEmail}?subject=${subject}&body=${body}`;
    window.open(url, '_blank');
  };

  // Update timer display
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'selesai') {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = (Date.now() - activeOrder.startTime) / 1000;
      const duration = activeOrder.isExtended ? 600 : 300;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      
      // Check for extension need (simulated at 0)
      if (remaining === 0 && !activeOrder.isExtended && activeOrder.status !== 'selesai') {
         onExtendOrder();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeOrder, onExtendOrder]);

  const orderStatus = activeOrder?.status || 'diterima';
  const isExtended = activeOrder?.isExtended || false;
  const hasActiveOrder = !!activeOrder;

  const handlePromoClick = () => {
    onGoHome('promo');
  };

  const handleProfileClick = () => {
    onGoHome('profile');
  };

  const handleSearchClick = () => {
    onGoHome('search');
  };

  const handleOrdersClick = () => {
    onGoHome('orders');
  };

  const dots = Array.from({ length: 120 });

  return (
    <motion.div 
      key="status"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col h-full bg-[#F5F2EA] overflow-hidden relative"
    >
      <StatusBar />

      {/* Header */}
      <div className="flex items-center px-6 pt-4 pb-2">
        <button 
          onClick={onBack}
          className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#3D2B1F]/5"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="flex-1 text-center text-xl font-serif font-bold pr-10 text-[#3D2B1F]">Status Pesanan</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasActiveOrder ? (
          <div className="flex flex-col items-center justify-center text-center px-8 pt-20 pb-10">
            <div className="w-24 h-24 rounded-full bg-[#3D2B1F]/5 flex items-center justify-center mb-6">
              <ReceiptText size={40} className="text-[#3D2B1F]/40" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-2">Belum Ada Pesanan</h3>
            <p className="text-[#3D2B1F]/60 mb-8 max-w-[250px]">
              Kamu belum membuat pesanan apapun. Yuk, pesan Indomie spesialmu sekarang!
            </p>
            <button 
              onClick={() => onGoHome('home')}
              className="bg-[#3D2B1F] text-[#F5F2EA] px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl hover:bg-black transition-colors"
            >
              Pesan Sekarang
            </button>
          </div>
        ) : (
          <div className="pb-40">
            {/* Banner Animation Area */}
            <div className="relative w-full h-64 mb-8 bg-[#3D2B1F]/5 overflow-hidden rounded-b-[3rem] shadow-sm shrink-0">
              {/* Blurred Background to fill the rectangle */}
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-125"
                src="/video-elang.mp4" 
              />
              {/* Main Video */}
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="relative z-10 w-full h-full object-cover object-center"
                src="/video-elang.mp4" 
              />
              {/* Gradient overlay to blend it in */}
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#F5F2EA] via-transparent to-transparent"></div>
            </div>

            <div className="px-8 flex flex-col items-center">
              {/* Circular Countdown Timer */}
              {orderStatus !== 'selesai' && (
                <div className="flex flex-col items-center justify-center mb-10">
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    {/* SVG Circle */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      {/* Track */}
                      <circle
                        cx="112"
                        cy="112"
                        r="100"
                        stroke="#3D2B1F"
                        strokeWidth="8"
                        fill="transparent"
                        className="opacity-10"
                      />
                      {/* Progress */}
                      <circle
                        cx="112"
                        cy="112"
                        r="100"
                        stroke="#3D2B1F"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 100}
                        strokeDashoffset={2 * Math.PI * 100 * (1 - timeLeft / (isExtended ? 600 : 300))}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                      />
                      {/* Dot Indicator */}
                      <circle
                        cx={112 + 100 * Math.cos(((timeLeft / (isExtended ? 600 : 300)) * 2 * Math.PI) - (Math.PI / 2))}
                        cy={112 + 100 * Math.sin(((timeLeft / (isExtended ? 600 : 300)) * 2 * Math.PI) - (Math.PI / 2))}
                        r="6"
                        fill="#3D2B1F"
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    
                    {/* Time Display */}
                    <div className="flex flex-col items-center z-10">
                      <span className="text-3xl font-mono font-bold text-[#3D2B1F] tracking-wider">
                        {`00:${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${Math.floor(timeLeft % 60).toString().padStart(2, '0')}`}
                      </span>
                      <span className="text-xs font-medium text-[#3D2B1F]/60 mt-2">
                        {isExtended ? 'Tambahan 5 menit' : 'Estimasi 5 menit'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Text (Moved below timer) */}
              <div className="w-full mb-8 text-center">
                 <h3 className="text-xl font-serif font-bold text-[#3D2B1F] mb-1">
                  {orderStatus === 'diterima' && 'Pesanan Diterima'}
                  {orderStatus === 'dimasak' && 'Sedang Dimasak'}
                  {orderStatus === 'diantar' && 'Sedang Diantar'}
                  {orderStatus === 'selesai' && 'Pesanan Selesai'}
                 </h3>
                 <p className="text-sm text-[#3D2B1F]/60">
                  {orderStatus === 'diterima' && 'Menunggu koki menyiapkan pesananmu.'}
                  {orderStatus === 'dimasak' && 'Harap tunggu sebentar, ya.'}
                  {orderStatus === 'diantar' && 'Kurir sedang menuju ke tempatmu.'}
                  {orderStatus === 'selesai' && `Selamat menikmati ${itemType} spesialmu!`}
                 </p>
              </div>

            {/* Quote Box */}
            <div className="w-full bg-[#3D2B1F]/5 p-6 rounded-3xl flex items-center gap-4 border border-[#3D2B1F]/5 mb-6">
              <div className="text-[#D4AF37]">
                <Utensils size={24} />
              </div>
              <p className="text-sm font-serif italic text-[#3D2B1F]">
                "{itemType} spesialmu akan segera siap!"
              </p>
            </div>

            {/* Owner Simulation Button removed */}

            {orderStatus === 'selesai' && (
              <div className="w-full flex flex-col gap-4 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-[#3D2B1F]/10 shadow-sm">
                  <h4 className="text-sm font-bold text-[#3D2B1F] mb-4 text-center uppercase tracking-widest">Kirim Nota Pembelian</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleShareWhatsApp}
                      className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-2xl font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
                    >
                      <Phone size={16} /> WhatsApp
                    </button>
                    <button 
                      onClick={handleShareEmail}
                      className="flex items-center justify-center gap-2 bg-[#3D2B1F] text-white py-3 rounded-2xl font-bold text-xs shadow-md hover:bg-black transition-colors"
                    >
                      <Mail size={16} /> Email
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (onClearOrder) onClearOrder();
                    onGoHome('home');
                  }}
                  className="bg-[#3D2B1F] text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-black transition-colors"
                >
                  Pesan Lagi
                </button>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-24 bg-[#3D2B1F] flex items-center justify-between px-10 rounded-t-[3.5rem] shadow-2xl z-50">
        <button 
          onClick={() => onGoHome('home')}
          className="flex flex-col items-center gap-1 transition-colors text-white/40"
        >
          <Home size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={handleSearchClick}
          className="flex flex-col items-center gap-1 transition-colors text-white/40"
        >
          <Search size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
        </button>
        <button 
          onClick={handleOrdersClick}
          className="flex flex-col items-center gap-1 transition-colors text-white"
        >
          <div className="relative">
            <ReceiptText size={24} />
            {hasActiveOrder && (
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-[#3D2B1F]"></div>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Orders</span>
        </button>
        <button 
          onClick={handlePromoClick}
          className="flex flex-col items-center gap-1 transition-colors text-white/40"
        >
          <Tag size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Promo</span>
        </button>
        <button 
          onClick={handleProfileClick}
          className="flex flex-col items-center gap-1 transition-colors text-white/40"
        >
          <User size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </div>
    </motion.div>
  );
}

