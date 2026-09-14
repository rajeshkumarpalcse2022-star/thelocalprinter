'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from 'framer-motion';
import api from '@/services/api';

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] } })
};

export default function MaterialSection() {
  const sectionRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/user/public/categories')
      .then((res) => {
        const cats = res.data?.data?.categories || [];
        setCategories(cats.filter((c) => c.image));
      })
      .catch(() => {});
  }, []);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <section ref={sectionRef} onMouseMove={handleMouseMove} className="relative py-24 px-6 bg-[#FCFDFE] overflow-hidden group/section">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(244,81,22,0.02)_0%,_transparent_60%)] pointer-events-none" />
      {!shouldReduceMotion && (
        <motion.div className="pointer-events-none absolute inset-0 hidden md:block opacity-0 group-hover/section:opacity-100 transition-opacity duration-1000 ease-out z-0" style={{ background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(244, 81, 22, 0.025), transparent 80%)` }} />
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes subtleFloat1{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}@keyframes subtleFloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}@keyframes subtleFloat3{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}.float-1{animation:subtleFloat1 5s ease-in-out infinite}.float-2{animation:subtleFloat2 6.5s ease-in-out infinite}.float-3{animation:subtleFloat3 8s ease-in-out infinite}` }} />
      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="flex flex-col items-start text-left mb-14">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, ease: "easeOut" }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange/5 border border-brand-orange/10 text-brand-orange text-[11px] font-bold tracking-widest uppercase mb-5 hover:bg-brand-orange/10 transition-colors cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
            PRINT ON
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="text-[32px] md:text-[42px] font-extrabold text-brand-navy tracking-tight mb-4">Every Material. Every Format.</motion.h2>
          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }} className="text-[15px] text-brand-muted leading-relaxed max-w-2xl">From everyday paper to specialty surfaces — find printers who work with any substrate.</motion.p>
        </div>
        {categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 md:gap-4">
            {categories.map((cat, i) => {
              const shouldFloat = !shouldReduceMotion && (i % 4 === 0);
              const isFeatured = i < 4;
              const cardBg = isFeatured ? 'bg-[#FFF9F5]' : 'bg-white';
              const cardBorder = isFeatured ? 'border-[#FFE8D6]' : 'border-[#e8eaed]';
              return (
                <motion.div key={cat._id} custom={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }}>
                  <a href={`/categories/${cat.slug}`} className={`block w-full h-full ${shouldFloat ? `float-${(i % 3) + 1}` : ''}`}>
                    <div className={`group relative overflow-hidden w-full h-[110px] flex flex-col items-center justify-center p-4 rounded-2xl border-[1.5px] ${cardBg} ${cardBorder} shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-brand-orange hover:shadow-[0_12px_32px_rgba(232,75,22,0.1)]`}>
                      {cat.image.trim().startsWith('<') ? (
                        <div className="w-7 h-7 mb-3 transition-all duration-200 group-hover:scale-105 relative z-10 [&>svg]:w-7 [&>svg]:h-7 [&>svg]:text-brand-navy group-hover:[&>svg]:text-brand-orange" dangerouslySetInnerHTML={{ __html: cat.image }} />
                      ) : (
                        <img src={cat.image} alt={cat.name} className="w-10 h-10 mb-3 object-contain transition-all duration-200 group-hover:scale-105 relative z-10" />
                      )}
                      <span className="text-[11.5px] font-semibold text-brand-navy leading-tight transition-colors duration-200 group-hover:text-brand-orange text-center relative z-10">{cat.name}</span>
                    </div>
                  </a>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
