'use client';

import SectionHeader from '../common/SectionHeader';
import { ShieldCheck, MapPin, Zap, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const visions = [
  { icon: MapPin, title: 'Convenient', desc: 'Connecting you to instant printing solutions from just 5–10 minutes away from your location.' },
  { icon: CheckCircle2, title: 'Accessible', desc: 'Get 30 minutes searchable access to every verified printer in India.' },
  { icon: Zap, title: 'Effortless', desc: 'Find, compare, and order from anywhere in the country with a single platform.' },
  { icon: ShieldCheck, title: 'Secure & safe', desc: 'Strict verification and ranking rules mean results are reliable and trustworthy.' },
];

export default function VisionSection() {
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.vision-wrapper', {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true }
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="py-24 bg-brand-light px-6">
      <div className="max-w-screen-xl mx-auto">
        <SectionHeader 
          title="The Local Printer Vision" 
          subtitle="Everything you need to find, connect, and work with the best printing businesses near you."
        />
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visions.map((item, i) => (
            <div key={i} className="vision-wrapper h-full">
              <div 
                className="group relative overflow-hidden bg-white px-[24px] py-[28px] rounded-2xl border-[1.5px] border-[#e8eaed] flex flex-col items-start cursor-default transition-all duration-200 hover:-translate-y-1 hover:border-brand-orange hover:shadow-[0_12px_32px_rgba(232,75,22,0.1)] h-full"
              >
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-brand-orange transform scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100 z-0"></div>
                <div className="w-[52px] h-[52px] rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-6 transition-transform duration-200 group-hover:scale-105 relative z-10">
                  <item.icon className="w-6 h-6 text-brand-orange" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-extrabold text-brand-navy mb-3 relative z-10">
                  {item.title}
                </h3>
                <p className="text-[14px] text-brand-muted leading-relaxed relative z-10">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
