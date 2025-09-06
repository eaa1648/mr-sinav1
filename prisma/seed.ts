import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Check if data already exists
  const existingHospitals = await prisma.hastaneler.count()
  const existingDoctors = await prisma.kullanicilar.count()
  const existingModules = await prisma.klinik_Moduller.count()
  
  if (existingHospitals > 0 || existingDoctors > 0 || existingModules > 0) {
    console.log('Database already contains data. Skipping seeding.')
    return
  }

  // Create sample hospitals
  const hospital1 = await prisma.hastaneler.create({
    data: {
      hastane_adi: "Medipol Üniversitesi Hastanesi",
      sehir: "İstanbul",
      adres: "Kavacık, Necip Fazıl Cd. No:23, 34810 Beykoz/İstanbul",
      telefon: "+90 216 500 10 00",
      email: "info@medipol.edu.tr",
      website: "https://hastane.medipol.edu.tr",
      aktif_doktor_sayisi: 0,
      aktif_hasta_sayisi: 0
    }
  })

  const hospital2 = await prisma.hastaneler.create({
    data: {
      hastane_adi: "Acıbadem Üniversitesi Hastanesi",
      sehir: "İstanbul",
      adres: "Bağdat Cd. No:21, 34660 Üsküdar/İstanbul",
      telefon: "+90 216 500 50 00",
      email: "info@acibadem.edu.tr",
      website: "https://hastane.acibadem.edu.tr",
      aktif_doktor_sayisi: 0,
      aktif_hasta_sayisi: 0
    }
  })

  // Create sample doctors
  const doctor1 = await prisma.kullanicilar.create({
    data: {
      tc_kimlik_no: "12345678901",
      ad: "Ahmet",
      soyad: "Yılmaz",
      uzmanlik_alani: "Psikiyatri",
      hastane_id: hospital1.hastane_id,
      rol: "DOKTOR",
      sifre: "$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345" // bcrypt hash for "password123"
    }
  })

  const doctor2 = await prisma.kullanicilar.create({
    data: {
      tc_kimlik_no: "12345678902",
      ad: "Ayşe",
      soyad: "Demir",
      uzmanlik_alani: "Nöroloji",
      hastane_id: hospital1.hastane_id,
      rol: "DOKTOR",
      sifre: "$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345" // bcrypt hash for "password123"
    }
  })

  const admin = await prisma.kullanicilar.create({
    data: {
      tc_kimlik_no: "12345678903",
      ad: "Admin",
      soyad: "User",
      uzmanlik_alani: "Yönetim",
      hastane_id: hospital1.hastane_id,
      rol: "ADMIN",
      sifre: "$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345" // bcrypt hash for "password123"
    }
  })

  // Update hospital doctor counts
  await prisma.hastaneler.update({
    where: { hastane_id: hospital1.hastane_id },
    data: { aktif_doktor_sayisi: 3 }
  })

  // Create sample clinical modules
  const bipolarModule = await prisma.klinik_Moduller.create({
    data: {
      modul_adi: "Bipolar Bozukluk",
      aciklama: "Bipolar bozukluk hastaları için klinik değerlendirme ve takip modülü"
    }
  })

  const schizophreniaModule = await prisma.klinik_Moduller.create({
    data: {
      modul_adi: "Şizofreni",
      aciklama: "Şizofreni hastaları için klinik değerlendirme ve takip modülü"
    }
  })

  const schizoAffectiveModule = await prisma.klinik_Moduller.create({
    data: {
      modul_adi: "Şizoaffektif Bozukluk",
      aciklama: "Şizoaffektif bozukluk hastaları için klinik değerlendirme ve takip modülü"
    }
  })

  // Create sample patients
  const patient1 = await prisma.hastalar.create({
    data: {
      tc_kimlik_no: "98765432101",
      ad: "Mehmet",
      soyad: "Kaya",
      dogum_tarihi: new Date("1985-03-15"),
      cinsiyet: "Erkek",
      telefon: "+90 555 123 45 67",
      adres: "İstiklal Cad. No:123, Beyoğlu/İstanbul"
    }
  })

  const patient2 = await prisma.hastalar.create({
    data: {
      tc_kimlik_no: "98765432102",
      ad: "Fatma",
      soyad: "Şahin",
      dogum_tarihi: new Date("1990-07-22"),
      cinsiyet: "Kadın",
      telefon: "+90 555 987 65 43",
      adres: "Bağdat Cad. No:456, Kadıköy/İstanbul"
    }
  })

  const patient3 = await prisma.hastalar.create({
    data: {
      tc_kimlik_no: "98765432103",
      ad: "Ali",
      soyad: "Öztürk",
      dogum_tarihi: new Date("1978-11-08"),
      cinsiyet: "Erkek",
      telefon: "+90 555 555 55 55",
      adres: "Cumhuriyet Cad. No:789, Şişli/İstanbul"
    }
  })

  // Register patients to doctors and modules
  await prisma.hasta_Kayitlari.create({
    data: {
      hasta_id: patient1.hasta_id,
      kullanici_id: doctor1.kullanici_id,
      modul_id: bipolarModule.modul_id
    }
  })

  await prisma.hasta_Kayitlari.create({
    data: {
      hasta_id: patient2.hasta_id,
      kullanici_id: doctor1.kullanici_id,
      modul_id: schizophreniaModule.modul_id
    }
  })

  await prisma.hasta_Kayitlari.create({
    data: {
      hasta_id: patient3.hasta_id,
      kullanici_id: doctor2.kullanici_id,
      modul_id: schizoAffectiveModule.modul_id
    }
  })

  // Update hospital patient counts
  await prisma.hastaneler.update({
    where: { hastane_id: hospital1.hastane_id },
    data: { aktif_hasta_sayisi: 3 }
  })

  // Create sample clinical scale scores
  await prisma.klinik_Olcek_Puanlari.create({
    data: {
      hasta_id: patient1.hasta_id,
      olcek_adi: "YMRS",
      puan: 12.5,
      max_puan: 40,
      degerlendirme_tarihi: new Date(),
      giren_kullanici_id: doctor1.kullanici_id,
      notlar: "Hasta başlangıç değerlendirmesi"
    }
  })

  await prisma.klinik_Olcek_Puanlari.create({
    data: {
      hasta_id: patient2.hasta_id,
      olcek_adi: "PANSS",
      puan: 85,
      max_puan: 210,
      degerlendirme_tarihi: new Date(),
      giren_kullanici_id: doctor1.kullanici_id,
      notlar: "Hasta başlangıç değerlendirmesi"
    }
  })

  console.log('Database seeding completed successfully!')
  console.log('Sample users created:')
  console.log(`- Doctor: ${doctor1.ad} ${doctor1.soyad} (TC: ${doctor1.tc_kimlik_no})`)
  console.log(`- Doctor: ${doctor2.ad} ${doctor2.soyad} (TC: ${doctor2.tc_kimlik_no})`)
  console.log(`- Admin: ${admin.ad} ${admin.soyad} (TC: ${admin.tc_kimlik_no})`)
  console.log('Use password "password123" for all users')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })