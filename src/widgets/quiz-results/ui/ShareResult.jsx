import { useState } from 'react'
import { Stack, Group, Text } from '@mantine/core'
import { IconShare3, IconDownload, IconBrandTelegram } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button/Button'
import { track } from '../../../shared/lib/analytics'
import {
  buildShareText,
  createShareImage,
  downloadImage,
  shareImageNatively,
  telegramShareUrl,
} from '../../../shared/lib/shareCard'

// "Ulashish": telefonda tizim ulashish oynasi (Telegram shu yerda chiqadi),
// ishlamasa rasmni yuklab olish va Telegram havolasi taklif qilinadi.
export function ShareResult({ result, prominent }) {
  const [busy, setBusy] = useState(false)
  const [fallback, setFallback] = useState(null) // { blob, text }

  const text = buildShareText(result)

  const handleShare = async () => {
    track('share_click')
    setBusy(true)
    try {
      const blob = await createShareImage(result)
      const outcome = await shareImageNatively(blob, text)
      if (outcome === 'unsupported') setFallback({ blob })
    } catch {
      setFallback({ blob: null })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack gap="xs" w="100%">
      <Button
        variant={prominent ? 'primary' : 'ghost'}
        size={prominent ? 'md' : 'sm'}
        fullWidth
        loading={busy}
        leftSection={<IconShare3 size={16} />}
        onClick={handleShare}
      >
        Ulashish
      </Button>

      {fallback && (
        <Stack gap="xs">
          <Text c="dimmed" fz="xs" ta="center">
            Bu qurilmada to'g'ridan-to'g'ri ulashib bo'lmadi. Quyidagilardan birini tanlang:
          </Text>
          <Group grow gap="xs">
            {fallback.blob && (
              <Button
                variant="secondary"
                size="sm"
                leftSection={<IconDownload size={15} />}
                onClick={() => downloadImage(fallback.blob)}
              >
                Rasmni yuklab olish
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              as="a"
              href={telegramShareUrl(text)}
              target="_blank"
              rel="noopener noreferrer"
              leftSection={<IconBrandTelegram size={15} />}
            >
              Telegram'da ulashish
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  )
}
