import { ParallaxCard } from "@/components/ui/ParallaxCard";

export function FeaturesSection() {
  const features = [
    {
      icon: "bolt",
      title: "رحلة سلسة وسريعة",
      description:
        "نقلص الفجوة الزمنية بين الفكرة والتنفيذ عبر إجراءات رقمية مؤتمتة بالكامل.",
    },
    {
      icon: "verified_user",
      title: "بيئة آمنة وموثوقة",
      description:
        "نظام تحقق متقدم من الهوية والأهلية المالية لضمان جدية كافة الأطراف.",
    },
    {
      icon: "smart_toy",
      title: "ذكاء اصطناعي متكامل",
      description:
        "محرك تحليل ذكي يربط الأفكار بالمستثمرين الأكثر ملاءمة بناءً على التاريخ الاستثمارية.",
    },
    {
      icon: "language",
      title: "ثنائية اللغة",
      description:
        "دعم كامل للغتين العربية والإنجليزية لفتح آفاق الاستثمار الإقليمي والدولي.",
    },
    {
      icon: "monitoring",
      title: "تحليلات لحظية",
      description:
        "لوحة تحكم شاملة تعرض أداء استثماراتك وتفاعل السوق مع فكرتك لحظة بلحظة.",
    },
    {
      icon: "payments",
      title: "دفع آمن ومنظم",
      description:
        "بوابة دفع معتمدة تضمن شفافية التحويلات المالية وتوثيق العقود إلكترونياً.",
    },
  ];

  return (
    <section className="py-40 px-6 bg-surface-container/30 dark:bg-white/[0.01] relative overflow-hidden border-y border-primary-container/15 dark:border-white/5">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary-container/3 dark:bg-secondary-container/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary-container/2 dark:bg-primary-container/3 blur-[150px] rounded-full opacity-20 dark:opacity-30"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <div className="max-w-2xl text-right">
            <div className="inline-block px-4 py-1 border border-primary-container/40 bg-primary-container/15 dark:bg-primary-container/5 rounded-lg font-data text-[10px] text-primary-container tracking-[0.3em] uppercase mb-6">
              Capabilities // System Core
            </div>
            <h2 className="font-headline text-5xl md:text-7xl font-semibold text-foreground dark:text-white tracking-tight mb-6">
              التميز <span className="opacity-60 dark:opacity-40 italic neon-flicker">التقني.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light">بنية تحتية متطورة تضمن كفاءة الربط بين الموارد والطموح والفرص الحقيقية.</p>
          </div>
          <div className="font-data text-primary-container text-xs tracking-[0.4em] uppercase opacity-50">System Core // v3.0</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <ParallaxCard key={i} className="h-full">
              <div className="p-12 rounded-2xl bg-gradient-to-br from-surface-container dark:from-white/[0.05] to-surface-container-high dark:to-white/[0.02] border border-primary-container/20 dark:border-white/10 h-full flex flex-col text-right group group-hover:border-primary-container/40 dark:group-hover:border-primary-container/30 group-hover:bg-surface-container-highest dark:group-hover:bg-white/[0.08] transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,255,209,0.1)] relative overflow-hidden">
                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary-container opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-br-3xl"></div>

                {/* Icon */}
                <div className="mb-8 relative z-10">
                  <span className={`material-symbols-outlined text-7xl font-light text-primary-container opacity-90 group-hover:opacity-100 group-hover:scale-125 group-hover:drop-shadow-[0_0_20px_rgba(0,255,209,0.4)] transition-all duration-500`}>
                    {feat.icon}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-3xl font-black text-foreground dark:text-white mb-6 font-headline tracking-tight group-hover:text-primary-container transition-colors duration-500 relative z-10">
                  {feat.title}
                </h4>

                {/* Description */}
                <p className="text-muted-foreground font-body leading-relaxed text-lg opacity-85 dark:opacity-80 group-hover:text-foreground dark:group-hover:text-slate-300 transition-all duration-500 relative z-10 flex-grow">
                  {feat.description}
                </p>

                {/* Bottom CTA - Hidden by default */}
                <div className="mt-8 pt-8 border-t border-primary-container/20 dark:border-white/5 group-hover:border-primary-container/40 dark:group-hover:border-primary-container/30 transition-colors opacity-0 group-hover:opacity-100 duration-500 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-data text-primary-container uppercase tracking-widest animate-fade-in">اكتشف المزيد</span>
                    <span className="material-symbols-outlined text-primary-container group-hover:translate-x-2 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </div>
            </ParallaxCard>
          ))}
        </div>

        {/* Extra Feature Highlight */}
        <div className="mt-20 p-12 bg-gradient-to-r from-primary-container/10 dark:from-primary-container/10 via-transparent to-secondary-container/10 dark:to-secondary-container/10 border border-primary-container/30 dark:border-primary-container/20 rounded-3xl relative overflow-hidden group cursor-pointer transition-all hover:border-primary-container/50 dark:hover:border-primary-container/40 hover:shadow-[0_0_40px_rgba(0,255,209,0.2)] dark:hover:shadow-[0_0_40px_rgba(0,255,209,0.15)]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-container/20 dark:bg-primary-container/20 blur-[80px] rounded-full"></div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="text-right flex-1">
              <h3 className="text-3xl font-black text-foreground dark:text-white font-headline mb-3 group-hover:text-primary-container transition-colors">
                خصوصية من المستوى العسكري
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                تشفير من الطراز العالمي (AES-256) لجميع البيانات والمعاملات مع امتثال كامل للمعايير الدولية والسعودية.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="material-symbols-outlined text-7xl text-primary-container opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                shield_lock
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
