import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothScrolling from '@/components/common/SmoothScroll';

export default function PublicLayout({ children }) {
  return (
    <div className="public-page">
      <SmoothScrolling>
        <Header />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </SmoothScrolling>
    </div>
  );
}
