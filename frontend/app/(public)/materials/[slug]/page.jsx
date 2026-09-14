'use client';

import { use } from 'react';
import PageHero from '@/components/common/PageHero';
import BusinessCard from '@/components/directory/BusinessCard';
import { FileText, Shirt, Smartphone, Coffee, Package, Droplets, Diamond, Building2, PaintRoller, File, Milk, Flame, Inbox, Grip, Tag, Ruler, Wrench, PenTool, Box, Square, Waves, X, StickyNote, Type, FileBadge, Medal, Umbrella, Palette } from 'lucide-react';

const materialIcons = { 'Paper': FileText, 'T-shirt / Fabric': Shirt, 'Mobile Skins': Smartphone, 'Mug': Coffee, 'Pouch': Package, 'Water Bottle': Droplets, 'Acrylic': Diamond, 'ACP': Building2, 'Canvas': PaintRoller, 'Card': File, 'Dairy Packaging': Milk, 'Flex / Vinyl': Flame, 'Foam Board': Inbox, 'Frosted Glass': Grip, 'Labels': Tag, 'MDF': Ruler, 'Metal': Wrench, 'Pen': PenTool, 'Plastic': Box, 'Rexine': Square, 'Satin': Waves, 'SS Steel': X, 'Sticker': StickyNote, 'Texture': Type, 'Tiles': FileBadge, 'Trophy': Medal, 'Umbrella': Umbrella, 'Vinyl': Palette };

const allMaterials = ['Paper', 'T-shirt / Fabric', 'Mobile Skins', 'Mug', 'Pouch', 'Water Bottle', 'Acrylic', 'ACP', 'Canvas', 'Card', 'Dairy Packaging', 'Flex / Vinyl', 'Foam Board', 'Frosted Glass', 'Labels', 'MDF', 'Metal', 'Pen', 'Plastic', 'Rexine', 'Satin', 'SS Steel', 'Sticker', 'Texture', 'Tiles', 'Trophy', 'Umbrella', 'Vinyl'];

const mockBusinesses = [
  { id: '1', name: 'PrintRight Digital Studio', category: 'Digital Printing', area: 'Himayatnagar', city: 'Hyderabad', rating: 4.8, reviews: 142, verified: true },
];

export default function MaterialPage({ params }) {
  const { slug } = use(params);
  const materialName = decodeURIComponent(slug).replace(/-/g, ' ');
  const Icon = materialIcons[materialName] || FileText;

  return (
    <div className="bg-brand-light min-h-screen">
      <PageHero
        badge="PRINT ON"
        title={materialName}
        subtitle={`Find printers who work with ${materialName.toLowerCase()}.`}
      />
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-16">
        <div className="mb-12">
          <h2 className="text-[24px] font-extrabold text-brand-navy mb-6">All Materials</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {allMaterials.map((mat, i) => {
              const MatIcon = materialIcons[mat] || FileText;
              return <div key={i} className={`p-4 rounded-xl border cursor-pointer transition-all text-center flex flex-col items-center justify-center min-h-[100px] ${mat === materialName ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'bg-white border-brand-border hover:border-brand-orange hover:-translate-y-0.5'}`}>
                <MatIcon className={`w-5 h-5 mb-2 ${mat === materialName ? 'text-white' : 'text-brand-navy'}`} strokeWidth={1.5} />
                <span className={`text-[11px] font-semibold ${mat === materialName ? 'text-white' : 'text-brand-navy'}`}>{mat}</span>
              </div>;
            })}
          </div>
        </div>
        <h2 className="text-[24px] font-extrabold text-brand-navy mb-6">Top {materialName} Printing Businesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBusinesses.map(biz => <BusinessCard key={biz.id} business={biz} />)}
        </div>
        {mockBusinesses.length === 0 && <div className="text-center py-20 bg-white rounded-2xl border border-brand-border shadow-sm"><p className="text-[14px] text-brand-muted">No businesses found for this material.</p></div>}
      </div>
    </div>
  );
}
