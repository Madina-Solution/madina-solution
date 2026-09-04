import { Metadata } from "next";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { FAQ as FAQComponent } from "@/components/home/faq";
import { FAQPageSchema } from "@/components/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({ title: "FAQ", description: "Pertanyaan umum tentang layanan, produk, pemesanan, pembayaran, desain, dan pengiriman Madina Solution.", path: "/faq" });

// ISR: page is cached and regenerated in the background at most every 60s,
// instead of re-running the full render + DB queries on every single visit.
// Admin changes (new product, price update, etc.) appear within this window.
export const revalidate = 60;

export default async function FAQPage() {
  const faqList = await db.select({ question: faqs.question, answer: faqs.answer }).from(faqs).where(eq(faqs.isActive, true)).orderBy(asc(faqs.order));
  return (
    <div>
      {faqList.length > 0 ? <FAQPageSchema items={faqList} /> : null}
      <PageHeader
        title="Pertanyaan Umum"
        description="Temukan jawaban untuk pertanyaan yang sering diajukan."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "FAQ" }]}
      />
      <FAQComponent />
    </div>
  );
}
