import { Metadata } from "next";
import { CheckoutContent } from "./checkout-content";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Checkout",
  description: "Selesaikan pesanan Anda di Madina Solution.",
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}
