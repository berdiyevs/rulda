import { Modal as MantineModal } from '@mantine/core'

export function Modal({ isOpen, onClose, children, maxWidth = 400 }) {
  return (
    <MantineModal opened={isOpen} onClose={onClose} size={maxWidth} centered withCloseButton>
      {children}
    </MantineModal>
  )
}
