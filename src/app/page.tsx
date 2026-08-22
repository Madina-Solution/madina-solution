import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/json-ld";
import { Hero } from "@/components/home/hero";
import { Services } from "@/components/home/services";
import { FeaturedProducts } from "@/components/home/featured-products";
import { WhyUs } from "@/components/home/why-us";
import { Testimonials } from "@/components/home/testimonials";
import { Process } from "@/components/home/process";
import { FAQ } from "@/components/home/faq";
import { CTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <Header />
      <main>
        <Hero />
        <Services />
        <FeaturedProducts />
        <WhyUs />
        <Process />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
