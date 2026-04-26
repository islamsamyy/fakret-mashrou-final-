import Link from "next/link";
import { ParallaxCard } from "@/components/ui/ParallaxCard";

export function RoleSelectionSection() {
  const paths = [
    {
      icon: "account_balance_wallet",
      title: "مستثمر",
      description:
        "اكتشف فرصاً استثمارية واعدة ومُتحقق منها في السوق العربي عبر أدوات تقييم ذكية.",
      color: "secondary-fixed-dim",
      bg: "bg-secondary-container/5",
    },
    {
      icon: "business_center",
      title: "صاحب مشروع",
      description:
        "مشروع قائم يحتاج توسيع، شريك، أو استثمار إضافي لرفع كفاءة العمليات التشغيلية.",
      color: "primary-container",
      bg: "bg-primary-container/5",
      featured: true,
    },
    {
      icon: "emoji_objects",
      title: "صاحب فكرة",
      description:
        "لديك فكرة متميزة وتبحث عن تمويل أو شريك استراتيجي لتحويل المخطط إلى واقع ملموس.",
      color: "tertiary-fixed-dim",
      bg: "bg-tertiary-fixed-dim/5",
    },
  ];

  return (
    <section className="py-40 px-6 container mx-auto relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-primary-container/5 dark:bg-primary-container/5 blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 noise-bg opacity-[0.03] pointer-events-none"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8 relative z-10">
        <div className="max-w-2xl text-right">
          <div className="inline-block px-4 py-1 border border-primary-container/40 bg-primary-container/15 dark:bg-primary-container/5 rounded-lg font-data text-[10px] text-primary-container tracking-[0.3em] uppercase mb-6">
            IDENTITY_UPLINK // SELECT_ROLE
          </div>
          <h2 className="font-headline text-5xl md:text-7xl font-semibold text-foreground dark:text-white tracking-tight mb-6">
            بوابتك نحو <span className="text-primary-container text-glitch after:content-['التأثير'] after:absolute after:inset-0 after:text-secondary/30 after:-translate-x-[2px] after:animate-glitch-1 before:content-['التأثير'] before:absolute before:inset-0 before:text-primary-container/30 before:translate-x-[2px] before:animate-glitch-2 relative">التأثير.</span>
          </h2>
          <p className="text-xl text-muted-foreground font-light border-r-2 border-primary-container/20 pr-6">اختر هويتك الاستثمارية في الشبكة لنرشدك إلى المسار الأكثر كفاءة وموثوقية.</p>
        </div>
        <div className="flex flex-col items-end gap-2 font-data text-primary-container text-[10px] tracking-[0.4em] uppercase opacity-50">
          <span>System_Core: V3.4.2</span>
          <span>Identity_Sync: STABLE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {paths.map((path, i) => (
          <ParallaxCard key={i} className="h-full">
            <Link
              href={path.featured ? "/add-idea" : i === 0 ? "/opportunities" : "/"}
              className={`group relative overflow-hidden rounded-[2.5rem] transition-all duration-700 h-full flex flex-col border ${
                path.featured 
                  ? "border-primary-container/40 shadow-[0_0_50px_rgba(0,255,209,0.15)]" 
                  : "border-primary-container/10"
              }`}
            >
              <div className={`h-full p-12 backdrop-blur-3xl flex flex-col transition-all duration-700 h-full relative ${
                path.featured
                  ? "bg-gradient-to-br from-primary-container/15 to-transparent"
                  : "bg-surface-container-low/20"
              }`}>
                {/* Terminal Overlay */}
                
                <div className="relative z-10 flex flex-col h-full text-right">
                  {/* Role Header */}
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-primary-container/40 uppercase tracking-widest">Active_Nodes</span>
                      <span className="text-lg font-black tabular-nums">{i === 0 ? '1,204' : i === 1 ? '4,832' : '12,401'}</span>
                    </div>
                    <div className={`w-20 h-20 rounded-2xl ${path.bg} flex items-center justify-center border border-primary-container/20 group-hover:scale-110 group-hover:shadow-neon-sm transition-all duration-500 relative`}>
                      <span className={`material-symbols-outlined text-4xl text-${path.color} group-hover:animate-pulse`}>
                        {path.icon}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-black mb-6 text-foreground font-headline group-hover:text-primary-container transition-colors duration-500">
                    {path.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed font-body text-lg opacity-85 mb-12 group-hover:text-foreground transition-colors flex-grow">
                    {path.description}
                  </p>

                  {/* Status Bar */}
                  <div className="space-y-3 mb-10">
                    <div className="flex justify-between text-[8px] font-black tracking-widest uppercase">
                      <span className="text-primary-container">Sync_Status</span>
                      <span className="opacity-40">Operational</span>
                    </div>
                    <div className="h-1 bg-background/50 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full transition-all duration-1000 group-hover:w-full bg-${path.color}/40`} style={{ width: i === 0 ? '94%' : i === 1 ? '98%' : '92%' }}></div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-8 border-t border-primary-container/10 group-hover:border-primary-container/30 transition-colors">
                    <div className="flex justify-between items-center group-hover:translate-x-[-10px] transition-transform duration-500">
                      <span className="material-symbols-outlined text-primary-container -rotate-180 font-black">arrow_forward</span>
                      <span className="text-[10px] font-black text-primary-container tracking-[0.3em] uppercase">INITIATE_PATH</span>
                    </div>
                    {path.featured && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 glass-strong rounded-full border border-primary-container/30">
                        <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-ping"></span>
                        <span className="text-[8px] font-black text-primary-container uppercase tracking-widest">Priority_Node</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </ParallaxCard>
        ))}
      </div>
    </section>
  );
}
