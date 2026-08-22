import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="absolute left-0 right-0 top-0 z-10 lg:hidden">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-dark-600 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: Brand storytelling */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-dark lg:flex">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">
                <span className="text-lg font-bold">M</span>
              </div>
              <div>
                <h1 className="text-base font-bold">Madina Solution</h1>
                <p className="text-xs text-white/70">Creative Business Platform</p>
              </div>
            </Link>

            {/* Center: Story */}
            <div className="max-w-md">
              <h2 className="text-balance text-4xl font-bold leading-tight">
                Bangun visual yang membuat bisnis terlihat lebih bernilai.
              </h2>
              <p className="mt-4 text-pretty text-lg text-white/80">
                Dari desain hingga produksi, Madina Solution membantu bisnis
                menghadirkan identitas visual yang kuat, konsisten, dan siap
                tampil di dunia nyata.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold">500+</p>
                  <p className="mt-1 text-sm text-white/70">Klien Puas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">10+</p>
                  <p className="mt-1 text-sm text-white/70">Tahun</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="mt-1 text-sm text-white/70">Rating</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-sm text-white/60">
              &copy; {new Date().getFullYear()} Madina Solution. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right: Auth content */}
        <div className="flex items-center justify-center px-4 py-12 lg:px-12">
          <div className="w-full max-w-md">
            {/* Desktop back link */}
            <Link
              href="/"
              className="mb-6 hidden items-center gap-2 text-sm font-medium text-dark-500 transition-colors hover:text-primary lg:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
