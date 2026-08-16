import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Lihat hasil karya dan proyek-proyek yang telah kami kerjakan untuk berbagai klien.",
};

// Demo portfolio data
const portfolioItems = [
  {
    id: "1",
    title: "Branding Warung Makan Sederhana",
    category: "Branding",
    client: "Warung Mbak Sri",
    image: null,
    tags: ["Logo", "Menu", "Signage"],
  },
  {
    id: "2",
    title: "Company Profile PT Maju Jaya",
    category: "Design",
    client: "PT Maju Jaya",
    image: null,
    tags: ["Company Profile", "Print"],
  },
  {
    id: "3",
    title: "Event Backdrop Wedding",
    category: "Printing",
    client: "Wedding Organizer ABC",
    image: null,
    tags: ["Backdrop", "Banner", "Event"],
  },
  {
    id: "4",
    title: "Packaging Design Snack",
    category: "Branding",
    client: "Snack Krispi",
    image: null,
    tags: ["Packaging", "Design"],
  },
  {
    id: "5",
    title: "Neon Box Toko Elektronik",
    category: "Advertising",
    client: "Toko Elektronik Jaya",
    image: null,
    tags: ["Neon Box", "Signage"],
  },
  {
    id: "6",
    title: "Social Media Kit UMKM",
    category: "Design",
    client: "Batik Kedu",
    image: null,
    tags: ["Social Media", "Design"],
  },
  {
    id: "7",
    title: "Undangan Pernikahan Custom",
    category: "Printing",
    client: "Wedding Client",
    image: null,
    tags: ["Undangan", "Print"],
  },
  {
    id: "8",
    title: "Logo & Brand Identity Cafe",
    category: "Branding",
    client: "Kopi Nusantara",
    image: null,
    tags: ["Logo", "Branding", "Menu"],
  },
];

const categories = ["Semua", "Branding", "Design", "Printing", "Advertising"];

export default function PortfolioPage() {
  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Portfolio
          </span>
          <h1 className="mt-3 text-4xl font-bold text-dark lg:text-5xl">
            Hasil Karya Kami
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-dark-600">
            Lihat berbagai proyek yang telah kami kerjakan untuk klien dari
            berbagai industri.
          </p>
        </div>

        {/* Filter */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categories.map((category, index) => (
            <Button
              key={category}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item) => (
            <Card
              key={item.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-premium-lg"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-dark-100">
                <div className="flex h-full items-center justify-center">
                  <span className="text-4xl font-bold text-dark-300">
                    {item.title.charAt(0)}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-dark/0 opacity-0 transition-all group-hover:bg-dark/60 group-hover:opacity-100">
                  <Button variant="secondary">Lihat Detail</Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <Badge variant="secondary" className="mb-2">
                  {item.category}
                </Badge>
                <h3 className="font-semibold text-dark group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-dark-500">
                  Klien: {item.client}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-dark-50 px-2 py-0.5 text-xs text-dark-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            Muat Lebih Banyak
          </Button>
        </div>
      </div>
    </div>
  );
}
