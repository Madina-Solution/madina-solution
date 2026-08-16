"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Demo FAQ data
const faqs = [
  {
    question: "Berapa lama waktu pengerjaan untuk pesanan cetak?",
    answer:
      "Waktu pengerjaan bervariasi tergantung jenis produk. Banner dan sticker biasanya 1-2 hari kerja, kartu nama 2-3 hari kerja, dan untuk produk khusus seperti buku atau kemasan bisa 5-7 hari kerja. Kami juga menyediakan layanan express untuk kebutuhan mendesak.",
  },
  {
    question: "Apakah bisa memesan dengan desain sendiri?",
    answer:
      "Tentu! Anda bisa mengupload file desain sendiri dalam format AI, PSD, PDF, atau gambar dengan resolusi tinggi. Tim kami akan melakukan pengecekan file dan memberikan konfirmasi sebelum masuk produksi.",
  },
  {
    question: "Bagaimana cara pembayaran?",
    answer:
      "Kami menerima pembayaran melalui Transfer Bank (BCA, Mandiri, BRI), E-Wallet (OVO, GoPay, Dana), dan pembayaran langsung di lokasi. Untuk pesanan tertentu, tersedia opsi pembayaran DP 50%.",
  },
  {
    question: "Apakah tersedia pengiriman ke luar kota?",
    answer:
      "Ya, kami melayani pengiriman ke seluruh Indonesia melalui ekspedisi terpercaya seperti JNE, J&T, SiCepat, dan AnterAja. Biaya pengiriman dihitung berdasarkan berat dan tujuan.",
  },
  {
    question: "Bagaimana jika hasil cetak tidak sesuai?",
    answer:
      "Kepuasan pelanggan adalah prioritas kami. Jika hasil cetak tidak sesuai dengan preview yang telah disetujui (bukan karena kesalahan file dari customer), kami akan melakukan cetak ulang tanpa biaya tambahan.",
  },
  {
    question: "Apakah melayani desain dari nol?",
    answer:
      "Ya, kami memiliki tim desainer profesional yang siap membantu membuat desain sesuai kebutuhan Anda. Mulai dari logo, branding, hingga desain marketing material lengkap.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="bg-dark-50 py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-bold text-dark sm:text-4xl">
            Pertanyaan Umum
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-dark-600">
            Temukan jawaban untuk pertanyaan yang sering diajukan
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="overflow-hidden rounded-2xl border border-dark-100 bg-white"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-dark-50"
              >
                <span className="font-semibold text-dark">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-dark-400 transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-dark-600">{faq.answer}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
