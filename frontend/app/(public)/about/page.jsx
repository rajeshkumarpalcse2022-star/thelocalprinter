import PageHero from '@/components/common/PageHero';
import StatsStrip from '@/components/home/StatsStrip';
import SectionHeader from '@/components/common/SectionHeader';
import HowItWorks from '@/components/home/HowItWorks';
import { MapPin, CheckCircle, Search, Shield, Zap, TrendingUp, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: "About The Local Printer | India's GPS Verified Print Directory",
  description: "Learn why we built India's first hyperlocal GPS-verified print directory.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-brand-light">
      <PageHero
        badge={<div className="flex items-center justify-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />INDIA&apos;S LARGEST GPS-VERIFIED PRINTING DIRECTORY</div>}
        title={<span>About <span className="text-brand-orange">The Local Printer</span></span>}
        subtitle="We&apos;re on a mission to connect every Indian business and individual with the nearest, most trusted printing professionals."
        buttons={<>
          <Link href="/search" className="w-full sm:w-auto h-[48px] flex items-center justify-center gap-2 px-7 rounded-full bg-brand-orange text-white text-[14px] font-semibold hover:bg-[#E04812] transition-colors shadow-md shadow-brand-orange/20"><MapPin className="w-[18px] h-[18px]" />Find Printers Near Me</Link>
          <Link href="/contact" className="w-full sm:w-auto h-[48px] flex items-center justify-center gap-2 px-7 rounded-full bg-white/[0.05] border border-white/20 text-white text-[14px] font-semibold hover:bg-white/10 hover:border-white/30 transition-all"><Mail className="w-[18px] h-[18px]" />Get in Touch</Link>
        </>}
      />
      <StatsStrip />
      <section className="py-24 px-6 bg-white">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeader badge="WHO WE ARE" title="Built for India&apos;s Print Community" />
            <div className="text-brand-muted text-[15px] leading-relaxed space-y-6 max-w-lg mt-[-2rem]">
              <p>The printing industry in India is vast and fragmented. Finding the right printer has always been a mix of guesswork and endless calls.</p>
              <p>We built The Local Printer to change that. By combining GPS technology with a strict verification system, we ensure that you find reliable printers right in your neighborhood within seconds.</p>
              <p>For print businesses, it&apos;s a powerful tool to be discovered by customers who are already looking for their specific services nearby.</p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="group relative overflow-hidden bg-brand-light p-8 rounded-2xl border-[1.5px] border-[#e8eaed] hover:border-brand-orange hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(232,75,22,0.1)] transition-all duration-200 cursor-default flex flex-col items-start">
              <div className="absolute bottom-0 left-0 w-full h-[4px] bg-brand-orange transform scale-x-0 origin-left transition-transform duration-200 ease-in-out group-hover:scale-x-100 z-0"></div>
              <MapPin className="w-8 h-8 text-brand-orange mb-4 relative z-10 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
              <h3 className="text-[18px] font-bold text-brand-navy mb-2 relative z-10">GPS-First Platform</h3>
              <p className="text-[14px] text-brand-muted leading-relaxed relative z-10">Proximity is everything. Our core algorithm is location-based.</p>
            </div>
            <div className="group relative overflow-hidden bg-brand-light p-8 rounded-2xl border-[1.5px] border-[#e8eaed] hover:border-brand-orange hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(232,75,22,0.1)] transition-all duration-200 cursor-default flex flex-col items-start">
              <div className="absolute bottom-0 left-0 w-full h-[4px] bg-brand-orange transform scale-x-0 origin-left transition-transform duration-200 ease-in-out group-hover:scale-x-100 z-0"></div>
              <CheckCircle className="w-8 h-8 text-brand-orange mb-4 relative z-10 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
              <h3 className="text-[18px] font-bold text-brand-navy mb-2 relative z-10">Verified Listings</h3>
              <p className="text-[14px] text-brand-muted leading-relaxed relative z-10">Every listing marked &apos;Verified&apos; has passed our authentication checks.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 px-6 bg-brand-navy">
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="OUR PURPOSE" title="Why We Built This" lightText={true} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[{ icon: Search, title: 'Hyperlocal Discovery', desc: 'Find what is within your 5km radius first.' }, { icon: Zap, title: 'Eliminate Middlemen', desc: 'Direct contact guarantees the best price.' }, { icon: TrendingUp, title: 'Empower Local Business', desc: 'We give small print shops online visibility.' }, { icon: Shield, title: 'Privacy by Default', desc: 'Contact shops directly without sharing your number.' }].map((item, i) => (
              <div key={i} className="group relative overflow-hidden bg-white/5 border-[1.5px] border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(232,75,22,0.15)] transition-all duration-200 cursor-default flex flex-col items-start">
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-brand-orange transform scale-x-0 origin-left transition-transform duration-200 ease-in-out group-hover:scale-x-100 z-0"></div>
                <item.icon className="w-8 h-8 text-brand-orange mb-5 relative z-10 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
                <h4 className="text-[17px] font-bold text-white mb-2 relative z-10">{item.title}</h4>
                <p className="text-[14px] text-white/70 leading-relaxed relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <HowItWorks />
      <section className="bg-brand-orange py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[32px] md:text-[40px] font-extrabold text-white mb-8">Ready to Find Your Nearest Printer?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/search" className="h-[52px] px-8 rounded-full bg-white text-brand-orange font-bold hover:bg-brand-light transition-colors shadow-lg flex items-center justify-center">Find Printers Near Me</Link>
            <Link href="/signup" className="h-[52px] px-8 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center">List My Business</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
