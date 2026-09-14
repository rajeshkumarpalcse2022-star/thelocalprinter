import PageHero from '@/components/common/PageHero';
import Link from 'next/link';

export const metadata = { title: "Terms & Conditions | The Local Printer", description: "Terms and Conditions for The Local Printer." };

export default function TermsPage() {
  return (
    <div className="flex flex-col w-full bg-brand-light">
      <PageHero
        badge="LEGAL"
        title={<>Terms & <span className="text-brand-orange">Conditions</span></>}
        subtitle="Please read these terms carefully before using our service."
      />
      <section className="py-24 px-6 bg-white">
        <div className="max-w-screen-md mx-auto prose prose-slate">
          <p className="text-[14px] text-brand-muted">Effective Date: January 1, 2024</p>
          <p className="text-[15px] text-brand-muted leading-relaxed">Welcome to The Local Printer. By accessing or using our website and services, you agree to be bound by these Terms and Conditions.</p>
          <h3 className="text-[20px] font-bold text-brand-navy">Use of Service</h3>
          <p className="text-[15px] text-brand-muted leading-relaxed">You may use our service only for lawful purposes and in accordance with these Terms. You agree not to use the service in any way that could damage, disable, overburden, or impair the service.</p>
          <h3 className="text-[20px] font-bold text-brand-navy">User Accounts</h3>
          <p className="text-[15px] text-brand-muted leading-relaxed">You are responsible for safeguarding the password that you use to access the service. You agree not to disclose your password to any third party.</p>
          <h3 className="text-[20px] font-bold text-brand-navy">Business Listings</h3>
          <p className="text-[15px] text-brand-muted leading-relaxed">Businesses listed on our platform are solely responsible for the accuracy of their information. The Local Printer does not guarantee the accuracy of any listing.</p>
          <h3 className="text-[20px] font-bold text-brand-navy">Limitation of Liability</h3>
          <p className="text-[15px] text-brand-muted leading-relaxed">In no event shall The Local Printer be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
          <p className="text-[15px] text-brand-muted leading-relaxed">If you have any questions about these Terms, please contact us.</p>
        </div>
      </section>
    </div>
  );
}
