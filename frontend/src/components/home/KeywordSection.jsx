'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flame, ShoppingBag, Megaphone, CalendarDays, Star, ChevronRight, ArrowRight } from 'lucide-react';
import { getActiveCategories } from '@/services/userService';

gsap.registerPlugin(ScrollTrigger);

const cardConfigs = [
  { icon: Flame, colorClass: 'text-[#FF5722]', hoverTextClass: 'group-hover/item:text-[#FF5722]', bgClass: 'bg-[#FF5722]/10', borderClass: 'border-[#FF5722]/30', hoverBorderClass: 'group-hover/card:border-[#FF5722]/50', hoverShadowClass: 'hover:shadow-[0_8px_30px_-4px_rgba(255,87,34,0.2)]' },
  { icon: ShoppingBag, colorClass: 'text-[#20C997]', hoverTextClass: 'group-hover/item:text-[#20C997]', bgClass: 'bg-[#20C997]/10', borderClass: 'border-[#20C997]/30', hoverBorderClass: 'group-hover/card:border-[#20C997]/50', hoverShadowClass: 'hover:shadow-[0_8px_30px_-4px_rgba(32,201,151,0.2)]' },
  { icon: Megaphone, colorClass: 'text-[#3B82F6]', hoverTextClass: 'group-hover/item:text-[#3B82F6]', bgClass: 'bg-[#3B82F6]/10', borderClass: 'border-[#3B82F6]/30', hoverBorderClass: 'group-hover/card:border-[#3B82F6]/50', hoverShadowClass: 'hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.2)]' },
  { icon: CalendarDays, colorClass: 'text-[#84CC16]', hoverTextClass: 'group-hover/item:text-[#84CC16]', bgClass: 'bg-[#84CC16]/10', borderClass: 'border-[#84CC16]/30', hoverBorderClass: 'group-hover/card:border-[#84CC16]/50', hoverShadowClass: 'hover:shadow-[0_8px_30px_-4px_rgba(132,204,22,0.2)]' },
  { icon: Star, colorClass: 'text-[#F472B6]', hoverTextClass: 'group-hover/item:text-[#F472B6]', bgClass: 'bg-[#F472B6]/10', borderClass: 'border-[#F472B6]/30', hoverBorderClass: 'group-hover/card:border-[#F472B6]/50', hoverShadowClass: 'hover:shadow-[0_8px_30px_-4px_rgba(244,114,182,0.2)]' },
];

const skeletonCards = [
  { title: 'LOADING...' },
  { title: 'LOADING...' },
  { title: 'LOADING...' },
  { title: 'LOADING...' },
  { title: 'LOADING...' },
];

function CategoryIcon({ image, fallbackIcon: FallbackIcon, colorClass, bgClass }) {
  if (image && image.trim()) {
    const isSvg = image.trim().startsWith('<');
    return (
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
        {isSvg ? (
          <div className={`w-6 h-6 [&>svg]:w-6 [&>svg]:h-6 ${colorClass}`} dangerouslySetInnerHTML={{ __html: image }} />
        ) : (
          <img src={image} alt="" className="w-6 h-6 object-contain" />
        )}
      </div>
    );
  }
  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
      <FallbackIcon className={`w-5 h-5 ${colorClass}`} strokeWidth={2.5} />
    </div>
  );
}

export default function KeywordSection() {
  const sectionRef = useRef(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveCategories()
      .then((res) => setCategories(res.data?.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.kw-card', { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true } });
    }, sectionRef);
    return () => ctx.revert();
  }, [categories]);

  const toggleExpand = (index) => { setExpandedCards(prev => ({ ...prev, [index]: !prev[index] })); };

  const displayCategories = loading
    ? skeletonCards
    : categories.length > 0
      ? categories.slice(0, 5).map((cat) => ({
          title: cat.name.toUpperCase(),
          slug: cat.slug,
          image: cat.image || '',
          items: (cat.services || []).map((sub) => ({ name: sub.name, slug: sub.slug, parentSlug: cat.slug })),
        }))
      : skeletonCards;

  return (
    <section ref={sectionRef} className="py-20 bg-brand-navy px-2 md:px-4">
      <div className="max-w-[1360px] mx-auto bg-[#F45116] backdrop-blur-md rounded-[22px] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] p-6 md:p-10 relative overflow-hidden transition-all duration-500">
        <div className="mb-12 relative flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/10 border border-white/20 text-white text-[10px] font-extrabold tracking-widest uppercase shadow-sm">BROWSE &amp; DISCOVER</span>
          </div>
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#fff] text-center tracking-tight leading-tight">Find Exactly What You Need</h2>
          <p className="text-[14px] text-white/90 text-center mt-3 max-w-xl font-medium">Explore categories to discover the perfect printing solution for you.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {displayCategories.map((category, i) => {
            const config = cardConfigs[i % cardConfigs.length];
            if (!config) return null;
            const isSkeleton = loading || !category.slug;
            return (
              <div key={i} className={`kw-card opacity-0 flex flex-col h-full bg-[#1F466B] rounded-xl border border-white/10 px-4 py-5 transition-all duration-300 hover:-translate-y-1 group/card ${config.hoverShadowClass} ${config.hoverBorderClass}`}>
                {isSkeleton ? (
                  <>
                    <div className="flex justify-center mb-4 shrink-0">
                      <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
                    </div>
                    <div className={`flex items-center justify-center w-full h-[38px] mb-4 pb-3 border-b shrink-0 ${config.borderClass}`}>
                      <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
                    </div>
                    <div className="flex-1 min-h-0 mb-2" style={{ maxHeight: '176px', overflow: 'hidden' }}>
                      <ul className="flex flex-col">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <li key={j} className="flex items-center h-[42px] px-0 border-b border-white/10">
                            <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="shrink-0 pt-1 flex justify-center">
                      <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Icon - fixed */}
                    <div className="flex justify-center mb-4 shrink-0">
                      <CategoryIcon image={category.image} fallbackIcon={config.icon} colorClass={config.colorClass} bgClass={config.bgClass} />
                    </div>
                    {/* Title - fixed, same height for all */}
                    <div className={`flex items-center justify-center w-full h-[38px] mb-4 pb-3 border-b shrink-0 ${config.borderClass}`}>
                      <h3 className={`text-[13px] font-extrabold uppercase tracking-wider text-center leading-snug line-clamp-1 ${config.colorClass}`}>{category.title}</h3>
                    </div>
                    {/* Subcategory area - fixed height, scrollable when expanded */}
                    <div className="flex-1 min-h-0 mb-2" style={expandedCards[i] || category.items.length <= 4 ? { overflow: 'auto' } : { maxHeight: '176px', overflow: 'hidden' }}>
                      <ul className="flex flex-col">
                        {(expandedCards[i] || category.items.length <= 4 ? category.items : category.items.slice(0, 4)).length > 0
                          ? (expandedCards[i] || category.items.length <= 4 ? category.items : category.items.slice(0, 4)).map((item, j) => {
                              const linkHref = category.slug && item.slug ? `/categories/${category.slug}/${item.slug}` : '#';
                              return (
                                <li key={j} className="flex items-center justify-between h-[42px] px-0 border-b border-white/10 text-[12px] font-semibold text-white/95 group/item hover:text-white transition-colors">
                                  <Link href={linkHref} className="flex items-center justify-between w-full h-full transition-colors group-hover/item:text-white truncate pr-2">
                                    <span className="transition-colors group-hover/item:text-white truncate pr-2">{item.name}</span>
                                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 text-white/30 transition-all duration-300 group-hover/item:translate-x-1 ${config.hoverTextClass}`} />
                                  </Link>
                                </li>
                              );
                            })
                          : (
                            <li className="flex items-center justify-center h-[42px] text-[12px] text-white/50 italic">No subcategories yet</li>
                          )}
                        {!expandedCards[i] && category.items.length > 4 && Array.from({ length: Math.max(0, 4 - category.items.length) }).map((_, j) => (
                          <li key={`empty-${j}`} className="h-[42px] border-b border-white/10" />
                        ))}
                      </ul>
                    </div>
                    {/* View All button - fixed bottom */}
                    <div className="shrink-0 pt-1 flex justify-center">
                      <button onClick={() => toggleExpand(i)} className={`inline-flex items-center gap-1.5 text-[12px] font-bold transition-all duration-300 ${config.colorClass} ${category.items.length > 4 ? 'hover:brightness-125 hover:gap-2 cursor-pointer' : 'invisible pointer-events-none'}`}>
                        {expandedCards[i] ? 'View Less' : 'View All'}
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedCards[i] ? '-rotate-90' : ''}`} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
