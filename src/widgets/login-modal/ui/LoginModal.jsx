import { useEffect, useState } from 'react'
import { Modal, Tabs, TextInput, PasswordInput, Stack, Text, Title, Divider, Anchor } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconUser, IconMail, IconLock } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { GoogleButton } from '../../../shared/ui/GoogleButton/GoogleButton'
import { useAuthActions } from '../../../features/auth'
import { ROUTES } from '../../../shared/config/routes'
import { track } from '../../../shared/lib/analytics'

export function LoginModal({ isOpen, onClose, title, redirectTo }) {
  const [tab, setTab] = useState('login')
  const [submitting, setSubmitting] = useState(false)
  const { signUpWithEmail, loginWithEmail, loginWithGoogle } = useAuthActions({ redirectTo })

  const form = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: {
      name: (value) => (tab === 'signup' && !value.trim() ? 'Ismingizni kiriting' : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Email manzili noto'g'ri"),
      password: (value) =>
        value.length < 6 ? "Parol kamida 6 ta belgidan iborat bo'lishi kerak" : null,
    },
  })

  useEffect(() => {
    if (isOpen) track('signup_open')
  }, [isOpen])

  const handleClose = () => {
    form.reset()
    setTab('login')
    onClose()
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (tab === 'login') {
        const ok = await loginWithEmail({ email: values.email, password: values.password })
        if (ok) handleClose()
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
      const ok = await loginWithGoogle()
      if (ok) handleClose()
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
      <Stack gap="sm" align="center" ta="center">
        <Text fw={800} fz={20} style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>
          <Text span inherit variant="gradient" gradient={{ from: 'brand.6', to: 'accent.5', deg: 135 }}>
            Rul
          </Text>
          da
        </Text>

        <Title order={2} fz="1.25rem" lh={1.3}>
          {title || (tab === 'login' ? 'Hisobingizga kiring' : 'Bepul hisob yarating')}
        </Title>

        <GoogleButton onClick={handleGoogle} disabled={submitting} />

        <Divider label="yoki email orqali" labelPosition="center" w="100%" />

        <Tabs value={tab} onChange={setTab} radius="xl" variant="pills" w="100%">
          <Tabs.List grow>
            <Tabs.Tab value="login">Kirish</Tabs.Tab>
            <Tabs.Tab value="signup">Ro'yxatdan o'tish</Tabs.Tab>
          </Tabs.List>
        </Tabs>

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
