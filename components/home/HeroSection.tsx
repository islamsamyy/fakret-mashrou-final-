import Link from "next/link";

export function HeroSection() {
  return (
    <section className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-6 text-center relative overflow-hidden pt-32 pb-20">
      {/* Cyber Grid Perspective Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-full cyber-grid-perspective -z-10"></div>
      
      {/* Futuristic Status Badge */}
      <div className="mb-12 inline-flex items-center gap-3 px-6 py-2 border border-primary-container/40 bg-primary-container/10 dark:bg-black/40 backdrop-blur-md rounded-full text-[11px] font-data tracking-[0.3em] uppercase text-primary-container animate-fade-in shadow-[0_0_15px_rgba(0,255,209,0.2)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
        </span>
        Platform Status: Operational // AI Powered
      </div>

      <div className="py-4">
        <h1 className="font-headline text-6xl md:text-9xl font-semibold leading-[1.1] mb-10 max-w-7xl tracking-[-0.04em] text-foreground relative">
          اصنع <span className="text-primary-container font-light italic neon-flicker">مستقبلك</span> الاستثماري
          <br />
          <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 dark:from-white dark:via-white/80 dark:to-white/60 bg-clip-text text-transparent">في قلب رؤية 2030</span>
        </h1>
      </div>

      <p className="text-muted-foreground text-lg md:text-2xl max-w-4xl mb-16 font-body leading-relaxed opacity-80 dark:opacity-70 font-light">
        بيئة سيادية آمنة تجمع بين طموح الرواد وذكاء المستثمرين. نوظف تقنيات الذكاء الاصطناعي لاختيار الفرص الأكثر نمواً وتأثيراً في الاقتصاد الجديد.
      </p>

      <div className="flex flex-col md:flex-row gap-8 mb-24 relative z-20">
        <Link
          href="/opportunities"
          className="group relative px-14 py-6 bg-gradient-to-r from-primary-container to-accent text-foreground font-semibold text-xl rounded-full transition-all hover:scale-105 active:scale-95 overflow-hidden shadow-[0_8px_24px_rgba(0,255,209,0.3)] holographic-reflection clip-button"
        >
          <span className="relative z-10 flex items-center gap-3 transition-colors">
            اكتشف الفرص الحالية
            <span className="material-symbols-outlined font-black text-2xl">arrow_outward</span>
          </span>
        </Link>
        <Link
          href="/add-idea"
          className="group relative px-14 py-6 border-2 border-primary-container/50 bg-primary-container/10 dark:bg-white/5 backdrop-blur-sm text-foreground dark:text-white font-semibold text-xl rounded-full transition-all hover:border-primary-container hover:bg-primary-container/20 active:scale-95 holographic-reflection"
        >
          <span className="flex items-center gap-3">
            اطرح مشروعك الآن
            <span className="material-symbols-outlined font-black text-2xl text-primary-container">add_circle</span>
          </span>
        </Link>
      </div>

      {/* Interactive Tech Bar with Animation */}
      <div className="w-full max-w-7xl border-y border-primary-container/20 dark:border-white/5 py-10 group">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {[
            { label: "AI Verification", val: "Active", icon: "smart_toy" },
            { label: "Legal Framework", val: "KSA Standard", icon: "gavel" },
            { label: "Data Encryption", val: "AES-256", icon: "lock" },
            { label: "Matchmaking", val: "Real-time", icon: "favorite_border" },
            { label: "Support", val: "24/7 Elite", icon: "support_agent" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-3 items-center md:items-start p-4 rounded-lg hover:bg-primary-container/5 dark:hover:bg-white/5 transition-all group cursor-pointer">
              <span className="material-symbols-outlined text-3xl text-primary-container opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                {item.icon}
              </span>
              <span className="text-sm font-data tracking-widest uppercase text-primary-container font-bold">{item.label}</span>
              <span className="text-base font-black text-foreground group-hover:text-primary-container transition-colors tracking-wide">{item.val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
