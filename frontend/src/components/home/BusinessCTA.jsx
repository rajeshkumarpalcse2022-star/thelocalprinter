import Link from "next/link";

export default function BusinessCTA() {
  return (
    <section className="bg-brand-orange py-20 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-[32px] md:text-[40px] font-extrabold text-white mb-4">
          Own a Printing Business?
        </h2>
        <p className="text-white/90 text-[16px] mb-10">
          Get found by customers near you — GPS verification, one listing, lifetime visibility.
        </p>
        <Link href="/signup">
          <button className="h-[52px] px-8 rounded-full bg-white text-brand-orange font-bold hover:bg-brand-light transition-colors shadow-lg">
            List My Business
          </button>
        </Link>
      </div>
    </section>
  );
}
