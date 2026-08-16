"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-dark py-20 lg:py-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Siap Membuat Bisnis Anda
            <br />
            Tampil Lebih Profesional?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Konsultasikan kebutuhan desain dan cetak Anda dengan tim kami.
            Gratis konsultasi untuk pesanan pertama!
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="xl"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/products">
                Mulai Pesanan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <a
                href={`https://wa.me/${BRAND.whatsapp}?text=Halo%20Madina%20Solution%2C%20saya%20ingin%20konsultasi%20tentang%20layanan%20Anda.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat WhatsApp
              </a>
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">500+</span>
              <span>Klien Puas</span>
            </div>
            <div className="hidden h-6 w-px bg-white/30 sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">2500+</span>
              <span>Proyek Selesai</span>
            </div>
            <div className="hidden h-6 w-px bg-white/30 sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">4.9</span>
              <span>Rating</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
