import { Phone, Mail, Clock, MapPin } from 'lucide-react';

export default function ContactStrip() {
  const details = [
    { icon: Phone, text: '8008886365' },
    { icon: Mail, text: 'info@thelocalprinter.com' },
    { icon: Clock, text: 'Mon – Sat, 10am – 6pm' },
    { icon: MapPin, text: 'Himayatnagar, Hyderabad' },
  ];

  return (
    <div className="bg-brand-orange py-6">
      <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/20">
        {details.map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center pt-4 md:pt-0 border-white/20 border-t-0 md:first:border-none">
            <item.icon className="w-5 h-5 text-white mb-2 opacity-90" />
            <span className="text-[14px] font-semibold text-white">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
