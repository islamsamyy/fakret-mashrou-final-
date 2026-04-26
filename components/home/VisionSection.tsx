export function VisionSection() {
  return (
    <section className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/5 blur-[140px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 text-right">
            <div className="inline-block px-4 py-1 border border-primary-container/40 bg-primary-container/15 dark:bg-primary-container/5 rounded-lg font-data text-[10px] text-primary-container tracking-[0.3em] uppercase">
              Future Vision // 2030 Strategy
            </div>
            <h2 className="text-5xl md:text-7xl font-headline font-semibold leading-tight text-foreground">
              نحن لا نبني منصة،
              <br />
              <span className="text-primary-container animate-pulse neon-flicker">بل نصمم اقتصاد الغد.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl ml-auto hover:text-foreground transition-colors">
              تلتزم IDEA BUSINESS بتمكين العقول السعودية وربطها بالموارد التي تحتاجها للنمو. من قلب الرياض، نفتح آفاقاً جديدة للاستثمار الجريء والنمو المستدام وفق معايير عالمية مرموقة.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="group p-6 bg-surface-container dark:bg-white/5 border border-primary-container/20 dark:border-white/10 rounded-xl hover:border-primary-container/40 hover:bg-primary-container/10 transition-all cursor-default">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary-container text-2xl group-hover:scale-125 transition-transform">
                    public
                  </span>
                  <span className="text-4xl font-data text-foreground font-bold group-hover:text-primary-container transition-colors">100%</span>
                </div>
                <span className="text-muted-foreground text-sm font-headline tracking-wider uppercase opacity-80 block">Saudi DNA</span>
              </div>

              <div className="group p-6 bg-surface-container dark:bg-white/5 border border-secondary/20 dark:border-white/10 rounded-xl hover:border-secondary/40 hover:bg-secondary/10 transition-all cursor-default">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-125 transition-transform">
                    groups
                  </span>
                  <span className="text-4xl font-data text-foreground font-bold group-hover:text-secondary transition-colors">Elite</span>
                </div>
                <span className="text-muted-foreground text-sm font-headline tracking-wider uppercase opacity-80 block">Network</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary-container/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3rem]"></div>
            <div className="relative p-12 border border-primary-container/20 dark:border-white/10 group-hover:border-primary-container/40 dark:group-hover:border-primary-container/30 rounded-[3rem] bg-gradient-to-br from-surface-container-high dark:from-black/60 to-surface-container dark:to-black/40 backdrop-blur-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,255,209,0.1)] hologram-effect">
              {/* Animated Corner */}
              <div className="absolute top-0 right-0 p-8">
                <div className="relative">
                  <span className="text-[40px] font-data text-primary-container/20 leading-none group-hover:text-primary-container/40 transition-colors">01</span>
                </div>
              </div>

              <div className="space-y-8 text-right">
                {/* Live Badge */}
                <div className="flex items-center justify-end gap-3">
                  <span className="font-data text-[10px] text-primary-container tracking-widest uppercase font-black">System Message</span>
                  <div className="h-2 w-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_var(--color-primary-container)]"></div>
                </div>

                {/* Quote */}
                <p className="text-3xl font-light text-foreground leading-snug italic font-headline hover:text-primary-container transition-colors">
                  "هدفنا هو جعل المملكة العربية السعودية الوجهة الأولى عالمياً للاستثمار في الأفكار الريادية والذكاء الاصطناعي."
                </p>

                {/* Authority Badge */}
                <div className="flex items-center justify-end gap-6 pt-6 border-t border-primary-container/15 dark:border-white/10">
                  <div className="text-right">
                    <div className="text-foreground text-lg font-bold tracking-wide">القيادة الاستراتيجية</div>
                    <div className="text-muted-foreground text-xs font-data uppercase tracking-[0.2em] mt-1">Vision 2030 Alignment</div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-container/20 to-primary-container/5 border border-primary-container/30 flex items-center justify-center overflow-hidden group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,209,0.3)] transition-all">
                    <span className="material-symbols-outlined text-primary-container text-3xl font-light">verified_user</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
