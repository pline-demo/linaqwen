import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { db } from "@/db";
import { settings, store } from "@/db/schema";

async function getSiteData() {
  const allSettings = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const s of allSettings) {
    if (s.key && s.value !== null) map[s.key] = s.value!;
  }

  const [storeData] = await db.select().from(store);

  // Check maintenance
  if (map["maintenance_mode"] === "true") {
    return { settings: map, store: storeData, maintenance: true };
  }
  return { settings: map, store: storeData, maintenance: false };
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const data = await getSiteData();

  if (data.maintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-light">
        <div className="text-center px-6">
          <h1 className="font-[family-name:var(--font-family-heading)] text-4xl font-semibold text-charcoal mb-4">PERLINA</h1>
          <div className="w-16 h-px bg-bronze mx-auto mb-6" />
          <h2 className="text-xl font-medium text-warm-gray mb-3">Bakım Çalışması</h2>
          <p className="text-warm-gray-light max-w-md">
            Web sitemiz şu anda bakım çalışması nedeniyle geçici olarak hizmet dışıdır. Kısa süre içinde tekrar hizmetinizde olacağız.
          </p>
          {data.settings.phone && (
            <p className="mt-6 text-sm text-warm-gray">
              Telefon: <a href={`tel:${data.settings.phone}`} className="text-bronze hover:underline">{data.settings.phone}</a>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header whatsapp={data.settings.whatsapp || data.store?.whatsapp || ""} />
      <main className="pt-16 md:pt-20">
        {children}
      </main>
      <Footer
        phone={data.settings.phone || data.store?.phone || ""}
        email={data.settings.email || data.store?.email || ""}
        address={data.settings.address || data.store?.address || ""}
        whatsapp={data.settings.whatsapp || data.store?.whatsapp || ""}
        instagram={data.settings.instagram}
        facebook={data.settings.facebook}
      />
      <WhatsAppFloat phone={data.settings.whatsapp || data.store?.whatsapp || ""} />
    </>
  );
}
