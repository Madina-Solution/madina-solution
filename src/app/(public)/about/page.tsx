import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target, Eye, Heart, Award, Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Madina Solution adalah creative business platform yang membantu usaha membangun citra profesional melalui desain grafis, digital printing, dan branding.",
};

const values = [
  {
    icon: Award,
    title: "Kualitas",
    description:
      "Kami berkomitmen memberikan hasil terbaik dengan material premium dan teknologi cetak modern.",
  },
  {
    icon: Heart,
    title: "Integritas",
    description:
      "Kejujuran dan transparansi adalah fondasi hubungan kami dengan setiap pelanggan.",
  },
  {
    icon: Users,
    title: "Kolaborasi",
    description:
      "Kami bekerja sama dengan pelanggan untuk memahami dan mewujudkan visi mereka.",
  },
  {
    icon: Clock,
    title: "Ketepatan",
    description:
      "Deadline adalah komitmen. Kami memastikan setiap proyek selesai tepat waktu.",
  },
];

const milestones = [
  { year: "2014", title: "Awal Perjalanan", description: "Madina Solution didirikan di Temanggung" },
  { year: "2016", title: "Ekspansi Layanan", description: "Menambah layanan branding dan advertising" },
  { year: "2019", title: "500+ Klien", description: "Mencapai 500 klien puas dari berbagai daerah" },
  { year: "2022", title: "Transformasi Digital", description: "Meluncurkan platform digital untuk kemudahan pemesanan" },
  { year: "2024", title: "Madina Evolution", description: "Evolusi menjadi creative business platform" },
];

export default function AboutPage() {
  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Hero */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Tentang Kami
            </span>
            <h1 className="mt-3 text-4xl font-bold text-dark lg:text-5xl">
              Partner Kreatif untuk{" "}
              <span className="text-gradient">Bisnis Anda</span>
            </h1>
            <p className="mt-6 text-lg text-dark-600">
              {BRAND.description}
            </p>
            <p className="mt-4 text-dark-600">
              Dengan pengalaman lebih dari 10 tahun, kami telah membantu ratusan
              bisnis di Temanggung dan sekitarnya membangun identitas visual
              yang kuat dan profesional.
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild>
                <Link href="/contact">
                  Hubungi Kami
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/portfolio">Lihat Portfolio</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 lg:aspect-[4/3]">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white">
                  <span className="text-5xl font-bold">M</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-dark">
                  {BRAND.name}
                </h3>
                <p className="mt-2 text-dark-500">{BRAND.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="mt-24 grid gap-8 lg:grid-cols-2">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                <Eye className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-dark">Visi</h2>
              <p className="mt-4 text-lg text-dark-600">
                Menjadi creative business platform terdepan yang membantu setiap
                bisnis tampil profesional dan berkembang melalui identitas
                visual yang kuat.
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-dark">Misi</h2>
              <ul className="mt-4 space-y-2 text-dark-600">
                <li>• Memberikan layanan desain dan cetak berkualitas premium</li>
                <li>• Menyediakan solusi branding yang terjangkau untuk UMKM</li>
                <li>• Membangun hubungan jangka panjang dengan setiap klien</li>
                <li>• Terus berinovasi mengikuti perkembangan teknologi</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-dark">Nilai-Nilai Kami</h2>
            <p className="mx-auto mt-4 max-w-2xl text-dark-600">
              Prinsip yang menjadi fondasi dalam setiap pekerjaan kami
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-dark">{value.title}</h3>
                  <p className="mt-2 text-sm text-dark-500">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-dark">Perjalanan Kami</h2>
            <p className="mx-auto mt-4 max-w-2xl text-dark-600">
              Milestone penting dalam perjalanan Madina Solution
            </p>
          </div>
          <div className="mt-12">
            <div className="relative">
              <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-dark-200 lg:block" />
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.year}
                    className={`relative flex flex-col items-center gap-4 lg:flex-row ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`flex-1 rounded-2xl bg-dark-50 p-6 ${
                        index % 2 === 0 ? "lg:text-right" : "lg:text-left"
                      }`}
                    >
                      <span className="text-sm font-semibold text-primary">
                        {milestone.year}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold text-dark">
                        {milestone.title}
                      </h3>
                      <p className="mt-1 text-dark-500">
                        {milestone.description}
                      </p>
                    </div>
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-lg">
                      <span className="text-xs font-bold">{milestone.year.slice(-2)}</span>
                    </div>
                    <div className="hidden flex-1 lg:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-8 text-center text-white lg:p-12">
          <h2 className="text-3xl font-bold lg:text-4xl">
            Siap Bekerja Sama dengan Kami?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Konsultasikan kebutuhan desain dan cetak bisnis Anda. Tim kami siap
            membantu mewujudkan visi Anda.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/contact">
                Hubungi Kami
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/services">Lihat Layanan</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
