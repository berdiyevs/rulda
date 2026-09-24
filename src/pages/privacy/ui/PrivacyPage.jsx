import { Container, Stack, Title, Text, List, Box } from '@mantine/core'
import { Navbar } from '../../../widgets/navbar'
import { useLoginModal } from '../../../widgets/login-modal'
import { Footer } from '../../../widgets/footer'

const SECTIONS = [
  {
    title: 'Kirish',
    number: '1',
    body: [
      "Ushbu Maxfiylik siyosati Rulda veb-saytidan (\"Sayt\") foydalanganingizda qanday shaxsiy ma'lumotlar yig'ilishi, ulardan qanday foydalanilishi va qanday himoya qilinishini tushuntiradi. Saytdan foydalanish orqali siz ushbu siyosatga rozilik bildirasiz.",
    ],
  },
  {
    title: "Biz yig'adigan ma'lumotlar",
    number: '2',
    body: ["Ro'yxatdan o'tish va Saytdan foydalanish jarayonida quyidagi ma'lumotlar yig'iladi:"],
    list: [
      "Hisob ma'lumotlari: ismingiz, email manzilingiz va (Google orqali kirilganda) profil rasmingiz",
      "Autentifikatsiya ma'lumotlari: parolingiz xavfsiz shifrlangan (hash) ko'rinishda saqlanadi, uning o'zi bizga ochiq ko'rinishda taqdim etilmaydi va saqlanmaydi",
      "Test faoliyati: yechilgan testlar, urinishlar tarixi, to'g'ri/xato javoblar, mavzular bo'yicha natijalar va imtihonga tayyorgarlik statistikasi",
      "Ixtiyoriy ma'lumotlar: agar kiritsangiz, imtihon sanangiz kabi shaxsiy rejalashtirish ma'lumotlari",
    ],
  },
  {
    title: "Ma'lumotlardan foydalanish maqsadlari",
    number: '3',
    body: ["Yig'ilgan ma'lumotlar quyidagi maqsadlarda ishlatiladi:"],
    list: [
      'Hisobingizni yaratish, tasdiqlash va boshqarish',
      "Test natijalaringiz va progressingizni saqlash hamda sizga statistika sifatida ko'rsatish",
      "Xizmat sifatini yaxshilash va texnik muammolarni bartaraf etish",
      'Zarur hollarda sizga xizmat bilan bog\'liq muhim xabarnomalarni yuborish',
    ],
  },
  {
    title: 'Ma\'lumotlarni saqlash va xavfsizlik',
    number: '4',
    body: [
      "Barcha foydalanuvchi ma'lumotlari o'z serverimizdagi PostgreSQL ma'lumotlar bazasida, sanoat standartlariga mos xavfsizlik choralari bilan saqlanadi. Ma'lumotlarga faqat autentifikatsiyadan o'tgan foydalanuvchining o'zi kira oladi.",
      "Biz ma'lumotlaringizni ruxsatsiz kirish, o'zgartirish yoki yo'qotilishdan himoya qilish uchun oqilona texnik choralarni ko'ramiz, biroq internet orqali uzatishning mutlaqo xavfsiz usuli yo'qligini yodda tutishingizni so'raymiz.",
    ],
  },
  {
    title: 'Ma\'lumotlarni uchinchi shaxslar bilan almashish',
    number: '5',
    body: [
      "Rulda foydalanuvchilarning shaxsiy ma'lumotlarini sotmaydi yoki reklama maqsadida uchinchi shaxslarga bermaydi.",
      "Ma'lumotlar faqat Saytning ishlashi uchun zarur bo'lgan xizmat ko'rsatuvchilarga (Google orqali kirish tanlangan holatda Google autentifikatsiya xizmatiga) uzatiladi. Qonun talab qilgan hollarda ma'lumotlar tegishli davlat organlariga taqdim etilishi mumkin.",
    ],
  },
  {
    title: 'Cookie va lokal saqlash',
    number: '6',
    body: [
      "Sayt sessiyangizni saqlash va tizimga kirgan holatingizni eslab qolish uchun brauzeringizning lokal saqlash (local storage) imkoniyatidan foydalanadi. Bu ma'lumotlar reklama maqsadida ishlatilmaydi.",
    ],
  },
  {
    title: 'Foydalanuvchi huquqlari',
    number: '7',
    body: ["Siz o'z ma'lumotlaringizga nisbatan quyidagi huquqlarga egasiz:"],
    list: [
      "Profilingizdagi ma'lumotlarni istalgan vaqtda ko'rish va yangilash",
      "Hisobingizni va unga bog'liq barcha ma'lumotlarni o'chirishni support@rulda.page orqali so'rash",
      "Ma'lumotlaringiz qanday ishlatilayotgani haqida biz bilan bog'lanib, aniqlik kiritish",
    ],
  },
  {
    title: 'Bolalar maxfiyligi',
    number: '8',
    body: [
      "Sayt haydovchilik guvohnomasi olishga tayyorlanuvchilar uchun mo'ljallangan bo'lib, undan foydalanish O'zbekiston Respublikasi qonunchiligida belgilangan yosh talablariga rioya qilingan holda amalga oshirilishi kerak. Kichik yoshdagi foydalanuvchilardan ota-ona yoki vasiylik nazorati talab etiladi.",
    ],
  },
  {
    title: "Siyosatga o'zgartirish kiritish",
    number: '9',
    body: [
      "Ushbu Maxfiylik siyosati vaqti-vaqti bilan yangilanishi mumkin. Muhim o'zgarishlar haqida Saytda e'lon orqali xabar beriladi. Yangilangan siyosat Saytda joylashtirilgan kundan boshlab kuchga kiradi.",
    ],
  },
  {
    title: "Bog'lanish",
    number: '10',
    body: [
      "Maxfiylik siyosati yuzasidan savol yoki so'rovlaringiz bo'lsa, support@rulda.page manzili orqali biz bilan bog'lanishingiz mumkin.",
    ],
  },
]

export function PrivacyPage() {
  const openLogin = useLoginModal()

  return (
    <>
      <Navbar onOpenModal={() => openLogin()} />
      <Box component="main" className="page-shell">
        <Container size={780} py={{ base: 40, sm: 60 }}>
          <Stack gap={4} mb="xl">
            <Title order={1} fz={{ base: 28, sm: 36 }}>
              Maxfiylik siyosati
            </Title>
            <Text c="dimmed" size="sm">
              Oxirgi yangilanish: 2026-yil 24-avgust
            </Text>
          </Stack>

          <Stack gap="xl">
            {SECTIONS.map((section) => (
              <Stack key={section.title} gap="xs">
                <Title order={2} fz="1.2rem">
                  {section.number}. {section.title}
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
