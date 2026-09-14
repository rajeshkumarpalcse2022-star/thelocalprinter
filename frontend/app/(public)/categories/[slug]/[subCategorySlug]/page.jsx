'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import PageHero from '@/components/common/PageHero';
import BusinessCard from '@/components/directory/BusinessCard';
import { ChevronRight } from 'lucide-react';
import { getActiveCategories } from '@/services/userService';
import api from '@/services/api';

export default function SubCategoryPage({ params }) {
  const { slug, subCategorySlug } = use(params);
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bizLoading, setBizLoading] = useState(true);

  useEffect(() => {
    getActiveCategories()
      .then((res) => setCategories(res.data?.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const parentCategory = categories.find((c) => c.slug === slug);
  const subCategory = parentCategory?.services?.find((s) => s.slug === subCategorySlug);

  useEffect(() => {
    if (!subCategory?._id) return;
    setBizLoading(true);
    api.get(`/user/public/businesses`, { params: { serviceId: subCategory._id, limit: 12 } })
      .then((res) => setBusinesses(res.data?.data?.businesses || []))
      .catch(() => setBusinesses([]))
      .finally(() => setBizLoading(false));
  }, [subCategory?._id]);

  if (!loading && !parentCategory) {
    return (
      <div className="bg-brand-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[28px] font-extrabold text-brand-navy mb-4">Category Not Found</h1>
          <Link href="/categories" className="text-brand-orange font-bold hover:underline">Browse All Categories</Link>
        </div>
      </div>
    );
  }

  if (!loading && parentCategory && !subCategory) {
    return (
      <div className="bg-brand-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[28px] font-extrabold text-brand-navy mb-4">Subcategory Not Found</h1>
          <Link href={`/categories/${slug}`} className="text-brand-orange font-bold hover:underline">Back to {parentCategory.name}</Link>
        </div>
      </div>
    );
  }

  const subcategoryName = subCategory?.name || decodeURIComponent(subCategorySlug).replace(/-/g, ' ');
  const categoryName = parentCategory?.name || decodeURIComponent(slug).replace(/-/g, ' ');

  return (
    <div className="bg-brand-light min-h-screen">
      <PageHero
        badge="BROWSE BY SUBCATEGORY"
        title={subcategoryName}
        subtitle={`Find the best ${subcategoryName.toLowerCase()} services near you.`}
      />
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-16">
        <nav className="flex items-center gap-2 text-[14px] text-brand-muted mb-8">
          <Link href="/" className="hover:text-brand-orange transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/categories/${slug}`} className="hover:text-brand-orange transition-colors">{categoryName}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-navy font-semibold">{subcategoryName}</span>
        </nav>

        {parentCategory && parentCategory.services && parentCategory.services.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[20px] font-extrabold text-brand-navy mb-4">Other Subcategories in {categoryName}</h2>
            <div className="bg-white rounded-2xl border border-brand-border shadow-sm divide-y divide-brand-border">
              {parentCategory.services.map((sub) => (
                <Link
                  key={sub._id}
                  href={`/categories/${slug}/${sub.slug}`}
                  className={`flex items-center justify-between px-6 py-4 transition-colors group ${sub.slug === subCategorySlug ? 'bg-brand-orange/5 border-l-4 border-l-brand-orange' : 'hover:bg-brand-light'}`}
                >
                  <span className={`text-[15px] font-semibold transition-colors ${sub.slug === subCategorySlug ? 'text-brand-orange' : 'text-brand-navy group-hover:text-brand-orange'}`}>{sub.name}</span>
                  <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-orange transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-[24px] font-extrabold text-brand-navy mb-6">
          {bizLoading ? 'Loading...' : `${subcategoryName} Businesses (${businesses.length})`}
        </h2>
        {bizLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-brand-border h-[280px] animate-pulse" />
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => <BusinessCard key={biz._id} business={biz} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-brand-border shadow-sm">
            <p className="text-[14px] text-brand-muted">No businesses found for this subcategory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
