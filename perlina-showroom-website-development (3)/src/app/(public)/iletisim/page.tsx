import { db } from "@/db";
import { settings, store as storeTable } from "@/db/schema";
import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim | PERLINA",
  description: "PERLINA ile iletişime geçin. Telefon, WhatsApp, e-posta ve adres bilgileri.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const allSettings = await db.select().from(settings);
  const sMap: Record<string, string> = {};
  for (const s of allSettings) { if (s.key && s.value) sMap[s.key] = s.value; }
  const [s] = await db.select().from(storeTable);

  const phone = sMap.phone || s?.phone || "";
  const email = sMap.email || s?.email || "";
  const address = sMap.address || s?.address || "";
  const whatsapp = sMap.whatsapp || s?.whatsapp || "";
  const waUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Merhaba, bilgi almak istiyorum.")}`;

  return (
    <>
      <section className="bg-cream-light section-padding pb-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-12 h-px bg-bronze mx-auto mb-6" />
          <h1 className="section-title text-3xl md:text-4xl">İletişim</h1>
          <p className="section-subtitle max-w-2xl mx-auto mt-4">
            Sorularınız için bizimle iletişime geçin.
          </p>
        </div>
      </section>

      <section className="section-padding pt-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="font-[family-name:var(--font-family-heading)] text-2xl font-medium text-charcoal mb-6">İletişim Bilgileri</h2>
              <div className="space-y-6 mb-8">
                {phone && (
                  <div>
                    <h3 className="text-sm font-medium text-charcoal mb-1">Telefon</h3>
                    <a href={`tel:${phone}`} className="text-warm-gray hover:text-bronze transition-colors">{phone}</a>
                  </div>
                )}
                {email && (
                  <div>
                    <h3 className="text-sm font-medium text-charcoal mb-1">E-posta</h3>
                    <a href={`mailto:${email}`} className="text-warm-gray hover:text-bronze transition-colors">{email}</a>
                  </div>
                )}
                {address && (
                  <div>
                    <h3 className="text-sm font-medium text-charcoal mb-1">Adres</h3>
                    <p className="text-warm-gray">{address}</p>
                  </div>
                )}
              </div>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.712-1.402A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.31-.726-5.99-1.956l-.418-.314-3.06.91.85-3.108-.327-.437A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp ile İletişim
              </a>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-[family-name:var(--font-family-heading)] text-2xl font-medium text-charcoal mb-6">Bize Yazın</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
