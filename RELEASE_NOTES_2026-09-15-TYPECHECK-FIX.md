# Release 1.1.3 — TypeScript Generated-Types Fix

Tanggal: 15 September 2026

## Masalah

`npm run typecheck` gagal dengan 97 error yang seluruhnya mengarah ke generated type files di `.next/dev/types/validator.ts` dan `.next/types/validator.ts`. Log produksi menunjukkan `next build` berhasil menyelesaikan kompilasi TypeScript dan menghasilkan seluruh halaman produksi, sehingga kegagalan standalone `tsc` berasal dari generated/cache state yang tidak stabil, bukan dari error source yang sama.

## Perbaikan

1. Standalone TypeScript check sekarang menjalankan:
   `tsc --noEmit --incremental false`
2. `tsconfig.json` mengecualikan `.next` dari standalone source typecheck, sehingga generated dev/build validator tidak menjadi sumber false failure.
3. Next-specific route/type validation tetap dilakukan oleh `next build` pada release gate.
4. Ditambahkan `scripts/validate-typecheck-config.mjs` untuk mencegah konfigurasi typecheck kembali menggunakan generated `.next` types secara tidak sengaja.
5. Validator konfigurasi baru dimasukkan ke `npm run validate:release`.

## Verifikasi source-level

- Typecheck configuration: PASS
- Navigation: PASS
- Integrity: PASS
- Media: PASS
- Social auth: PASS
- Access control: PASS
- Persistence: PASS
- UI architecture: 10/10 PASS
- Commerce/review/media: 15/15 PASS
- SEO: PASS
- Full-page regression: PASS
- Page inventory: 55 page.tsx / 49 normalized routes

## Catatan release gate

`npm install`, `npm run typecheck`, `npm run lint`, dan `npm run build` penuh harus tetap dijalankan di mesin proyek utama setelah menerima release ini. Pada log terbaru pengguna, `next build` telah berhasil sedangkan `typecheck` gagal karena generated `.next` types.
