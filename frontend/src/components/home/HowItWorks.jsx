'use client';

import SectionHeader from '../common/SectionHeader';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { num: '1', title: 'Click "Near Me"', desc: 'Allow location once — we pinpoint you instantly using GPS.' },
  { num: '2', title: 'GPS locates you', desc: 'We calculate real distance to every verified business nearby.' },
  { num: '3', title: 'See results in 5 km', desc: 'Only printers within your chosen radius — sorted nearest first.' },
  { num: '4', title: 'Contact directly', desc: 'Call, WhatsApp, or visit. GPS-verified so you always find the right place.' },
];

export default function HowItWorks() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: containerRef.current, start: 'top 80%', once: true }
      });
      tl.to('.timeline-line', { scaleX: 1, duration: 1, ease: 'power2.inOut', transformOrigin: 'left center' });
      tl.from('.step-item', { y: 20, opacity: 0, duration: 0.5, stagger: 0.2, ease: 'power2.out' }, "-=0.5");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="py-24 bg-brand-light px-6 overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        <SectionHeader 
          badge="HOW IT WORKS" 
          title="Finding a Printer in 4 Steps" 
          subtitle="No account needed. No subscription. Completely free for customers."
        />
        
        <div ref={containerRef} className="relative mt-20 max-w-5xl mx-auto">
          <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-brand-orange/20 z-0">
            <div className="timeline-line absolute top-0 left-0 w-full h-full bg-brand-orange scale-x-0 origin-left"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="step-item flex flex-col items-center text-center">
                <div className="relative w-[56px] h-[56px] rounded-full bg-brand-navy text-white flex items-center justify-center text-[20px] font-bold mb-8 ring-[2px] ring-brand-orange ring-offset-[5px] ring-offset-brand-light">
                  {step.num}
                </div>
                <h4 className="text-[16px] font-bold text-brand-navy mb-2">{step.title}</h4>
                <p className="text-[13px] text-brand-muted leading-relaxed px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
