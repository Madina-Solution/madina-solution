"use client";

import * as React from "react";
import { Minus, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { ProductOption } from "@/db/schema";
import { calculateTotalPrice, validateConfiguration } from "@/lib/validations/product";
import { useCart } from "@/lib/cart/cart-provider";
import { useToast } from "@/components/ui/toast";
import { ShoppingCart, Heart, Share2, Upload, Loader2, X } from "lucide-react";

type Props = {
  productId: string;
  productName: string;
  productSlug?: string;
  productThumbnail?: string | null;
  basePrice: number;
  unit: string;
  minOrder: number;
  options: ProductOption[];
};

export function ProductConfiguration({
  productId,
  productName,
  productSlug,
  productThumbnail,
  basePrice,
  unit,
  minOrder,
  options,
}: Props) {
  const [quantity, setQuantity] = React.useState(minOrder);
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    options.forEach((option) => {
      if (option.defaultValue) {
        defaults[option.key] = option.defaultValue;
      }
    });
    return defaults;
  });
  const [notes, setNotes] = React.useState("");
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<string[]>([]);
  const { addItem, openDrawer } = useCart();
  const { toast } = useToast();

  // Sort options by displayOrder
  const sortedOptions = React.useMemo(() => {
    return [...options].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [options]);

  // Calculate price
  const { unitPrice, subtotal, breakdown } = React.useMemo(() => {
    return calculateTotalPrice(basePrice, quantity, selectedOptions, options);
  }, [basePrice, quantity, selectedOptions, options]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= minOrder) {
      setQuantity(newQuantity);
    }
  };

  const handleOptionSelect = (key: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
    setErrors([]);
  };


  const uploadOptionFile = async (option: ProductOption, file: File) => {
    if (file.size > 25 * 1024 * 1024 || !file.type.startsWith("image/") && file.type !== "application/pdf") {
      setUploadErrors((p) => ({ ...p, [option.key]: "File harus berupa gambar atau PDF maksimal 25 MB." }));
      return;
    }
    setUploadErrors((p) => ({ ...p, [option.key]: "" }));
    setUploadingKey(option.key);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("purpose", "customer_upload");
      body.append("visibility", "private");
      const response = await fetch("/api/media/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Upload gagal");
      handleOptionSelect(option.key, data.media.url);
    } catch (error) {
      setUploadErrors((p) => ({ ...p, [option.key]: error instanceof Error ? error.message : "Upload gagal" }));
    } finally {
      setUploadingKey(null);
    }
  };

  const buildOptionsSummary = (): string => {
    return sortedOptions
      .filter((opt) => selectedOptions[opt.key])
      .map((opt) => {
        const val = selectedOptions[opt.key];
        if ((opt.type === "select" || opt.type === "radio") && opt.values) {
          const found = opt.values.find((v) => v.value === val);
          return found ? `${opt.name}: ${found.label}` : null;
        }
        return `${opt.name}: ${val}`;
      })
      .filter(Boolean)
      .join(" · ");
  };

  const handleAddToCart = () => {
    const config = {
      productId,
      quantity,
      selectedOptions,
      notes: notes || undefined,
    };

    const validation = validateConfiguration(config, options, minOrder);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    addItem({
      productId,
      productName: productName,
      productSlug: productSlug || ((typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "") || ""),
      productThumbnail: productThumbnail || null,
      selectedOptions,
      optionsSummary: buildOptionsSummary(),
      unit,
      quantity,
      estimatedUnitPrice: unitPrice,
      estimatedSubtotal: subtotal,
      notes: notes || "",
    });

    toast({
      type: "success",
      title: "Ditambahkan ke keranjang",
      description: `${productName} (${quantity} ${unit})`,
    });

    openDrawer();
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Options */}
      {sortedOptions.length > 0 && (
        <div className="space-y-5">
          {sortedOptions.map((option) => (
            <div key={option.id}>
              <label className="mb-2 block text-sm font-medium text-dark">
                {option.name}
                {option.required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>

              {option.helpText && (
                <p className="mb-2 text-xs text-dark-500">{option.helpText}</p>
              )}

              {/* Select / Radio Type */}
              {(option.type === "select" || option.type === "radio") && option.values && (
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value.value}
                      type="button"
                      onClick={() => handleOptionSelect(option.key, value.value)}
                      className={cn(
                        "rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all",
                        selectedOptions[option.key] === value.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-dark-200 text-dark-600 hover:border-dark-300"
                      )}
                    >
                      <span>{value.label}</span>
                      {value.priceModifier !== undefined && value.priceModifier !== 0 && (
                        <span className="ml-1 text-xs text-dark-500">
                          ({value.priceModifier > 0 ? "+" : ""}
                          {formatCurrency(value.priceModifier)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Text Type */}
              {option.type === "text" && (
                <Input
                  placeholder={option.placeholder || `Masukkan ${option.name.toLowerCase()}`}
                  value={selectedOptions[option.key] || ""}
                  onChange={(e) => handleOptionSelect(option.key, e.target.value)}
                />
              )}

              {/* Textarea Type */}
              {option.type === "textarea" && (
                <textarea
                  placeholder={option.placeholder || `Masukkan ${option.name.toLowerCase()}`}
                  value={selectedOptions[option.key] || ""}
                  onChange={(e) => handleOptionSelect(option.key, e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-dark-200 px-4 py-3 text-sm transition-colors placeholder:text-dark-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}

              {/* Number Type */}
              {option.type === "number" && (
                <Input
                  type="number"
                  placeholder={option.placeholder || `Masukkan ${option.name.toLowerCase()}`}
                  value={selectedOptions[option.key] || ""}
                  onChange={(e) => handleOptionSelect(option.key, e.target.value)}
                  min={option.validation?.min}
                  max={option.validation?.max}
                />
              )}

              {option.type === "checkbox" && (
                <label className="flex items-center gap-3 rounded-xl border border-dark-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={String(selectedOptions[option.key] ?? "false") === "true"}
                    onChange={(e) => handleOptionSelect(option.key, e.target.checked ? "true" : "false")}
                    className="h-4 w-4 rounded border-dark-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-dark-700">{option.placeholder || option.helpText || "Aktifkan pilihan ini"}</span>
                </label>
              )}

              {option.type === "file" && (
                <div className="space-y-2">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-dark-200 bg-dark-50/50 px-4 py-6 text-center transition hover:border-primary hover:bg-primary/5">
                    {uploadingKey === option.key ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-dark-400" />}
                    <span className="mt-2 text-sm font-semibold text-dark">{uploadingKey === option.key ? "Mengunggah…" : "Upload file desain"}</span>
                    <span className="mt-1 text-xs text-dark-400">Gambar/PDF maksimal 25 MB</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" disabled={uploadingKey === option.key} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadOptionFile(option, file); }} />
                  </label>
                  {selectedOptions[option.key] && (
                    <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                      <span className="truncate">File berhasil diupload</span>
                      <button type="button" onClick={() => handleOptionSelect(option.key, "")} aria-label="Hapus file"><X className="h-4 w-4" /></button>
                    </div>
                  )}
                  {uploadErrors[option.key] && <p className="text-xs text-red-600">{uploadErrors[option.key]}</p>}
                </div>
              )}

              {/* Value description */}
              {(option.type === "select" || option.type === "radio") && 
               selectedOptions[option.key] && 
               option.values?.find(v => v.value === selectedOptions[option.key])?.description && (
                <p className="mt-2 text-xs text-dark-500">
                  {option.values.find(v => v.value === selectedOptions[option.key])?.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="mb-2 block text-sm font-medium text-dark">
          Jumlah ({unit})
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-dark-200">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-l-xl rounded-r-none"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= minOrder}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || minOrder;
                setQuantity(Math.max(val, minOrder));
              }}
              className="w-20 border-x border-dark-200 bg-transparent py-2 text-center font-medium focus:outline-none"
              min={minOrder}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-l-none rounded-r-xl"
              onClick={() => handleQuantityChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-dark-500">
            Min. {minOrder} {unit}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-dark">
          Catatan (Opsional)
        </label>
        <textarea
          placeholder="Tambahkan catatan khusus untuk pesanan ini..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={1000}
          className="w-full rounded-xl border border-dark-200 px-4 py-3 text-sm transition-colors placeholder:text-dark-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-medium text-red-700">Mohon lengkapi data berikut:</p>
              <ul className="mt-1 list-inside list-disc text-sm text-red-600">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="rounded-xl bg-dark-50 p-4">
        <div className="space-y-2">
          {breakdown.length > 1 && (
            <div className="space-y-1 border-b border-dark-200 pb-2">
              {breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-dark-500">{item.label}</span>
                  <span className={item.amount >= 0 ? "text-dark-600" : "text-green-600"}>
                    {item.amount >= 0 ? "" : "-"}
                    {formatCurrency(Math.abs(item.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-dark-600">Harga Satuan</span>
            <span className="font-medium text-dark">
              {formatCurrency(unitPrice)}/{unit}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-dark-600">Jumlah</span>
            <span className="font-medium text-dark">
              {quantity} {unit}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-dark-200 pt-2">
            <span className="font-semibold text-dark">Subtotal</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Tambah ke Keranjang
        </Button>
        <Button type="button" size="lg" variant="outline" aria-label="Favorit">
          <Heart className="h-5 w-5" />
        </Button>
        <Button type="button" size="lg" variant="outline" aria-label="Bagikan">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
