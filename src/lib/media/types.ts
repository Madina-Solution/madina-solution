export type MediaPurpose =
  | "order_asset"
  | "design_revision"
  | "customer_upload"
  | "production_asset"
  | "portfolio"
  | "avatar";

export type MediaVisibility = "private" | "public";

export type UploadOptions = {
  purpose: MediaPurpose;
  visibility?: MediaVisibility;
  orderId?: string;
  revisionId?: string;
  folder?: string;
};

export type UploadResult = {
  storageKey: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
};

// Provider interface — implementations can be swapped
export interface StorageProvider {
  upload(buffer: Buffer, filename: string, mimeType: string, options?: UploadOptions): Promise<UploadResult>;
  delete(storageKey: string): Promise<void>;
  getUrl(storageKey: string): string;
}
