import { useState } from 'react'
import { Modal, Tabs, TextInput, PasswordInput, Stack, Text, Divider, Anchor } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconUser, IconMail, IconLock } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { useAuthActions } from '../../../features/auth'
import { ROUTES } from '../../../shared/config/routes'

export function LoginModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('login')
  const [submitting, setSubmitting] = useState(false)
  const { signUpWithEmail, loginWithEmail, loginWithGoogle } = useAuthActions()

  const form = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: {
      name: (value) => (tab === 'signup' && !value.trim() ? 'Ismingizni kiriting' : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Email manzili noto'g'ri"),
      password: (value) =>
        value.length < 6 ? "Parol kamida 6 ta belgidan iborat bo'lishi kerak" : null,
    },
  })

  const handleClose = () => {
    form.reset()
    setTab('login')
    onClose()
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (tab === 'login') {
        await loginWithEmail({ email: values.email, password: values.password })
      } else {
        await signUpWithEmail(values)
        setTab('login')
        form.reset()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setSubmitting(true)
    try {
      await loginWithGoogle()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      size={400}
      centered
      withCloseButton
      zIndex={10000}
      overlayProps={{ zIndex: 10000 }}
    >
      <Stack gap="xs" align="center" ta="center">
        <Text fw={800} fz={20} style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>
          <Text span inherit variant="gradient" gradient={{ from: 'brand.6', to: 'accent.5', deg: 135 }}>
            Rul
          </Text>
          da
        </Text>

        <Tabs value={tab} onChange={setTab} radius="xl" variant="pills" w="100%">
          <Tabs.List grow>
            <Tabs.Tab value="login">Kirish</Tabs.Tab>
            <Tabs.Tab value="signup">Ro'yxatdan o'tish</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Text c="dimmed" size="sm">
          {tab === 'login'
            ? 'Mavzular va testlarga kirish uchun tizimga kiring'
            : "Bepul hisob yaratib, o'rganishni boshlang"}
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: '100%' }}>
          <Stack gap="xs">
            {tab === 'signup' && (
              <TextInput
                placeholder="Ismingiz"
                leftSection={<IconUser size={16} />}
                {...form.getInputProps('name')}
              />
            )}
            <TextInput
              type="email"
              placeholder="Email"
              leftSection={<IconMail size={16} />}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              placeholder="Parol"
              leftSection={<IconLock size={16} />}
              {...form.getInputProps('password')}
            />

            <Button type="submit" variant="primary" fullWidth disabled={submitting}>
              {submitting ? 'Iltimos kuting...' : tab === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
            </Button>
          </Stack>
        </form>

        <Divider label="yoki" labelPosition="center" w="100%" />

        <Button
          variant="secondary"
          fullWidth
          onClick={handleGoogle}
          disabled={submitting}
          style={{ backgroundColor: '#fff', color: '#1f1f1f', borderColor: '#fff' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34C2.44 15.98 5.48 18 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.05l3.01-2.34z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          Google bilan davom etish
        </Button>

        <Text c="dimmed" fz="0.7rem" lh={1.5}>
          Davom etish orqali siz{' '}
          <Anchor href={ROUTES.TERMS} target="_blank" rel="noopener noreferrer" fz="0.7rem">
            Foydalanish shartlari
          </Anchor>{' '}
          va{' '}
          <Anchor href={ROUTES.PRIVACY} target="_blank" rel="noopener noreferrer" fz="0.7rem">
            Maxfiylik siyosati
          </Anchor>
          ni qabul qilgan bo'lasiz.
        </Text>
      </Stack>
    </Modal>
  )
}
