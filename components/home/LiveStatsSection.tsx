import { ParallaxCard } from "@/components/ui/ParallaxCard";

export function LiveStatsSection({ stats }: { stats: { value: string; label: string; color: string }[] }) {
  return (
    <section className="w-full border-b border-primary-container/15 dark:border-white/5 py-20 bg-surface-container/50 dark:bg-white/[0.01] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-secondary-container/3 dark:bg-secondary-container/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-tertiary-fixed-dim/2 dark:bg-tertiary-fixed-dim/3 blur-[100px] rounded-full"></div>
      </div>
      <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
        {stats.map((stat, i) => (
          <ParallaxCard key={i} className="h-full">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-surface-container-high dark:from-white/[0.05] to-surface-container-highest dark:to-white/[0.02] border border-primary-container/20 dark:border-white/10 hover:border-primary-container/40 dark:hover:border-white/30 transition-all hover:bg-surface-container-highest dark:hover:bg-white/[0.08] group h-full">
              <div className="flex flex-col items-start gap-4">
                <div className="relative">
                  <span className={`font-data text-5xl md:text-6xl ${stat.color} font-black tracking-tighter group-hover:scale-115 transition-transform duration-500 origin-left`}>
                    {stat.value}
                  </span>
                  <div className={`absolute -inset-4 ${stat.color} opacity-10 dark:opacity-20 blur-xl group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity -z-10 rounded-full`}></div>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium font-headline tracking-wide text-sm block opacity-80 dark:opacity-70 group-hover:opacity-100 transition-opacity">
                    {stat.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-data uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Updated Live
                  </span>
                </div>
              </div>
            </div>
          </ParallaxCard>
        ))}
      </div>
    </section>
  );
}
