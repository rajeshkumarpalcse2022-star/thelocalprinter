'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sun, Moon, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getGuideRows, addGuideRow, deleteGuideRow } from '@/services/guideService';

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
  const { user } = useAuth();
  const { isDark, toggle } = useLPTheme();

  const isAdmin = user?.role === 'ADMIN';
  const columns = content.columns || [];
  const [guideRows, setGuideRows] = useState([]);
  const [showAddRow, setShowAddRow] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [valueInputs, setValueInputs] = useState({});
  const [savingRow, setSavingRow] = useState(false);
  const [deletingRow, setDeletingRow] = useState(null);
  const [rowError, setRowError] = useState('');

  const isComparison = content.type === 'comparison';
  const allRows = [...(content.rows || []), ...guideRows];

  useEffect(() => {
    if (!isComparison || !content.slug) return undefined;
    let cancelled = false;
    getGuideRows(content.slug)
      .then((res) => {
        if (!cancelled) setGuideRows(res?.data?.rows || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isComparison, content.slug]);

  // "Excellent" typed by an admin is rendered with a star automatically.
  const formatCellValue = (value) => {
    const text = (value ?? '').toString().trim();
    if (!text) return '';
    return /^excellent$/i.test(text) ? `\u2b50 ${text}` : text;
  };

  const resetAddRow = () => {
    setFeatureInput('');
    setValueInputs({});
    setRowError('');
    setShowAddRow(false);
  };

  const handleAddRow = async () => {
    const feature = featureInput.trim();
    if (!feature) {
      setRowError('Feature name is required');
      return;
    }
    const values = columns.slice(1).map((col) => (valueInputs[col] || '').trim());
    setSavingRow(true);
    setRowError('');
    try {
      const res = await addGuideRow(content.slug, { feature, values });
      const row = res?.data?.row;
      if (row) setGuideRows((prev) => [...prev, row]);
      resetAddRow();
    } catch (err) {
      setRowError(err.response?.data?.message || 'Failed to add row');
    } finally {
      setSavingRow(false);
    }
  };

  const handleDeleteRow = async (id) => {
    setDeletingRow(id);
    setRowError('');
    try {
      await deleteGuideRow(content.slug, id);
      setGuideRows((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setRowError(err.response?.data?.message || 'Failed to delete row');
    } finally {
      setDeletingRow(null);
    }
  };

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
                    {allRows.map((row, ri) => (
                      <tr
                        key={row._id ? `custom-${row._id}` : `base-${row.feature || ri}`}
                        className={`border-t ${isDark ? 'border-gray-800' : 'border-brand-border'} ${
                          ri % 2 === 1 ? (isDark ? 'bg-gray-800/30' : 'bg-brand-light/50') : ''
                        }`}
                      >
                        <th
                          className={`sticky left-0 z-10 px-4 py-3 text-[13.5px] font-bold break-words ${
                            isDark ? 'text-gray-100 bg-gray-900' : 'text-brand-navy bg-white'
                          } ${ri % 2 === 1 ? (isDark ? '!bg-gray-800' : '!bg-[#F1F3F6]') : ''}`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="min-w-0 break-words">{row.feature}</span>
                            {isAdmin && row._id && (
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row._id)}
                                disabled={deletingRow === row._id}
                                title="Delete this row"
                                aria-label={`Delete ${row.feature}`}
                                className="shrink-0 rounded-lg p-1.5 text-red-500/70 transition-colors hover:bg-red-500/10 hover:text-red-500"
                              >
                                {deletingRow === row._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </span>
                        </th>
                        {columns.slice(1).map((col, vi) => (
                          <td
                            key={col}
                            className={`px-4 py-3 text-[13.5px] break-words ${isDark ? 'text-gray-300' : 'text-brand-muted'}`}
                          >
                            {formatCellValue((row.values || [])[vi])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Admin only — add / manage guide rows */}
              {isAdmin && (
                <div
                  className={`mt-4 rounded-2xl border p-4 ${
                    isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-brand-border'
                  }`}
                >
                  {!showAddRow ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddRow(true);
                        setRowError('');
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-3 text-[14px] font-bold text-white transition-colors hover:bg-brand-orange/90 sm:w-auto"
                    >
                      <Plus className="h-4 w-4" /> Add Row
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p
                        className={`text-[13px] font-semibold ${
                          isDark ? 'text-gray-300' : 'text-brand-navy'
                        }`}
                      >
                        New comparison row
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <input
                          type="text"
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          placeholder="Feature name"
                          className={`w-full rounded-xl border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-brand-orange ${
                            isDark
                              ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500'
                              : 'bg-white border-brand-border text-brand-navy placeholder:text-gray-400'
                          }`}
                        />
                        {columns.slice(1).map((col) => (
                          <input
                            key={col}
                            type="text"
                            value={valueInputs[col] || ''}
                            onChange={(e) =>
                              setValueInputs((prev) => ({ ...prev, [col]: e.target.value }))
                            }
                            placeholder={col}
                            className={`w-full rounded-xl border px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-brand-orange ${
                              isDark
                                ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500'
                                : 'bg-white border-brand-border text-brand-navy placeholder:text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      {rowError && <p className="text-[13px] font-medium text-red-500">{rowError}</p>}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddRow}
                          disabled={savingRow}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-brand-orange/90 disabled:opacity-60"
                        >
                          {savingRow ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          {savingRow ? 'Adding...' : 'Add Row'}
                        </button>
                        <button
                          type="button"
                          onClick={resetAddRow}
                          className={`rounded-xl border px-4 py-2.5 text-[14px] font-bold transition-colors ${
                            isDark
                              ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                              : 'border-brand-border text-brand-navy hover:bg-brand-light'
                          }`}
                        >
                          Cancel
                        </button>
                        <span
                          className={`text-[12px] leading-relaxed ${
                            isDark ? 'text-gray-500' : 'text-brand-muted'
                          }`}
                        >
                          Type &ldquo;Excellent&rdquo; to add &#11088; automatically. Add as many
                          rows as you need.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
