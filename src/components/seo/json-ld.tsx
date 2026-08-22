type Props = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization / LocalBusiness
export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Madina Solution",
    description:
      "Layanan desain grafis, digital printing, branding, dan advertising profesional.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://madinasolution.web.app",
    telephone: "+6281393005035",
    email: "Perc.madina@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dusun Ngleri, Desa Ngadimulyo",
      addressLocality: "Kedu",
      addressRegion: "Jawa Tengah",
      addressCountry: "ID",
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: { "@type": "GeoCoordinates", latitude: -7.3, longitude: 110.1 },
    },
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "17:00",
    },
  };

  return <JsonLd data={data} />;
}

// Product schema
export function ProductSchema({
  name,
  description,
  price,
  currency = "IDR",
  availability = "InStock",
  url,
  image,
  sku,
  rating,
  reviewCount,
}: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  availability?: string;
  url: string;
  image?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url,
    brand: { "@type": "Brand", name: "Madina Solution" },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
    },
  };

  if (image) data.image = image;
  if (sku) data.sku = sku;

  if (rating && reviewCount && reviewCount > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
    };
  }

  return <JsonLd data={data} />;
}

// Breadcrumb schema
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

// WebSite with SearchAction
export function WebSiteSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://madinasolution.web.app";
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Madina Solution",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/products?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLd data={data} />;
}
