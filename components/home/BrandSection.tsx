import Link from "next/link";

export function BrandSection() {
  return (
    <section className="py-24 border-t border-primary-container/10 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary-container/10 blur-3xl rounded-full scale-150" />
              <img src="/LOGO.svg" alt="فكرة مشروع" className="relative w-48 h-48 object-contain drop-shadow-[0_0_40px_rgba(0,255,209,0.4)] group-hover:drop-shadow-[0_0_60px_rgba(0,255,209,0.6)] transition-all duration-700 group-hover:scale-105" />
            </div>
          </div>
          <div className="flex flex-col gap-6 text-right">
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-primary-container/30 bg-primary-container/10 rounded-full font-data text-[11px] text-primary-container tracking-[0.3em] uppercase w-fit self-end">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
              هويتنا البصرية
            </div>
            <h2 className="font-headline text-5xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
              فكرة <span className="text-primary-container italic neon-flicker">مشروع</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-light">
              شعار يجمع بين الأصالة العربية والتصميم العصري — معبّراً عن رؤيتنا في ربط الأفكار بالاستثمار وبناء مستقبل اقتصادي مستدام.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground font-body">
              {['منصة سيادية عربية 100%','تقنيات الذكاء الاصطناعي لاختيار الفرص','بيئة آمنة للمستثمرين والرواد','متوافقة مع رؤية 2030'].map((item) => (
                <li key={item} className="flex items-center gap-3 justify-end">
                  <span>{item}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container flex-shrink-0" />
                </li>
              ))}
            </ul>
            <div className="flex gap-4 justify-end pt-2">
              <Link href="/register" className="px-8 py-4 bg-primary-container text-background font-black rounded-full hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,255,209,0.3)]">ابدأ الآن</Link>
              <Link href="/opportunities" className="px-8 py-4 border border-primary-container/40 text-foreground font-black rounded-full hover:bg-primary-container/10 transition-all">استعرض الفرص</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
