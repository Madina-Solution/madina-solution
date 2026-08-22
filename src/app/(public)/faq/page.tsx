import { Metadata } from "next";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { FAQ as FAQComponent } from "@/components/home/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Pertanyaan yang sering diajukan tentang layanan Madina Solution.",
};

export const dynamic = "force-dynamic";

export default async function FAQPage() {
  return (
    <div>
      <PageHeader
        title="Pertanyaan Umum"
        description="Temukan jawaban untuk pertanyaan yang sering diajukan."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "FAQ" }]}
      />
      <FAQComponent />
    </div>
  );
}
