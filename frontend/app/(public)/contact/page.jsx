'use client';

import { useState } from 'react';
import PageHero from '@/components/common/PageHero';
import ContactStrip from '@/components/contact/ContactStrip';
import SectionHeader from '@/components/common/SectionHeader';
import BusinessCTA from '@/components/home/BusinessCTA';
import { Phone, Mail, MapPin, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ success: false, message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ success: false, message: '' });

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: `Phone: ${formData.phone}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ success: true, message: 'Message sent successfully! We will get back to you soon.' });
        setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ success: false, message: data.error || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      setStatus({ success: false, message: 'An error occurred. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>Contact The Local Printer | Connect With Verified Indian Printers</title>
      <meta name="description" content="Contact India's GPS-verified print directory. Reach out to list your print business, update your local listing information, or submit support requests." />

      <div className="flex flex-col w-full bg-brand-light">
        <PageHero 
          badge="WE'D LOVE TO HEAR FROM YOU"
          title={<span>Get in <span className="text-brand-orange">Touch</span><br/>With Us</span>}
          subtitle="Have a question, suggestion, or want to list your printing business? Reach out — we typically respond within 24 hours."
          buttons={
            <>
              <a href="tel:+918008886365" className="h-[48px] px-8 rounded-full bg-brand-orange text-white font-medium hover:bg-[#E04812] transition flex items-center gap-2">
                <Phone className="w-4 h-4" /> Call Us Now
              </a>
              <a href="mailto:info@thelocalprinter.com" className="h-[48px] px-8 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Us
              </a>
            </>
          }
        />
        <ContactStrip />

        <section className="py-24 px-6 bg-white">
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Form Section */}
            <div className="bg-white">
               <SectionHeader badge="SEND A MESSAGE" title="Write to Us" subtitle="Fill in the form and we'll get back to you within one business day." />
               
               {status.message && (
                 <div className={`p-4 mb-6 rounded-lg text-[14px] font-medium ${status.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                   {status.message}
                 </div>
               )}

               <form onSubmit={handleSubmit} className="mt-[-1rem] space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[12px] font-bold text-brand-navy mb-1.5 ml-1">Your Name*</label>
                     <input 
                       type="text" 
                       name="name"
                       value={formData.name}
                       onChange={handleChange}
                       required 
                       placeholder="Enter your full name" 
                       className="w-full h-[48px] px-4 rounded-lg border border-brand-border bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-[14px]" 
                     />
                   </div>
                   <div>
                     <label className="block text-[12px] font-bold text-brand-navy mb-1.5 ml-1">Phone Number*</label>
                     <input 
                       type="tel" 
                       name="phone"
                       value={formData.phone}
                       onChange={handleChange}
                       required 
                       placeholder="Enter your phone number" 
                       className="w-full h-[48px] px-4 rounded-lg border border-brand-border bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-[14px]" 
                     />
                   </div>
                 </div>
                 <div>
                   <label className="block text-[12px] font-bold text-brand-navy mb-1.5 ml-1">Email Address*</label>
                   <input 
                     type="email" 
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     required 
                     placeholder="Enter your email" 
                     className="w-full h-[48px] px-4 rounded-lg border border-brand-border bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-[14px]" 
                   />
                 </div>
                 <div>
                   <label className="block text-[12px] font-bold text-brand-navy mb-1.5 ml-1">Subject</label>
                   <input 
                     type="text" 
                     name="subject"
                     value={formData.subject}
                     onChange={handleChange}
                     placeholder="What is this regarding?" 
                     className="w-full h-[48px] px-4 rounded-lg border border-brand-border bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-[14px]" 
                   />
                 </div>
                 <div>
                   <label className="block text-[12px] font-bold text-brand-navy mb-1.5 ml-1">Your Message*</label>
                   <textarea 
                     name="message"
                     value={formData.message}
                     onChange={handleChange}
                     required 
                     placeholder="Write your message here..." 
                     rows={5} 
                     className="w-full p-4 rounded-lg border border-brand-border bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-[14px] resize-none"
                   ></textarea>
                 </div>
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="h-[48px] px-8 rounded-full bg-brand-orange text-white text-[14px] font-bold hover:bg-[#E04812] transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                 >
                   {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                   {loading ? 'Sending...' : 'Send Message'}
                 </button>
               </form>
            </div>

            {/* Office Section */}
            <div className="bg-brand-light p-10 rounded-3xl border border-brand-border/60">
              <h3 className="text-[24px] font-extrabold text-brand-navy mb-8 text-center">Our Office</h3>
              <div className="space-y-6">
                {[
                  { label: 'OFFICE ADDRESS', value: 'Himayatnagar, Hyderabad, India', icon: MapPin },
                  { label: 'PHONE', value: '+91 800 888 6365', icon: Phone },
                  { label: 'EMAIL', value: 'info@thelocalprinter.com', icon: Mail }
                ].map((info, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-brand-border shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0">
                      <info.icon className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold tracking-widest text-brand-muted uppercase mb-1">{info.label}</div>
                      <div className="text-[14px] font-semibold text-brand-navy">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <BusinessCTA />
      </div>
    </>
  );
}
