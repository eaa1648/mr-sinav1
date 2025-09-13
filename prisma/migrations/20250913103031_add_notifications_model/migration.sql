-- CreateEnum
CREATE TYPE "public"."BildirimTipi" AS ENUM ('MR_YUKLEME', 'RAPOR_HAZIR', 'RANDEVU', 'SISTEM', 'HASTA_GUNCELLEME');

-- CreateEnum
CREATE TYPE "public"."BildirimOncelik" AS ENUM ('DUSUK', 'ORTA', 'YUKSEK');

-- CreateTable
CREATE TABLE "public"."bildirimler" (
    "bildirim_id" TEXT NOT NULL,
    "kullanici_id" TEXT NOT NULL,
    "tip" "public"."BildirimTipi" NOT NULL,
    "baslik" TEXT NOT NULL,
    "mesaj" TEXT NOT NULL,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "oncelik" "public"."BildirimOncelik" NOT NULL DEFAULT 'ORTA',
    "action_url" TEXT,
    "olusturulma_tarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme_tarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bildirimler_pkey" PRIMARY KEY ("bildirim_id")
);

-- AddForeignKey
ALTER TABLE "public"."bildirimler" ADD CONSTRAINT "bildirimler_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanicilar"("kullanici_id") ON DELETE RESTRICT ON UPDATE CASCADE;
