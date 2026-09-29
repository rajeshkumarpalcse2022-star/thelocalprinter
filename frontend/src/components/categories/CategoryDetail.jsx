'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sun, Moon } from 'lucide-react';

function useLPTheme() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('lp-theme') : null;
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('lp-theme', next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };
  return { theme, isDark: theme === 'dark', toggle };
}

function SectionHeading({ isDark, title, count }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-6 rounded-full bg-brand-orange shrink-0" />
      <h2 className={`text-[19px] md:text-[20px] font-extrabold ${isDark ? 'text-gray-100' : 'text-brand-navy'}`}>
        {title}
      </h2>
      {typeof count === 'number' && (
        <span className={`text-[13px] font-medium px-2.5 py-0.5 rounded-full ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-brand-orange/10 text-brand-orange'}`}>
          {count}
        </span>
      )}
    </div>
  );
}

function Chip({ isDark, children }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium border break-words ${
        isDark
          ? 'bg-gray-900 border-gray-800 text-gray-300'
          : 'bg-white border-brand-border text-brand-navy shadow-sm'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDark ? 'bg-brand-orange/60' : 'bg-brand-orange'}`} />
      <span className="min-w-0">{children}</span>
    </span>
  );
}

function Card({ isDark, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-brand-border'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Reveal({ children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      className="mb-10 md:mb-12 last:mb-0"
    >
      {children}
    </motion.section>
  );
}

export default function CategoryDetail({ content }) {
  const router = useRouter();
  const { isDark, toggle } = useLPTheme();

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/');
  };

  const renderBody = () => {
    switch (content.type) {
      case 'grouped-products':
      case 'service-groups':
      case 'stand-groups':
      case 'trend-groups':
        return (
          <div className="flex flex-col gap-10 md:gap-12">
            {content.groups.map((group) => (
              <Reveal key={group.title}>
                <SectionHeading isDark={isDark} title={group.title} count={group.items.length} />
                <div className="flex flex-wrap gap-2.5">
                  {group.items.map((item) => (
                    <Chip key={item} isDark={isDark}>{item}</Chip>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        );
      case 'service-deals':
        return (
          <Reveal>
            <SectionHeading isDark={isDark} title="Services & Machines" count={content.rows.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.rows.map((row) => (
                <Card key={row.name} isDark={isDark}>
                  <h3 className={`text-[15px] font-bold mb-1.5 break-words ${isDark ? 'text-gray-100' : 'text-brand-navy'}`}>
                    {row.name}
                  </h3>
                  <p className={`text-[13.5px] leading-relaxed break-words ${isDark ? 'text-gray-400' : 'text-brand-muted'}`}>
                    {row.deal}
                  </p>
                </Card>
              ))}
            </div>
          </Reveal>
        );
      case 'simple-list':
        return (
          <Reveal>
            <SectionHeading isDark={isDark} title="Services" count={content.items.length} />
            <div className="flex flex-wrap gap-2.5">
              {content.items.map((item) => (
                <Chip key={item} isDark={isDark}>{item}</Chip>
              ))}
            </div>
          </Reveal>
        );
      case 'comparison':
        return (
          <div className="flex flex-col gap-8">
            <Reveal>
              <Card isDark={isDark}>
                <p className={`text-[14.5px] leading-relaxed break-words ${isDark ? 'text-gray-300' : 'text-brand-navy'}`}>
                  {content.intro}
                </p>
              </Card>
            </Reveal>
            <Reveal>
              <SectionHeading isDark={isDark} title="Printing Method Comparison" />
              <div
                className={`overflow-x-auto rounded-2xl border shadow-sm ${
                  isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-brand-border'
                }`}
              >
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className={isDark ? 'bg-gray-800/60' : 'bg-brand-light'}>
                      {content.columns.map((col, i) => (
                        <th
                          key={col}
                          className={`px-4 py-3.5 text-[12px] font-bold uppercase tracking-wider whitespace-normal break-words ${
                            isDark ? 'text-gray-200' : 'text-brand-navy'
                          } ${i === 0 ? 'sticky left-0 z-10 min-w-[150px]' : 'min-w-[120px]'} ${
                            i === 0 ? (isDark ? 'bg-gray-800' : 'bg-brand-light') : ''
                          }`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {content.rows.map((row, ri) => (
                      <tr
                        key={row.feature}
                        className={`border-t ${isDark ? 'border-gray-800' : 'border-brand-border'} ${
                          ri % 2 === 1 ? (isDark ? 'bg-gray-800/30' : 'bg-brand-light/50') : ''
                        }`}
                      >
                        <th
                          className={`sticky left-0 z-10 px-4 py-3 text-[13.5px] font-bold break-words ${
                            isDark ? 'text-gray-100 bg-gray-900' : 'text-brand-navy bg-white'
                          } ${ri % 2 === 1 ? (isDark ? '!bg-gray-800' : '!bg-[#F1F3F6]') : ''}`}
                        >
                          {row.feature}
                        </th>
                        {row.values.map((val, vi) => (
                          <td
                            key={vi}
                            className={`px-4 py-3 text-[13.5px] break-words ${isDark ? 'text-gray-300' : 'text-brand-muted'}`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        );
      case 'bags-and-boxes':
        return (
          <div className="flex flex-col gap-10 md:gap-12">
            <div className="flex flex-col gap-10 md:gap-12">
              {content.bagGroups.map((group) => (
                <Reveal key={group.title}>
                  <SectionHeading isDark={isDark} title={group.title} count={group.items.length} />
                  <div className="flex flex-wrap gap-2.5">
                    {group.items.map((item) => (
                      <Chip key={item} isDark={isDark}>{item}</Chip>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <SectionHeading isDark={isDark} title={content.boxesTitle} count={content.boxes.length} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.boxes.map((box) => (
                  <Card key={box.name} isDark={isDark}>
                    <h3 className={`text-[15px] font-bold mb-1.5 ${isDark ? 'text-brand-orange' : 'text-brand-orange'}`}>
                      {box.name}
                    </h3>
                    <p className={`text-[13.5px] leading-relaxed break-words ${isDark ? 'text-gray-300' : 'text-brand-navy'}`}>
                      {box.description}
                    </p>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>
        );
      case 'product-grid':
        return (
          <Reveal>
            <SectionHeading isDark={isDark} title="Products" count={content.items.length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {content.items.map((item) => (
                <Card key={item} isDark={isDark} className="!p-4 text-center">
                  <p className={`text-[14px] font-semibold break-words ${isDark ? 'text-gray-100' : 'text-brand-navy'}`}>
                    {item}
                  </p>
                </Card>
              ))}
            </div>
          </Reveal>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-950' : 'bg-brand-light'} min-h-screen`}>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-[#1B3654] to-[#112338]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,81,22,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(244,81,22,0.05)_0%,transparent_50%)]" />
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 pt-6 pb-10 md:pt-8 md:pb-14 relative z-10">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 border border-white/15 text-white text-[13px] font-semibold hover:bg-white/20 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-white/50 mb-6">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-white/90 font-medium">Categories</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-brand-orange font-semibold break-words">{content.label}</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/15 border border-brand-orange/20 text-brand-orange text-[11px] font-bold tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
            Category Guide
          </div>
          <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-extrabold text-white leading-tight tracking-tight break-words">
            {content.label}
          </h1>
          {content.subtitle && (
            <p className="text-[15px] text-white/60 leading-relaxed mt-3 max-w-xl break-words">
              {content.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-10 md:py-14">
        {renderBody()}
      </div>

      {/* Fixed Theme Toggle - bottom right */}
      <button
        onClick={toggle}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-11 h-11 rounded-full shadow-lg border transition-all ${
          isDark
            ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700 hover:border-gray-600'
            : 'bg-white border-gray-200 text-brand-navy hover:bg-brand-light hover:border-brand-orange/30'
        }`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  );
}
