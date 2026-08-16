"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Demo testimonials data
const testimonials = [
  {
    id: "1",
    name: "Ahmad Fauzi",
    role: "Owner",
    company: "Toko Berkah Jaya",
    content:
      "Hasil cetak banner dan spanduk sangat memuaskan. Warna cerah, bahan kuat, dan pengerjaan cepat. Sudah langganan sejak 2019!",
    rating: 5,
  },
  {
    id: "2",
    name: "Siti Rahayu",
    role: "Marketing Manager",
    company: "PT Maju Bersama",
    content:
      "Tim Madina sangat profesional dalam mendesain company profile kami. Hasilnya melebihi ekspektasi dan deadline selalu tepat.",
    rating: 5,
  },
  {
    id: "3",
    name: "Budi Santoso",
    role: "Owner",
    company: "Warung Mbak Sri",
    content:
      "Harga terjangkau untuk kualitas premium. Menu dan banner untuk warung saya terlihat sangat profesional sekarang.",
    rating: 5,
  },
  {
    id: "4",
    name: "Dewi Lestari",
    role: "Event Organizer",
    company: "Dewi Events",
    content:
      "Partner terbaik untuk semua kebutuhan event display. Backdrop, x-banner, hingga undangan selalu on time dan berkualitas.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="bg-dark py-20 lg:py-28">
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
            Testimoni
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Apa Kata Mereka
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-dark-300">
            Kepuasan pelanggan adalah prioritas utama kami
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full border-dark-700 bg-dark-800">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/50" />
                  <p className="mt-4 text-dark-200">{testimonial.content}</p>
                  <div className="mt-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-dark-400">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
