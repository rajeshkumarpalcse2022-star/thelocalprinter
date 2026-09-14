import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white pt-16 pb-8">
      <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="shrink-0 inline-block">
            <div className="flex items-center gap-2">
               <img src="/logo-white.webp" alt="Logo" className="w-[160px] h-auto" />
            </div>
          </Link>
          <p className="text-white/80 text-[14px] leading-relaxed pr-4">
            India&apos;s largest online directory for printing businesses. Find verified printing services near you.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[15px] font-bold mb-6 tracking-wide">Quick Links</h4>
          <ul className="flex flex-col gap-3 text-[14px] text-white/80">
            <li><Link href="/search" className="hover:text-brand-orange transition-colors">Search Businesses</Link></li>
            <li><Link href="/signup" className="hover:text-brand-orange transition-colors">List Your Business</Link></li>
            <li><Link href="/user/dashboard" className="hover:text-brand-orange transition-colors">My Listings</Link></li>
          </ul>
        </div>

        {/* Popular Categories */}
        <div>
          <h4 className="text-[15px] font-bold mb-6 tracking-wide">Popular Categories</h4>
          <ul className="flex flex-col gap-3 text-[14px] text-white/80">
            <li><Link href="/search?q=digital+printing" className="hover:text-brand-orange transition-colors">Digital Printing</Link></li>
            <li><Link href="/search?q=3d+printing" className="hover:text-brand-orange transition-colors">3D Printing</Link></li>
            <li><Link href="/search?q=dtf+printing" className="hover:text-brand-orange transition-colors">DTF Printing</Link></li>
            <li><Link href="/search?q=dtg+printing" className="hover:text-brand-orange transition-colors">DTG Printing</Link></li>
            <li><Link href="/search?q=textile+printing" className="hover:text-brand-orange transition-colors">Digital Textile Printing</Link></li>
            <li><Link href="/search?q=sign+boards" className="hover:text-brand-orange transition-colors">Sign Boards</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-[15px] font-bold mb-6 tracking-wide">Support</h4>
          <ul className="flex flex-col gap-3 text-[14px] text-white/80">
            <li><Link href="/about" className="hover:text-brand-orange transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-brand-orange transition-colors">Contact</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-brand-orange transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions" className="hover:text-brand-orange transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="max-w-screen-xl mx-auto px-6 pt-8 border-t border-white/10 text-center">
        <p className="text-[13px] text-white/60">
          &copy; 2026 The Local Printer. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
