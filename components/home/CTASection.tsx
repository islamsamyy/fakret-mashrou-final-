import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-48 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-container/5 blur-[150px] rounded-full"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary-fixed-dim/3 blur-[100px] rounded-full opacity-50"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="inline-block px-6 py-2 border border-primary-container/30 bg-primary-container/10 rounded-full font-data text-[11px] text-primary-container tracking-[0.5em] uppercase font-black animate-fade-in shadow-[0_0_20px_rgba(0,255,209,0.2)]">
            Global Network // Saudi Innovation Hub
          </div>

          <div className="space-y-6">
            <h2 className="text-6xl md:text-8xl font-headline font-black text-foreground leading-tight tracking-tight">
              العالم ينتظر
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container via-primary-container to-secondary animate-pulse neon-flicker">
                فكرتك القادمة.
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground font-light leading-relaxed opacity-90 max-w-3xl mx-auto">
              انضم إلى أكبر تجمع استثماري في الشرق الأوسط وابدأ رحلة التحول الرقمي والمالي اليوم. مع آلاف الرواد والمستثمرين المنتظرين لأفكارك.
            </p>
          </div>

          {/* Dual CTA */}
          <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/opportunities"
              className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-primary-container to-accent text-foreground font-black text-xl rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_8px_30px_rgba(0,255,209,0.3)] overflow-hidden holographic-reflection clip-button"
            >
              <span className="relative flex items-center gap-3">
                <span className="material-symbols-outlined font-black text-2xl group-hover:scale-125 transition-transform">search</span>
                اكتشف الفرص
              </span>
            </Link>

            <Link
              href="/add-idea"
              className="group relative inline-flex items-center gap-4 px-12 py-6 border-2 border-primary-container/50 bg-primary-container/10 dark:bg-transparent text-foreground dark:text-white font-black text-xl rounded-full hover:bg-primary-container/20 dark:hover:bg-white/10 hover:border-primary-container active:scale-95 transition-all holographic-reflection"
            >
              <span className="relative flex items-center gap-3">
                <span className="material-symbols-outlined font-black text-2xl text-primary-container group-hover:rotate-180 transition-transform">add_circle</span>
                اطرح فكرتك
              </span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="p-6 border border-primary-container/20 dark:border-white/10 rounded-xl bg-surface-container dark:bg-white/[0.02] hover:bg-primary-container/10 dark:hover:bg-white/[0.05] hover:border-primary-container/40 dark:hover:border-primary-container/30 transition-all group cursor-default hologram-effect">
              <span className="material-symbols-outlined text-3xl text-primary-container mb-3 block group-hover:scale-110 transition-transform">shield_verified</span>
              <h4 className="text-foreground font-black mb-2 text-lg">موثوق ومأمون</h4>
              <p className="text-muted-foreground text-sm">معايير أمان عالمية</p>
            </div>
            <div className="p-6 border border-secondary/20 dark:border-white/10 rounded-xl bg-surface-container dark:bg-white/[0.02] hover:bg-secondary/10 dark:hover:bg-white/[0.05] hover:border-secondary/40 transition-all group cursor-default hologram-effect">
              <span className="material-symbols-outlined text-3xl text-secondary mb-3 block group-hover:scale-110 transition-transform">speed</span>
              <h4 className="text-foreground font-black mb-2 text-lg">سريع وفعال</h4>
              <p className="text-muted-foreground text-sm">من الفكرة للصفقة في أسابيع</p>
            </div>
            <div className="p-6 border border-primary-container/20 dark:border-white/10 rounded-xl bg-surface-container dark:bg-white/[0.02] hover:bg-primary-container/10 dark:hover:bg-white/[0.05] hover:border-primary-container/40 transition-all group cursor-default hologram-effect">
              <span className="material-symbols-outlined text-3xl text-primary-container mb-3 block group-hover:scale-110 transition-transform">support_agent</span>
              <h4 className="text-foreground font-black mb-2 text-lg">دعم متكامل</h4>
              <p className="text-muted-foreground text-sm">فريق متخصص يساعدك دائماً</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
