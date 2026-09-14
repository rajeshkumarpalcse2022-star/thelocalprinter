import PageHero from '@/components/common/PageHero';
import Link from 'next/link';

export const metadata = { title: "Privacy Policy | The Local Printer", description: "Privacy Policy for The Local Printer." };

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full bg-brand-light">
      <PageHero
        badge="LEGAL"
        title={<>Privacy <span className="text-brand-orange">Policy</span></>}
        subtitle="Your privacy is important to us."
      />
      <section className="py-24 px-6 bg-white">
        <div className="max-w-screen-md mx-auto prose prose-slate">
          <p className="text-[14px] text-brand-muted">Effective Date: January 1, 2024</p>
          <p className="text-[15px] text-brand-muted leading-relaxed">The Local Printer (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;) operates the thelocalprinter.com website. This page informs you of our policies regarding the collection, use, and disclosure of personal information when you use our Service.</p>
          <h3 className="text-[20px] font-bold text-brand-navy">Information Collection</h3>
          <p className="text-[15px] text-brand-muted leading-relaxed">We collect information you provide directly to us, such as when you create an account, list a business, or contact us. This may include your name, email address, phone number, and business details.</p>
          <h3 className="text-[20px] font-bold text-brand-navy">Use of Information</h3>
          <p className="text-[15px] text-brand-muted leading-relaxed">We use the information to provide and improve our services, to process transactions, to send periodic emails, and to provide you with information about products or services we believe may interest you.</p>
          <h3 className="text-[20px] font-bold text-brand-navy">Security</h3>
          <p className="text-[15px] text-brand-muted leading-relaxed">The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.</p>
          <p className="text-[15px] text-brand-muted leading-relaxed">If you have any questions about this Privacy Policy, please contact us.</p>
        </div>
      </section>
    </div>
  );
}
