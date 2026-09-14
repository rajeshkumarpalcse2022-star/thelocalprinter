'use client';

export default function FilterSidebar() {
  const categories = ['Digital Printing', 'Offset Printing', 'Large Format', '3D Printing', 'Packaging'];
  const materials = ['Paper', 'Vinyl', 'Acrylic', 'Fabric', 'Metal'];

  return (
    <aside className="w-full bg-white rounded-2xl border border-brand-border p-6 h-fit sticky top-[100px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[16px] font-bold text-brand-navy">Filters</h2>
        <button className="text-[12px] font-bold text-brand-orange hover:underline">Clear All</button>
      </div>
      <div className="mb-8 border-b border-brand-border pb-6">
        <h3 className="text-[13px] font-bold text-brand-navy uppercase tracking-wider mb-4">Distance</h3>
        <input type="range" min="1" max="50" defaultValue="10" className="w-full accent-brand-orange" />
        <div className="flex justify-between text-[12px] text-brand-muted mt-2 font-medium"><span>1 km</span><span>10 km</span><span>50 km</span></div>
      </div>
      <div className="mb-8 border-b border-brand-border pb-6 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-brand-border text-brand-orange focus:ring-brand-orange" /><span className="text-[14px] text-brand-navy font-medium group-hover:text-brand-orange transition-colors">Verified Only</span></label>
        <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-brand-border text-brand-orange focus:ring-brand-orange" /><span className="text-[14px] text-brand-navy font-medium group-hover:text-brand-orange transition-colors">Open Now</span></label>
      </div>
      <div className="mb-8 border-b border-brand-border pb-6">
        <h3 className="text-[13px] font-bold text-brand-navy uppercase tracking-wider mb-4">Category</h3>
        <div className="space-y-3">{categories.map((cat, i) => (<label key={i} className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-brand-border text-brand-orange focus:ring-brand-orange" /><span className="text-[14px] text-brand-muted group-hover:text-brand-navy transition-colors">{cat}</span></label>))}</div>
      </div>
      <div>
        <h3 className="text-[13px] font-bold text-brand-navy uppercase tracking-wider mb-4">Materials</h3>
        <div className="space-y-3">{materials.map((mat, i) => (<label key={i} className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 rounded border-brand-border text-brand-orange focus:ring-brand-orange" /><span className="text-[14px] text-brand-muted group-hover:text-brand-navy transition-colors">{mat}</span></label>))}</div>
      </div>
    </aside>
  );
}
