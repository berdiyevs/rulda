import { Link } from 'react-router-dom'
import { ROUTES } from '../../../shared/config/routes'
import './Footer.css'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link to={ROUTES.HOME} className="logo">
          <span>Rul</span>da
        </Link>
        <div className="footer-links">
          <a href="#">Foydalanish shartlari</a>
          <a href="#">Maxfiylik siyosati</a>
          <a href="#">Texnik yordam</a>
        </div>
        <p className="copyright">&copy; {new Date().getFullYear()} Rulda. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  )
}
