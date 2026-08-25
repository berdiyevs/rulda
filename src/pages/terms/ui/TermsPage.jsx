import { useState } from 'react'
import { Container, Stack, Title, Text, List, Box } from '@mantine/core'
import { Navbar } from '../../../widgets/navbar'
import { LoginModal } from '../../../widgets/login-modal'
import { Footer } from '../../../widgets/footer'

const SECTIONS = [
  {
    number: '1',
    title: 'Umumiy qoidalar',
    body: [
      "Ushbu Foydalanish shartlari (\"Shartlar\") Rulda veb-saytidan (\"Sayt\", \"Xizmat\") foydalanish tartibini belgilaydi. Saytga kirish yoki undan foydalanish orqali siz ushbu Shartlarga to'liq rozilik bildirasiz. Agar Shartlarning biror qismiga rozi bo'lmasangiz, Saytdan foydalanishni to'xtatishingiz so'raladi.",
    ],
  },
  {
    number: '2',
    title: 'Xizmat tavsifi',
    body: [
      "Rulda — O'zbekiston Respublikasi yo'l harakati qoidalari bo'yicha DAN (Davlat Avtomobil Nazorati) rasmiy test bazasiga asoslangan interaktiv mashq va imtihon simulyatsiyasi platformasi. Xizmat tarkibiga test savollari, yo'l belgilari to'plami, biletlar, imtihon rejimi va shaxsiy progress statistikasi kiradi.",
      "Hozirgi vaqtda Saytning barcha funksiyalari bepul taqdim etiladi. Kelajakda ba'zi funksiyalar uchun to'lov joriy etilishi mumkin, bu haqda foydalanuvchilar oldindan xabardor qilinadi.",
    ],
  },
  {
    number: '3',
    title: "Ro'yxatdan o'tish va hisob",
    body: [
      "Ba'zi bo'limlardan (mavzular, biletlar, imtihon, statistika) foydalanish uchun ro'yxatdan o'tish talab qilinadi. Ro'yxatdan o'tish email va parol orqali yoki Google hisobingiz orqali amalga oshiriladi.",
      "Email va parol orqali ro'yxatdan o'tganda, hisobingizdan foydalanishdan oldin email manzilingizni tasdiqlashingiz shart.",
      "Siz ro'yxatdan o'tishda ko'rsatilgan ma'lumotlarning to'g'ri va dolzarb ekanligi uchun, shuningdek hisobingiz parolining maxfiyligini saqlash uchun javobgarsiz. Hisobingiz orqali amalga oshirilgan barcha harakatlar uchun javobgarlik sizga yuklanadi.",
    ],
  },
  {
    number: '4',
    title: 'Foydalanuvchi majburiyatlari',
    body: ["Saytdan foydalanganda quyidagilarga yo'l qo'yilmaydi:"],
    list: [
      "Boshqa foydalanuvchining hisobidan ruxsatsiz foydalanish yoki hisob ma'lumotlarini uchinchi shaxslarga berish",
      "Saytning ishlashiga zarar yetkazadigan, yuklamani sun'iy oshiradigan yoki avtomatlashtirilgan vositalar (bot, scraper va h.k.) orqali ma'lumot yig'ish",
      "Savollar bazasi yoki boshqa kontentni tijorat maqsadida ruxsatsiz ko'chirish, tarqatish yoki qayta nashr etish",
      "Saytdan qonunga zid yoki boshqa foydalanuvchilarning huquqlarini buzadigan tarzda foydalanish",
    ],
  },
  {
    number: '5',
    title: 'Intellektual mulk',
    body: [
      "Saytning dizayni, dasturiy kodi, savollar bazasining tuzilishi va tarkibi Rulda loyihasiga tegishli yoki tegishli litsenziya asosida ishlatiladi. Yo'l harakati qoidalari va rasmiy test savollari O'zbekiston Respublikasining ochiq me'yoriy-huquqiy va DAN test bazasiga asoslanadi.",
      "Sayt materiallarini yozma ruxsatsiz nusxalash, tarqatish yoki tijorat maqsadida qayta ishlatish taqiqlanadi.",
    ],
  },
  {
    number: '6',
    title: 'Javobgarlikni cheklash',
    body: [
      "Sayt \"qanday bo'lsa shundayligicha\" (\"as is\") taqdim etiladi. Rulda jamoasi Saytdagi test natijalarining haqiqiy DAN imtihonidagi muvaffaqiyatni kafolatlamasligini alohida ta'kidlaydi — Sayt faqat mashq qilish va bilimni mustahkamlash vositasi hisoblanadi.",
      "Savollar bazasidagi tasodifiy xatoliklar, texnik nosozliklar yoki xizmat vaqtinchalik ishlamay qolishi natijasida yuzaga kelishi mumkin bo'lgan har qanday to'g'ridan-to'g'ri yoki bilvosita zarar uchun Rulda javobgar emas.",
    ],
  },
  {
    number: '7',
    title: "Xizmatni o'zgartirish va to'xtatish",
    body: [
      "Rulda istalgan vaqtda Saytning funksiyalarini o'zgartirish, to'xtatish yoki cheklash huquqini o'zida saqlab qoladi. Shartlarni jiddiy buzgan foydalanuvchining hisobi ogohlantirishsiz bloklanishi yoki o'chirilishi mumkin.",
    ],
  },
  {
    number: '8',
    title: "Shartlarga o'zgartirish kiritish",
    body: [
      "Ushbu Shartlar vaqti-vaqti bilan yangilanishi mumkin. Muhim o'zgarishlar haqida Saytda e'lon orqali xabar beriladi. O'zgartirishlar kuchga kirgandan so'ng Saytdan foydalanishni davom ettirish yangilangan Shartlarga rozilik sifatida qabul qilinadi.",
    ],
  },
  {
    number: '9',
    title: 'Amal qiluvchi qonunchilik',
    body: [
      "Ushbu Shartlar O'zbekiston Respublikasi qonunchiligiga muvofiq tuziladi va talqin qilinadi. Shartlar yuzasidan kelib chiqadigan nizolar tomonlar o'rtasidagi muzokaralar orqali, kelishuvga erishilmagan taqdirda esa qonunchilikda belgilangan tartibda hal etiladi.",
    ],
  },
  {
    number: '10',
    title: "Bog'lanish",
    body: [
      "Ushbu Shartlar bo'yicha savollaringiz bo'lsa, biz bilan support@rulda.page manzili orqali bog'lanishingiz mumkin.",
    ],
  },
]

export function TermsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Box component="main" className="page-shell">
        <Container size={780} py={{ base: 40, sm: 60 }}>
          <Stack gap={4} mb="xl">
            <Title order={1} fz={{ base: 28, sm: 36 }}>
              Foydalanish shartlari
            </Title>
            <Text c="dimmed" size="sm">
              Oxirgi yangilanish: 2026-yil 24-avgust
            </Text>
          </Stack>

          <Stack gap="xl">
            {SECTIONS.map((section) => (
              <Stack key={section.title} gap="xs">
                <Title order={2} fz="1.2rem">
                  {section.number ? `${section.number}. ${section.title}` : section.title}
                </Title>
                {section.body.map((p) => (
                  <Text key={p} c="dimmed" lh={1.7}>
                    {p}
                  </Text>
                ))}
                {section.list && (
                  <List spacing={6} c="dimmed" pl={4}>
                    {section.list.map((item) => (
                      <List.Item key={item}>{item}</List.Item>
                    ))}
                  </List>
                )}
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  )
}
