import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Heart, Truck, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { store } from '../store';

import floristImg from '../assets/florist.png';
import deliverImg from '../assets/delivery.png';
import bloomtechImg from '../assets/bloomtech.png';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);

  useEffect(() => {
    const products = store.getProducts();
    if (Array.isArray(products)) {
      setNewArrivals(products.slice(0, 3));
    }
  }, []);

  return (
    <div className="space-y-20 pb-20">

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover"
            alt="Flowers"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bloom-cream/90 via-bloom-cream/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl space-y-6"
          >
            <h1 className="text-6xl md:text-7xl font-serif text-bloom-dark leading-tight">
              Love, Delivered <br />
              <span className="text-rose-500 italic">Freshly</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              BloomTech Connect bridges the distance with premium floral arrangements. 
              Handcrafted by local artisans and delivered with care to your loved ones.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/shop" className="btn-primary flex items-center gap-2">
                Shop Bouquets <ArrowRight size={18} />
              </Link>
              <Link to="/track" className="btn-secondary">
                Track Order
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <span className="text-rose-500 font-bold uppercase tracking-widest text-sm">Freshly Picked</span>
              <h2 className="text-4xl font-serif">New Arrivals</h2>
            </div>
            <Link to="/shop" className="text-rose-500 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newArrivals.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-50"
              >
                <div className="h-72 relative overflow-hidden">
                  <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{product.name}</h3>
                      <p className="text-xs text-slate-400">by {product.vendor_name}</p>
                    </div>
                    <span className="text-rose-500 font-bold">${product.base_price}</span>
                  </div>

                  <Link to={`/product/${product.id}`} className="w-full py-3 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all">
                    <ShoppingBag size={16} /> View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* About Bloomtech */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <span className="text-rose-500 font-bold uppercase tracking-widest text-sm">
            About Bloomtech Connect
          </span>
          <h2 className="text-5xl font-serif">Our Story & Services</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[{
            img: bloomtechImg,
            text: `Bloomtech Connect is your trusted online flower and gifting partner, proudly delivering smiles across Gingoog City. We offer beautifully crafted floral arrangements, delicious cakes, premium chocolates, and thoughtfully curated gift items perfect for every special occasion.
As we continue to grow, our journey is focused on expanding our reach, enhancing our product selection, and improving our services — all to serve you better and make every celebration even more memorable.
`
          },
          {
            img: floristImg,
            text: `At Bloomtech Connect, we collaborate with skilled florists and trusted local partners in Gingoog City to ensure every bouquet is crafted with care, creativity, and expertise. Whether it’s a birthday, anniversary, or a “just because” surprise, our flowers are thoughtfully arranged by talented hands passionate about floral design.
We believe in celebrating life’s meaningful moments with the freshest blooms, delightful cakes, premium chocolates, and carefully curated gifts — all prepared to bring joy to your loved ones and make every occasion truly unforgettable.`
          },
          {
            img: deliverImg,
            text: `At Bloomtech Connect, we are committed to making every moment in Gingoog City truly special. Our services include same-day flower delivery, premium gift bundles, personalized items, and signature floral arrangements designed to suit every celebration.
Whether you’re sending love from afar or planning a heartfelt surprise, our dedicated team is here to make the experience seamless, meaningful, and unforgettable — because at Bloomtech Connect, every gesture matters..`
          }].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-50"
            >
              <div className="h-64 overflow-hidden">
                <img src={item.img} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 text-slate-600 leading-relaxed text-sm">
                {item.text}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Floating CTA Section */}
      <section className="relative py-20 overflow-hidden bg-bloom-dark text-white rounded-[4rem] mx-4 sm:mx-8">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-serif leading-tight">
            Ready to make someone's <br />
            <span className="text-rose-400 italic">entire week?</span>
          </h2>
          <p className="text-xl text-slate-400">
            Join 10,000+ happy customers who trust BloomTech for their most important moments.
          </p>
          <Link to="/shop" className="btn-primary border-none text-lg px-10 py-5">
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* ⭐ Testimonials Section (Back) */}
      <section className="bg-rose-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <h2 className="text-4xl font-serif">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah J.', text: 'The flowers were even more beautiful than the pictures! My mom was so surprised.' },
              { name: 'Michael R.', text: 'Fast delivery and the tracking feature kept me updated every step of the way.' },
              { name: 'Emily W.', text: 'Best flower shop online. The customization options are endless.' },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm italic text-slate-600">
                "{t.text}"
                <div className="mt-4 font-bold text-bloom-dark not-italic">— {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}