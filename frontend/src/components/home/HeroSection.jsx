'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  MapPin, 
  Briefcase, 
  Printer, 
  Store, 
  Copy, 
  LayoutTemplate, 
  Shirt, 
  Package, 
  Megaphone, 
  Presentation, 
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import StatsStrip from '@/components/home/StatsStrip';
import Button from '@/components/common/Button'; 

const categories = [
  { name: 'Digital Printing', icon: Printer, href: '/search?q=digital+printing' },
  { name: 'Print Shop', icon: Store, href: '/search?q=print+shop' },
  { name: 'Xerox Shop', icon: Copy, href: '/search?q=xerox+shop' },
  { name: 'Sign Boards', icon: LayoutTemplate, href: '/search?q=sign+boards' },
  { name: 'T shirt', icon: Shirt, href: '/search?q=t+shirt' },
  { name: 'Packaging', icon: Package, href: '/search?q=packaging' },
  { name: 'Marketing Materials', icon: Megaphone, href: '/search?q=marketing+materials' },
  { name: 'Display Stands', icon: Presentation, href: '/search?q=display+stands' },
  { name: 'Instagram Trending', icon: TrendingUp, href: '/search?q=instagram+trending' }
];

export default function HeroSection() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-element', {
        y: 25,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="bg-[radial-gradient(ellipse_at_top,#2E517A_0%,#1B3654_50%,#112338_100%)] min-h-[calc(100vh-84px)] w-full flex flex-col relative overflow-hidden"
    >
      <div className="absolute bottom-0 left-0 w-full h-[400px] bg-[radial-gradient(ellipse_at_bottom,#F45116_0%,transparent_65%)] opacity-40 pointer-events-none z-0"></div>

      <div className="flex-1 flex flex-col justify-center items-center w-full px-4 pt-[120px] pb-16 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center w-full mt-4 md:mt-0">
          
          <h1 className="hero-element text-[38px] sm:text-[48px] md:text-[56px] font-extrabold text-white tracking-tight mb-4 leading-[1.15]">
            Find Direct <span className="text-brand-orange">Local Printers</span>,<br className="hidden md:block" />
            for any <span className="text-brand-orange">Customization</span> Near You.
          </h1>
          
          <p className="hero-element text-white/80 text-[15px] md:text-[16px] max-w-[700px] mx-auto mb-8 font-normal leading-relaxed">
            <span className="font-semibold text-white">No Mediator, No Freelancer, No Agency so direct reach.</span><br className="hidden sm:block" /> 
            Connecting you to instant printing solutions from nearby verified businesses — fast, effortless, and cost-effective.
          </p>

          <div className="hero-element flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10 w-full sm:w-auto">
            <Button
              href="/search"
              icon={MapPin}
              iconPosition="left"
              className="w-full sm:w-auto h-[48px] px-7 rounded-full bg-brand-orange text-white text-[14px] font-semibold hover:bg-[#E04812] transition-colors shadow-md shadow-brand-orange/20"
            >
              Find Printers Near Me
            </Button>

            <Button 
              href="/signup" 
              icon={Briefcase}
              iconPosition="left"
              className="w-full sm:w-auto h-[48px] px-7 rounded-full bg-white/[0.05] border border-white/20 text-white text-[14px] font-semibold hover:bg-white/10 hover:border-white/30 transition-all"
            >
              List My Business
            </Button>
          </div>

          <div className="hero-element flex flex-wrap justify-center items-center gap-2.5 max-w-3xl">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.12] text-white/90 text-[13px] font-medium hover:bg-white/[0.12] hover:border-white/25 hover:text-white transition-all"
                >
                  <Icon className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full relative z-20 mt-auto">
        <StatsStrip />
      </div>
    </section>
  );
}
