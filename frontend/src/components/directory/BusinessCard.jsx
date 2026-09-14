import { MapPin, Phone, MessageCircle, Star, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

export default function BusinessCard({ business }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm hover:shadow-md hover:border-brand-orange/50 transition-all overflow-hidden flex flex-col h-full group">
      <div className="h-32 bg-brand-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
        {business.verified && (
          <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-bold text-brand-navy uppercase tracking-wider">Verified</span>
          </div>
        )}
      </div>
      <div className="p-5 flex-grow flex flex-col relative">
        <div className="w-14 h-14 bg-white rounded-lg border border-brand-border shadow-sm absolute -top-7 left-5 flex items-center justify-center p-1 z-20">
          <div className="w-full h-full bg-brand-light rounded-md flex items-center justify-center text-[10px] text-brand-muted text-center leading-tight">LOGO</div>
        </div>
        <div className="pt-8 flex-grow">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[18px] font-bold text-brand-navy leading-tight line-clamp-1 group-hover:text-brand-orange transition-colors">
              <Link href={`/search?q=${encodeURIComponent(business.name)}`} className="before:absolute before:inset-0">{business.name}</Link>
            </h3>
          </div>
          <div className="text-[13px] text-brand-orange font-semibold mb-3">{business.category}</div>
          <div className="flex items-center gap-1.5 text-brand-muted text-[13px] mb-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="line-clamp-1">{business.area}, {business.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-brand-muted text-[13px] mb-4">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            <span className="font-semibold text-brand-navy">{business.rating}</span>
            <span>({business.reviews} reviews)</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-brand-border relative z-30">
          <button className="flex-1 h-[40px] rounded-full border border-brand-border text-brand-navy text-[13px] font-bold hover:bg-brand-light transition-colors flex items-center justify-center gap-1.5"><Phone className="w-4 h-4" /> Call</button>
          <button className="flex-1 h-[40px] rounded-full bg-[#25D366]/10 text-[#25D366] text-[13px] font-bold hover:bg-[#25D366]/20 transition-colors flex items-center justify-center gap-1.5"><MessageCircle className="w-4 h-4" /> WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
