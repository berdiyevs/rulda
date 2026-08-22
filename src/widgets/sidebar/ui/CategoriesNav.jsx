import { Link, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../../shared/api/firebase'
import { useAuth } from '../../../entities/user'
import { ROUTES } from '../../../shared/config/routes'
import './CategoriesNav.css'

export function CategoriesNav() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate(ROUTES.HOME)
  }

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0]

  return (
    <div className="cat-nav">
      <Link to={ROUTES.HOME} className="logo">
        <span>Rul</span>da
      </Link>
      <div className="cat-nav-links">
        <NavLink to={ROUTES.CATEGORIES} end>
          Mavzular
        </NavLink>
        <NavLink to={ROUTES.ROAD_SIGNS}>Yo'l belgilari</NavLink>
        <NavLink to="/quiz?mode=exam&topic=all">Imtihon</NavLink>
      </div>
      <div className="cat-nav-user">
        <span>{displayName}</span>
        <button onClick={handleLogout}>Chiqish</button>
      </div>
    </div>
  )
}
