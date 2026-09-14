'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SectionHeader({ badge, title, subtitle, lightText = false }) {
  const headerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.header-elem', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: headerRef.current, start: 'top 85%', once: true } });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={headerRef} className="flex flex-col items-center text-center mb-16">
      {badge && <span className="header-elem inline-block px-4 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-[11px] font-bold tracking-widest uppercase mb-4">{badge}</span>}
      <h2 className={`header-elem text-3xl md:text-4xl font-extrabold tracking-tight mb-4 ${lightText ? 'text-white' : 'text-brand-navy'}`}>{title}</h2>
      {subtitle && <p className={`header-elem text-[15px] max-w-2xl mx-auto leading-relaxed ${lightText ? 'text-white/80' : 'text-brand-muted'}`}>{subtitle}</p>}
    </div>
  );
}
