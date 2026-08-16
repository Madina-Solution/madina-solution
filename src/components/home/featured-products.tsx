"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

// Demo products data
const products = [
  {
    id: "1",
    name: "Banner Flexi Korea",
    slug: "banner-flexi-korea",
    category: "Banner",
    price: 25000,
    unit: "m²",
    rating: 4.9,
    reviewCount: 128,
    thumbnail: null,
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Sticker Vinyl Glossy",
    slug: "sticker-vinyl-glossy",
    category: "Sticker",
    price: 150000,
    unit: "m²",
    rating: 4.8,
    reviewCount: 95,
    thumbnail: null,
    badge: null,
  },
  {
    id: "3",
    name: "Kartu Nama Premium",
    slug: "kartu-nama-premium",
    category: "Kartu Nama",
    price: 75000,
    unit: "box",
    rating: 4.9,
    reviewCount: 234,
    thumbnail: null,
    badge: "Popular",
  },
  {
    id: "4",
    name: "Brosur A4",
    slug: "brosur-a4",
    category: "Brosur",
    price: 1500,
    unit: "lembar",
    rating: 4.7,
    reviewCount: 156,
    thumbnail: null,
    badge: null,
  },
  {
    id: "5",
    name: "X-Banner Complete",
    slug: "x-banner-complete",
    category: "Banner",
    price: 85000,
    unit: "pcs",
    rating: 4.8,
    reviewCount: 89,
    thumbnail: null,
    badge: "New",
  },
  {
    id: "6",
    name: "Undangan Pernikahan",
    slug: "undangan-pernikahan",
    category: "Undangan",
    price: 3500,
    unit: "pcs",
    rating: 4.9,
    reviewCount: 312,
    thumbnail: null,
    badge: "Best Seller",
  },
];

export function FeaturedProducts() {
  return (
    <section className="bg-dark-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Produk Unggulan
            </span>
            <h2 className="mt-3 text-3xl font-bold text-dark sm:text-4xl">
              Produk Terlaris Kami
            </h2>
            <p className="mt-2 text-dark-600">
              Pilihan produk favorit pelanggan dengan kualitas terbaik
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products">
              Semua Produk
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Products Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/products/${product.slug}`}>
                <Card className="group h-full overflow-hidden">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-dark-100">
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl font-bold text-dark-300">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                    {product.badge && (
                      <Badge
                        className="absolute left-3 top-3"
                        variant={
                          product.badge === "Best Seller"
                            ? "default"
                            : product.badge === "New"
                              ? "success"
                              : "secondary"
                        }
                      >
                        {product.badge}
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-dark/0 transition-colors group-hover:bg-dark/10" />
                    <Button
                      size="icon"
                      className="absolute bottom-3 right-3 opacity-0 transition-all group-hover:opacity-100"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm text-dark-500">{product.category}</p>
                    <h3 className="mt-1 font-semibold text-dark group-hover:text-primary">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-sm text-dark-400">
                        ({product.reviewCount} ulasan)
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-sm text-dark-500">
                        /{product.unit}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
