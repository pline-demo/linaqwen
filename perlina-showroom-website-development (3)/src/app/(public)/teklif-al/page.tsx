import { db } from "@/db";
import { settings, store } from "@/db/schema";
import QuoteForm from "@/components/QuoteForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teklif Al | PERLINA",
  description: "PERLINA'dan ücretsiz teklif alın.",
};

export const dynamic = "force-dynamic";

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ urun?: string; kod?: string }> }) {
  const params = await searchParams;
  
  const allSettings = await db.select().from(settings);
  const sMap: Record<string, string> = {};
  for (const s of allSettings) { if (s.key && s.value) sMap[s.key] = s.value; }
  
  const [storeData] = await db.select().from(store);
  const whatsapp = sMap.whatsapp || storeData?.whatsapp || "905325550000";

  return (
    <>
      <section className="bg-cream-light section-padding pb-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-12 h-px bg-bronze mx-auto mb-6" />
          <h1 className="section-title text-3xl md:text-4xl">Teklif Al</h1>
          <p className="section-subtitle max-w-2xl mx-auto mt-4">
            Formu doldurun, WhatsApp üzerinden size özel teklifinizi anında iletelim.
          </p>
        </div>
      </section>

      <section className="section-padding pt-8 bg-white">
        <div className="max-w-xl mx-auto">
          <QuoteForm 
            whatsapp={whatsapp} 
            productName={params.urun || ""} 
            productCode={params.kod || ""} 
          />
        </div>
      </section>
    </>
  );
}
