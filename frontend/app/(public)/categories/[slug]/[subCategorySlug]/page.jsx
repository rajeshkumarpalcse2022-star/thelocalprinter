'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import PageHero from '@/components/common/PageHero';
import UserBusinessCard from '@/components/user/UserBusinessCard';
import { ChevronRight } from 'lucide-react';
import { getActiveCategories } from '@/services/userService';
import { getSavedCity, onSavedLocationChange } from '@/lib/savedLocation';
import api from '@/services/api';

export default function SubCategoryPage({ params }) {
  const { slug, subCategorySlug } = use(params);
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bizLoading, setBizLoading] = useState(true);
  const [savedCity, setSavedCity] = useState('');

  useEffect(() => {
    getActiveCategories()
      .then((res) => setCategories(res.data?.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const parentCategory = categories.find((c) => c.slug === slug);
  const subCategory = parentCategory?.services?.find((s) => s.slug === subCategorySlug);

  // Listings follow the saved location (auto-detected or typed by the visitor)
  // and refetch whenever it changes.
  useEffect(() => {
    setSavedCity(getSavedCity());
    return onSavedLocationChange(({ city }) => setSavedCity(city));
  }, []);

  useEffect(() => {
    if (!subCategory?._id) return;
    setBizLoading(true);
    const params = { serviceId: subCategory._id, limit: 12 };
    if (savedCity) params.city = savedCity;
    api.get(`/user/public/businesses`, { params })
      .then((res) => setBusinesses(res.data?.data?.businesses || []))
      .catch(() => setBusinesses([]))
      .finally(() => setBizLoading(false));
  }, [subCategory?._id, savedCity]);

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

        <h2 className="text-[24px] font-extrabold text-brand-navy mb-6">
          {bizLoading
            ? 'Loading...'
            : `${subcategoryName} Businesses (${businesses.length})${savedCity ? ` in ${savedCity}` : ''}`}
        </h2>
        {bizLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-brand-border h-[280px] animate-pulse" />
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => <UserBusinessCard key={biz._id} business={biz} detailHref={`/businesses/${biz._id}`} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-brand-border shadow-sm">
            <img src="/data-not-found.png" alt="No Data Found" className="mb-4 h-48 w-48 object-contain" />
            <h3 className="mb-1 text-base font-semibold text-brand-navy">No Data Found in Database</h3>
            <p className="max-w-xs text-sm text-brand-muted">
              {savedCity
                ? `No approved businesses yet for ${subcategoryName} in ${savedCity}. Change your location from the search bar above.`
                : `No approved businesses yet for ${subcategoryName}. Check back soon!`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
