"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Clock,
  Truck,
  MapPin,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useCart } from "@/lib/cart/cart-provider";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { checkoutSchema, type CheckoutData } from "@/lib/validations/checkout";

type CheckoutStep = "details" | "review" | "success";

export function CheckoutContent() {
  const router = useRouter();
  const { state: cart, clearCart } = useCart();
  const { toast } = useToast();
  const [step, setStep] = React.useState<CheckoutStep>("details");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderResult, setOrderResult] = React.useState<{
    orderNumber: string;
    total: number;
  } | null>(null);
  const [deliveryMethod, setDeliveryMethod] = React.useState<"delivery" | "pickup">("delivery");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customer: { name: "", email: "", phone: "", whatsapp: "" },
      address: { recipientName: "", phone: "", address: "", city: "", province: "", district: "", postalCode: "" },
      deliveryMethod: "delivery" as const,
      items: [] as { productId: string; quantity: number; selectedOptions: Record<string, string>; notes?: string }[],
      notes: "",
      couponCode: "",
    },
  });

  // Redirect to cart if empty
  React.useEffect(() => {
    if (cart.items.length === 0 && step !== "success") {
      router.push("/cart");
    }
  }, [cart.items.length, step, router]);

  const onSubmit = async (formData: Record<string, unknown>) => {
    const fd = formData as unknown as CheckoutData;
    setIsSubmitting(true);
    try {
      const payload = {
        customer: fd.customer,
        address: fd.address,
        deliveryMethod,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          notes: item.notes || undefined,
        })),
        notes: fd.notes,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast({
          type: "error",
          title: "Gagal membuat pesanan",
          description: result.error?.message || "Silakan coba lagi.",
        });
        return;
      }

      setOrderResult({
        orderNumber: result.order.orderNumber,
        total: result.order.total,
      });
      setStep("success");
      clearCart();
    } catch {
      toast({
        type: "error",
        title: "Terjadi kesalahan",
        description: "Koneksi gagal. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step: Success
  if (step === "success" && orderResult) {
    return (
      <div className="py-16 lg:py-24">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-dark">Pesanan Berhasil!</h1>
          <p className="mt-3 text-dark-600">
            Terima kasih. Pesanan Anda telah diterima dan sedang diproses.
          </p>
          <div className="mt-6 rounded-2xl border border-dark-100 bg-dark-50 p-6">
            <p className="text-sm text-dark-500">Nomor Pesanan</p>
            <p className="mt-1 text-2xl font-bold text-primary">{orderResult.orderNumber}</p>
            <p className="mt-4 text-sm text-dark-500">Total</p>
            <p className="mt-1 text-xl font-semibold text-dark">{formatCurrency(orderResult.total)}</p>
          </div>
          <p className="mt-6 text-sm text-dark-500">
            Simpan nomor pesanan Anda. Tim kami akan segera menghubungi untuk konfirmasi.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/products">Lanjut Belanja</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0 && step !== "success") {
    return null; // redirect is happening
  }

  // Step: Details + Review (single form)
  return (
    <div className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/" },
            { label: "Keranjang", href: "/cart" },
            { label: "Checkout" },
          ]}
          className="mb-6"
        />

        <h1 className="text-3xl font-bold text-dark">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* LEFT — Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Customer */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-dark">
                    <User className="h-5 w-5 text-primary" />
                    Informasi Pelanggan
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-dark">Nama Lengkap *</label>
                      <Input id="c-name" placeholder="Nama lengkap" {...register("customer.name")} error={errors.customer?.name?.message} />
                    </div>
                    <div>
                      <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-dark">Email *</label>
                      <Input id="c-email" type="email" placeholder="nama@email.com" {...register("customer.email")} error={errors.customer?.email?.message} />
                    </div>
                    <div>
                      <label htmlFor="c-phone" className="mb-1.5 block text-sm font-medium text-dark">Telepon *</label>
                      <Input id="c-phone" placeholder="08xx-xxxx-xxxx" {...register("customer.phone")} error={errors.customer?.phone?.message} />
                    </div>
                    <div>
                      <label htmlFor="c-wa" className="mb-1.5 block text-sm font-medium text-dark">WhatsApp</label>
                      <Input id="c-wa" placeholder="Sama dengan telepon jika kosong" {...register("customer.whatsapp")} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Method */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-dark">
                    <Truck className="h-5 w-5 text-primary" />
                    Metode Pengiriman
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("delivery")}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${deliveryMethod === "delivery" ? "border-primary bg-primary/5" : "border-dark-200 hover:border-dark-300"}`}
                    >
                      <Truck className="h-5 w-5 text-primary" />
                      <p className="mt-2 font-semibold text-dark">Pengiriman</p>
                      <p className="mt-1 text-sm text-dark-500">Dikirim ke alamat Anda</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("pickup")}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${deliveryMethod === "pickup" ? "border-primary bg-primary/5" : "border-dark-200 hover:border-dark-300"}`}
                    >
                      <MapPin className="h-5 w-5 text-primary" />
                      <p className="mt-2 font-semibold text-dark">Ambil Sendiri</p>
                      <p className="mt-1 text-sm text-dark-500">Ambil di lokasi Madina Solution</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              {deliveryMethod === "delivery" && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-dark">
                      <MapPin className="h-5 w-5 text-primary" />
                      Alamat Pengiriman
                    </h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="a-recip" className="mb-1.5 block text-sm font-medium text-dark">Nama Penerima *</label>
                        <Input id="a-recip" placeholder="Nama penerima" {...register("address.recipientName")} error={errors.address?.recipientName?.message} />
                      </div>
                      <div>
                        <label htmlFor="a-phone" className="mb-1.5 block text-sm font-medium text-dark">Telepon Penerima *</label>
                        <Input id="a-phone" placeholder="08xx-xxxx-xxxx" {...register("address.phone")} error={errors.address?.phone?.message} />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="a-addr" className="mb-1.5 block text-sm font-medium text-dark">Alamat Lengkap *</label>
                        <Input id="a-addr" placeholder="Jalan, RT/RW, nomor rumah" {...register("address.address")} error={errors.address?.address?.message} />
                      </div>
                      <div>
                        <label htmlFor="a-dist" className="mb-1.5 block text-sm font-medium text-dark">Kecamatan</label>
                        <Input id="a-dist" placeholder="Kecamatan" {...register("address.district")} />
                      </div>
                      <div>
                        <label htmlFor="a-city" className="mb-1.5 block text-sm font-medium text-dark">Kota/Kabupaten *</label>
                        <Input id="a-city" placeholder="Kota / Kabupaten" {...register("address.city")} error={errors.address?.city?.message} />
                      </div>
                      <div>
                        <label htmlFor="a-prov" className="mb-1.5 block text-sm font-medium text-dark">Provinsi *</label>
                        <Input id="a-prov" placeholder="Provinsi" {...register("address.province")} error={errors.address?.province?.message} />
                      </div>
                      <div>
                        <label htmlFor="a-post" className="mb-1.5 block text-sm font-medium text-dark">Kode Pos</label>
                        <Input id="a-post" placeholder="Kode pos" {...register("address.postalCode")} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-dark">Catatan Pesanan</h2>
                  <textarea
                    placeholder="Catatan tambahan untuk pesanan ini (opsional)"
                    rows={3}
                    className="mt-4 w-full rounded-xl border border-dark-200 px-4 py-3 text-sm placeholder:text-dark-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    {...register("notes")}
                  />
                </CardContent>
              </Card>
            </div>

            {/* RIGHT — Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-dark">Ringkasan Pesanan</h2>

                  {/* Items */}
                  <div className="mt-4 space-y-3">
                    {cart.items.map((item) => (
                      <div key={item.cartItemId} className="flex gap-3 border-b border-dark-100 pb-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-dark-50 text-lg font-bold text-dark-300">
                          {item.productName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-dark">{item.productName}</p>
                          <p className="text-xs text-dark-500 line-clamp-1">{item.optionsSummary}</p>
                          <p className="text-xs text-dark-500">
                            {item.quantity} {item.unit} × {formatCurrency(item.estimatedUnitPrice)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-dark">
                          {formatCurrency(item.estimatedSubtotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-4 space-y-2 border-b border-dark-100 pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-600">Subtotal</span>
                      <span className="font-medium text-dark">{formatCurrency(cart.estimatedTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-600">Pengiriman</span>
                      <span className="text-dark-500">{deliveryMethod === "pickup" ? "Gratis" : "Dihitung terpisah"}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <span className="font-semibold text-dark">Estimasi Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(cart.estimatedTotal)}</span>
                  </div>

                  <p className="mt-2 text-xs text-dark-400">
                    Harga final dihitung ulang oleh server. Ongkos kirim akan diinformasikan melalui WhatsApp.
                  </p>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="mt-6 w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Buat Pesanan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <Button variant="outline" className="mt-2 w-full" asChild>
                    <Link href="/cart">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali ke Keranjang
                    </Link>
                  </Button>

                  {/* Trust */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-dark-500">
                      <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                      Garansi kualitas cetak
                    </div>
                    <div className="flex items-center gap-2 text-xs text-dark-500">
                      <Clock className="h-3.5 w-3.5 text-orange-600" />
                      Konfirmasi dalam 24 jam
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
