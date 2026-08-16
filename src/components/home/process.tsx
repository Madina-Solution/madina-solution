"use client";

import { motion } from "framer-motion";
import { MessageSquare, Palette, Settings, Truck, CheckCircle } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: MessageSquare,
    title: "Konsultasi",
    description:
      "Hubungi kami untuk konsultasi kebutuhan desain dan cetak bisnis Anda.",
  },
  {
    step: 2,
    icon: Palette,
    title: "Desain",
    description:
      "Tim desainer kami akan membuat desain sesuai brief atau Anda upload file sendiri.",
  },
  {
    step: 3,
    icon: Settings,
    title: "Produksi",
    description:
      "Setelah desain disetujui, pesanan langsung masuk proses produksi.",
  },
  {
    step: 4,
    icon: CheckCircle,
    title: "Quality Control",
    description:
      "Setiap produk melewati pengecekan kualitas sebelum dikemas.",
  },
  {
    step: 5,
    icon: Truck,
    title: "Pengiriman",
    description:
      "Produk siap dikirim atau diambil langsung di lokasi kami.",
  },
];

export function Process() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Proses Kerja
          </span>
          <h2 className="mt-3 text-3xl font-bold text-dark sm:text-4xl lg:text-5xl">
            Cara Kami Bekerja
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-dark-600">
            Proses yang transparan dan efisien untuk hasil terbaik
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="mt-16">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-dark-200 lg:block" />

            <div className="space-y-8 lg:space-y-0">
              {steps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`relative flex flex-col items-center gap-6 lg:flex-row ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 rounded-2xl border border-dark-100 bg-white p-6 shadow-premium lg:p-8 ${
                      index % 2 === 0 ? "lg:text-right" : "lg:text-left"
                    }`}
                  >
                    <h3 className="text-xl font-semibold text-dark">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-dark-500">{item.description}</p>
                  </div>

                  {/* Icon */}
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-lg">
                    <item.icon className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-dark text-xs font-bold text-white">
                      {item.step}
                    </span>
                  </div>

                  {/* Spacer */}
                  <div className="hidden flex-1 lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
