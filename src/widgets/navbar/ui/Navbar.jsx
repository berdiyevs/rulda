import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../../shared/api/firebase'
import { useAuth } from '../../../entities/user'
import { Button } from '../../../shared/ui/Button/Button'
import { ROUTES } from '../../../shared/config/routes'
import './Navbar.css'

export function Navbar({ onOpenModal }) {
  const { user, profile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    setMenuOpen(false)
    navigate(ROUTES.HOME)
  }

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0]
  const initial = displayName ? displayName[0].toUpperCase() : '?'

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={ROUTES.HOME} className="logo">
          <span>Rul</span>da
        </Link>

        <div className="nav-menu">
          {user ? (
            <div className="user-menu">
              <button className="user-chip" onClick={() => setMenuOpen((v) => !v)}>
                <span className="user-avatar">{initial}</span>
                <span className="user-name">{displayName}</span>
              </button>
              {menuOpen && (
                <div className="user-dropdown fade-in">
                  <Link to={ROUTES.CATEGORIES} onClick={() => setMenuOpen(false)}>
                    Mavzular
                  </Link>
                  <button onClick={handleLogout}>Chiqish</button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="primary" onClick={onOpenModal}>
              Boshlash
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
