import type { StorageProvider } from "./types";
import { LocalStorageProvider } from "./local-provider";

/**
 * Get the active storage provider.
 * Returns Cloudinary if configured, else local filesystem.
 * This abstraction allows swapping providers without changing business logic.
 */
export function getStorageProvider(): StorageProvider {
  // Future: check for Cloudinary config
  // if (process.env.CLOUDINARY_CLOUD_NAME) {
  //   return new CloudinaryStorageProvider();
  // }

  return new LocalStorageProvider();
}
