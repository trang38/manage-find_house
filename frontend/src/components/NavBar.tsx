import { useUser, useConfig } from '../django-allauth/auth'
import { useLocation, Link } from 'react-router-dom'

interface NavBarItemProps {
  href ?: string,
  to : string,
  name : string
}
function NavBarItem ({href, to, name}: NavBarItemProps) {
  const location = useLocation()
  const isActive = (href && location.pathname.startsWith(href)) || (to && location.pathname.startsWith(to))
  const cls = isActive ? 'nav-link active' : 'nav-link'
  return (
    <li className='nav-item'>
      {href
        ? <a className={cls} href={href}>{name}</a>
        : <Link className={cls} to={to}>{name}</Link>}
    </li>
  )
}

export default function NavBar () {
  const user = useUser()
  const config = useConfig()
  const anonNav = (
    <>
      <NavBarItem to='/account/login' name='Login' />
      <NavBarItem to='/account/signup' name='Signup' />
      <NavBarItem to='/account/password/reset' name='Reset password' />
    </>
  )
  const authNav = (
    <>
      <NavBarItem to='/account/email' name='Change Email' />
      <NavBarItem to='/account/password/change' name='Change Password' />
      {config.data.socialaccount
        ? <NavBarItem to='/account/providers' name='Providers' />
        : null}
      {config.data.mfa
        ? <NavBarItem to='/account/2fa' name='Two-Factor Authentication' />
        : null}

      {config.data.usersessions
        ? <NavBarItem to='/account/sessions' name='Sessions' />
        : null}
      <NavBarItem to='/account/logout' name='Logout' />
    </>
  )
  return (
    <nav className='navbar navbar-expand-md navbar-dark fixed-top bg-dark'>
      <div className='container-fluid'>
        <Link to='/' className='navbar-brand'>React ❤️ django-allauth</Link>
        <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarCollapse' aria-controls='navbarCollapse' aria-expanded='false' aria-label='Toggle navigation'>
          <span className='navbar-toggler-icon' />
        </button>
        <div className='collapse navbar-collapse' id='navbarCollapse'>
          <ul className='navbar-nav me-auto mb-2 mb-md-0'>
            {/* <NavBarItem to='/calculator' name='Calculator' /> */}
            {process.env.NODE_ENV === 'development' && (<NavBarItem href="http://localhost:1080" to ='' name="MailCatcher" />)}
            {user ? authNav : anonNav}
          </ul>
        </div>
      </div>
    </nav>
  )
}