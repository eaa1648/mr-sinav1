-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('DOKTOR', 'YONETICI', 'ADMIN', 'HEMSIRE');

-- CreateEnum
CREATE TYPE "public"."IslemeStatus" AS ENUM ('BEKLEMEDE', 'ISLENIYOR', 'TAMAMLANDI', 'HATA');

-- CreateEnum
CREATE TYPE "public"."RaporStatus" AS ENUM ('TASLAK', 'INCELEME', 'ONAYLANDI', 'ARSIVLENDI');

-- CreateEnum
CREATE TYPE "public"."KayitStatus" AS ENUM ('BEKLEMEDE', 'ONAYLANDI', 'REDDEDILDI');

-- CreateTable
CREATE TABLE "public"."kullanicilar" (
    "kullanici_id" TEXT NOT NULL,
    "tc_kimlik_no" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "uzmanlik_alani" TEXT,
    "hastane_id" TEXT NOT NULL,
    "rol" "public"."Role" NOT NULL DEFAULT 'DOKTOR',
    "sifre" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kullanicilar_pkey" PRIMARY KEY ("kullanici_id")
);

-- CreateTable
CREATE TABLE "public"."hastalar" (
    "hasta_id" TEXT NOT NULL,
    "tc_kimlik_no" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "dogum_tarihi" TIMESTAMP(3),
    "cinsiyet" TEXT,
    "telefon" TEXT,
    "adres" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hastalar_pkey" PRIMARY KEY ("hasta_id")
);

-- CreateTable
CREATE TABLE "public"."klinik_moduller" (
    "modul_id" TEXT NOT NULL,
    "modul_adi" TEXT NOT NULL,
    "aciklama" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "klinik_moduller_pkey" PRIMARY KEY ("modul_id")
);

-- CreateTable
CREATE TABLE "public"."hasta_kayitlari" (
    "kayit_id" TEXT NOT NULL,
    "hasta_id" TEXT NOT NULL,
    "kullanici_id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "kayit_tarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hasta_kayitlari_pkey" PRIMARY KEY ("kayit_id")
);

-- CreateTable
CREATE TABLE "public"."mr_goruntuleri" (
    "mr_id" TEXT NOT NULL,
    "hasta_id" TEXT NOT NULL,
    "cekilis_tarihi" TIMESTAMP(3) NOT NULL,
    "orijinal_dosya_yolu" TEXT NOT NULL,
    "islenmis_veri_yolu" TEXT,
    "dosya_boyutu" INTEGER,
    "isleme_durumu" "public"."IslemeStatus" NOT NULL DEFAULT 'BEKLEMEDE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mr_goruntuleri_pkey" PRIMARY KEY ("mr_id")
);

-- CreateTable
CREATE TABLE "public"."klinik_olcek_puanlari" (
    "sonuc_id" TEXT NOT NULL,
    "hasta_id" TEXT NOT NULL,
    "olcek_adi" TEXT NOT NULL,
    "puan" DOUBLE PRECISION NOT NULL,
    "max_puan" DOUBLE PRECISION,
    "degerlendirme_tarihi" TIMESTAMP(3) NOT NULL,
    "giren_kullanici_id" TEXT NOT NULL,
    "notlar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "klinik_olcek_puanlari_pkey" PRIMARY KEY ("sonuc_id")
);

-- CreateTable
CREATE TABLE "public"."ilac_tedavileri" (
    "tedavi_id" TEXT NOT NULL,
    "hasta_id" TEXT NOT NULL,
    "ilac_adi" TEXT NOT NULL,
    "dozaj" TEXT NOT NULL,
    "birim" TEXT,
    "baslangic_tarihi" TIMESTAMP(3) NOT NULL,
    "bitis_tarihi" TIMESTAMP(3),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "notlar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ilac_tedavileri_pkey" PRIMARY KEY ("tedavi_id")
);

-- CreateTable
CREATE TABLE "public"."raporlar" (
    "rapor_id" TEXT NOT NULL,
    "hasta_id" TEXT NOT NULL,
    "olusturan_kullanici_id" TEXT NOT NULL,
    "olusturma_tarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "yapay_zeka_yorumu" TEXT,
    "optimizasyon_sonucu" JSONB,
    "doktor_gorusleri" TEXT,
    "gaf_uyum_skoru" DOUBLE PRECISION,
    "rapor_dosya_yolu" TEXT,
    "mr_id_1" TEXT,
    "mr_id_2" TEXT,
    "durum" "public"."RaporStatus" NOT NULL DEFAULT 'TASLAK',

    CONSTRAINT "raporlar_pkey" PRIMARY KEY ("rapor_id")
);

-- CreateTable
CREATE TABLE "public"."bekleyen_kayitlar" (
    "id" TEXT NOT NULL,
    "tc_kimlik_no" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "uzmanlik_alani" TEXT NOT NULL,
    "hastane_id" TEXT NOT NULL,
    "hastane_adi" TEXT,
    "sifre" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "diploma_no" TEXT,
    "mezuniyet_tarihi" TIMESTAMP(3),
    "basvuru_tarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durum" "public"."KayitStatus" NOT NULL DEFAULT 'BEKLEMEDE',
    "onay_tarihi" TIMESTAMP(3),
    "onaylayan_kullanici_id" TEXT,
    "red_nedeni" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bekleyen_kayitlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hastaneler" (
    "hastane_id" TEXT NOT NULL,
    "hastane_adi" TEXT NOT NULL,
    "sehir" TEXT NOT NULL,
    "adres" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "website" TEXT,
    "aktif_doktor_sayisi" INTEGER NOT NULL DEFAULT 0,
    "aktif_hasta_sayisi" INTEGER NOT NULL DEFAULT 0,
    "koordinat_x" DOUBLE PRECISION,
    "koordinat_y" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hastaneler_pkey" PRIMARY KEY ("hastane_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kullanicilar_tc_kimlik_no_key" ON "public"."kullanicilar"("tc_kimlik_no");

-- CreateIndex
CREATE UNIQUE INDEX "hastalar_tc_kimlik_no_key" ON "public"."hastalar"("tc_kimlik_no");

-- CreateIndex
CREATE UNIQUE INDEX "klinik_moduller_modul_adi_key" ON "public"."klinik_moduller"("modul_adi");

-- CreateIndex
CREATE UNIQUE INDEX "bekleyen_kayitlar_tc_kimlik_no_key" ON "public"."bekleyen_kayitlar"("tc_kimlik_no");

-- CreateIndex
CREATE UNIQUE INDEX "hastaneler_hastane_adi_key" ON "public"."hastaneler"("hastane_adi");

-- AddForeignKey
ALTER TABLE "public"."kullanicilar" ADD CONSTRAINT "kullanicilar_hastane_id_fkey" FOREIGN KEY ("hastane_id") REFERENCES "public"."hastaneler"("hastane_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hasta_kayitlari" ADD CONSTRAINT "hasta_kayitlari_hasta_id_fkey" FOREIGN KEY ("hasta_id") REFERENCES "public"."hastalar"("hasta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hasta_kayitlari" ADD CONSTRAINT "hasta_kayitlari_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanicilar"("kullanici_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hasta_kayitlari" ADD CONSTRAINT "hasta_kayitlari_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "public"."klinik_moduller"("modul_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mr_goruntuleri" ADD CONSTRAINT "mr_goruntuleri_hasta_id_fkey" FOREIGN KEY ("hasta_id") REFERENCES "public"."hastalar"("hasta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."klinik_olcek_puanlari" ADD CONSTRAINT "klinik_olcek_puanlari_hasta_id_fkey" FOREIGN KEY ("hasta_id") REFERENCES "public"."hastalar"("hasta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."klinik_olcek_puanlari" ADD CONSTRAINT "klinik_olcek_puanlari_giren_kullanici_id_fkey" FOREIGN KEY ("giren_kullanici_id") REFERENCES "public"."kullanicilar"("kullanici_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ilac_tedavileri" ADD CONSTRAINT "ilac_tedavileri_hasta_id_fkey" FOREIGN KEY ("hasta_id") REFERENCES "public"."hastalar"("hasta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."raporlar" ADD CONSTRAINT "raporlar_hasta_id_fkey" FOREIGN KEY ("hasta_id") REFERENCES "public"."hastalar"("hasta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."raporlar" ADD CONSTRAINT "raporlar_olusturan_kullanici_id_fkey" FOREIGN KEY ("olusturan_kullanici_id") REFERENCES "public"."kullanicilar"("kullanici_id") ON DELETE RESTRICT ON UPDATE CASCADE;
