import { useEffect } from 'react'
import './Modal.css'

export function Modal({ isOpen, onClose, children, maxWidth = 400 }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-panel" style={{ maxWidth }}>
        <button className="modal-close" onClick={onClose} aria-label="Yopish">
          &times;
        </button>
        {children}
      </div>
    </div>
  )
}
