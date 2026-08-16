"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Users, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  { icon: Users, value: "500+", label: "Klien Puas" },
  { icon: Award, value: "10+", label: "Tahun Pengalaman" },
  { icon: Star, value: "4.9", label: "Rating" },
  { icon: Clock, value: "24 Jam", label: "Respons Cepat" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-6 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Creative Business Platform
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-dark sm:text-5xl lg:text-6xl">
              Bangun Citra Bisnis yang{" "}
              <span className="text-gradient">Lebih Profesional</span>
            </h1>

            <p className="mt-6 text-lg text-dark-600 lg:text-xl">
              Dari desain hingga produksi, Madina Solution membantu bisnis
              menghadirkan identitas visual yang kuat, konsisten, dan siap
              tampil di dunia nyata.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/products">
                  Mulai Pesanan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/portfolio">
                  <Play className="mr-2 h-5 w-5" />
                  Lihat Portfolio
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-2 text-2xl font-bold text-dark">
                    {stat.value}
                  </p>
                  <p className="text-sm text-dark-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-1 shadow-premium-lg lg:aspect-[4/3]">
              <div className="flex h-full w-full items-center justify-center rounded-[1.25rem] bg-white">
                {/* Placeholder for Hero Image/Video */}
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-5xl font-bold text-primary">M</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-dark">
                    Madina Solution
                  </h3>
                  <p className="mt-2 text-dark-500">
                    Design • Print • Branding
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="absolute -left-4 bottom-8 rounded-xl bg-white p-4 shadow-premium lg:-left-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark">
                    Pesanan Selesai
                  </p>
                  <p className="text-xs text-dark-500">2,500+ proyek</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="absolute -right-4 top-8 rounded-xl bg-white p-4 shadow-premium lg:-right-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-100 text-xs font-medium text-primary"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark">500+ Klien</p>
                  <p className="text-xs text-dark-500">Percaya pada kami</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
