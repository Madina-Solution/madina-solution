"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Palette, Printer, Megaphone, Sparkles, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Palette,
    title: "Design Grafis",
    description:
      "Logo, branding, social media design, dan berbagai kebutuhan desain visual untuk bisnis Anda.",
    href: "/services/design",
    color: "bg-blue-500",
  },
  {
    icon: Printer,
    title: "Digital Printing",
    description:
      "Cetak banner, sticker, kartu nama, brosur, dan berbagai media promosi dengan kualitas premium.",
    href: "/services/printing",
    color: "bg-green-500",
  },
  {
    icon: Megaphone,
    title: "Advertising",
    description:
      "Neon box, signage, billboard, spanduk, dan berbagai media iklan indoor/outdoor.",
    href: "/services/advertising",
    color: "bg-purple-500",
  },
  {
    icon: Sparkles,
    title: "Branding",
    description:
      "Brand identity lengkap, packaging design, merchandise, dan promotional kit untuk bisnis.",
    href: "/services/branding",
    color: "bg-orange-500",
  },
  {
    icon: Package,
    title: "Paket Bisnis",
    description:
      "Solusi lengkap untuk UMKM, corporate, dan event dengan harga paket yang terjangkau.",
    href: "/services/business",
    color: "bg-pink-500",
  },
];

export function Services() {
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
            Layanan Kami
          </span>
          <h2 className="mt-3 text-3xl font-bold text-dark sm:text-4xl lg:text-5xl">
            Solusi Lengkap untuk{" "}
            <span className="text-gradient">Kebutuhan Bisnis</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-dark-600">
            Dari ide hingga produksi, kami siap membantu mewujudkan kebutuhan
            visual dan promosi bisnis Anda.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={service.href}>
                <Card className="group h-full cursor-pointer border-transparent hover:border-primary/20">
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${service.color} text-white transition-transform group-hover:scale-110`}
                    >
                      <service.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-dark group-hover:text-primary">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-dark-500">{service.description}</p>
                    <div className="mt-4 flex items-center text-sm font-medium text-primary">
                      Selengkapnya
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Button variant="outline" size="lg" asChild>
            <Link href="/services">
              Lihat Semua Layanan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
