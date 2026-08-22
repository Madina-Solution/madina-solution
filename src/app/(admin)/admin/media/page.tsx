import { db } from "@/db";
import { media, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ImageIcon, File } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const list = await db.select({ id: media.id, filename: media.originalFilename, mimeType: media.mimeType, size: media.size, url: media.url, purpose: media.purpose, visibility: media.visibility, createdAt: media.createdAt, uploaderName: users.name }).from(media).leftJoin(users, eq(media.userId, users.id)).orderBy(desc(media.createdAt)).limit(100);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-dark">Media Library</h1><p className="mt-1 text-dark-500">{list.length} file</p></div>
      <div className="rounded-2xl border border-dark-100 bg-white">
        {list.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-dark-100 text-left">
            <th className="px-5 py-3 font-medium text-dark-500">File</th>
            <th className="px-5 py-3 font-medium text-dark-500">Tipe</th>
            <th className="px-5 py-3 font-medium text-dark-500">Ukuran</th>
            <th className="px-5 py-3 font-medium text-dark-500">Tujuan</th>
            <th className="px-5 py-3 font-medium text-dark-500">Oleh</th>
            <th className="px-5 py-3 font-medium text-dark-500">Tanggal</th>
          </tr></thead><tbody>{list.map((m) => (
            <tr key={m.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50/50">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-50">
                    {m.mimeType.startsWith("image/") ? <ImageIcon className="h-4 w-4 text-dark-400" /> : <File className="h-4 w-4 text-dark-400" />}
                  </div>
                  <span className="font-medium text-dark truncate max-w-[200px]">{m.filename}</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-xs text-dark-500">{m.mimeType}</td>
              <td className="px-5 py-3.5 text-dark-600">{formatSize(m.size)}</td>
              <td className="px-5 py-3.5"><Badge variant="secondary">{m.purpose}</Badge></td>
              <td className="px-5 py-3.5 text-dark-600">{m.uploaderName || "System"}</td>
              <td className="px-5 py-3.5 text-xs text-dark-500">{formatDate(m.createdAt)}</td>
            </tr>
          ))}</tbody></table></div>
        ) : <div className="flex flex-col items-center justify-center py-16"><ImageIcon className="h-10 w-10 text-dark-300" /><p className="mt-4 font-semibold text-dark">Belum ada media</p><p className="mt-1 text-sm text-dark-500">File yang diupload akan tampil di sini.</p></div>}
      </div>
    </div>
  );
}
