import { Metadata } from "next";
import { CheckoutContent } from "./checkout-content";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Selesaikan pesanan Anda di Madina Solution.",
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}
