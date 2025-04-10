import { useState, useEffect } from 'react'
import { AuthChangeRedirector, AnonymousRoute, AuthenticatedRoute } from './auth'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
// import Calculator from './Calculator'
import Login from './django-allauth/account/Login'
import RequestLoginCode from './django-allauth/account/RequestLoginCode'
import ConfirmLoginCode from './django-allauth/account/ConfirmLoginCode'
import Logout from './django-allauth/account/Logout'
import Signup from './django-allauth/account/Signup'
import ProviderSignup from './django-allauth/socialaccount/ProviderSignup'
import ProviderCallback from './django-allauth/socialaccount/ProviderCallback'
import Home from './Home'
import ChangeEmail from './django-allauth/account/ChangeEmail'
import ManageProviders from './django-allauth/socialaccount/ManageProviders'
import VerifyEmail, { loader as verifyEmailLoader } from './django-allauth/account/VerifyEmail'
import VerifyEmailByCode from './django-allauth/account/VerifyEmailByCode'
import VerificationEmailSent from './django-allauth/account/VerificationEmailSent'
import RequestPasswordReset from './django-allauth/account/RequestPasswordReset'
import ConfirmPasswordResetCode from './django-allauth/account/ConfirmPasswordResetCode'
import ChangePassword from './django-allauth/account/ChangePassword'
import MFAOverview, { loader as mfaOverviewLoader } from './django-allauth/mfa/MFAOverview'
import ActivateTOTP, { loader as activateTOTPLoader } from './django-allauth/mfa/ActivateTOTP'
import DeactivateTOTP from './django-allauth/mfa/DeactivateTOTP'
import RecoveryCodes, { loader as recoveryCodesLoader } from './django-allauth/mfa/RecoveryCodes'
import AddWebAuthn from './django-allauth/mfa/AddWebAuthn'
import SignupByPasskey from './django-allauth/mfa/SignupByPasskey'
import ReauthenticateWebAuthn from './django-allauth/mfa/ReauthenticateWebAuthn'
import ListWebAuthn, { loader as listWebAuthnLoader } from './django-allauth/mfa/ListWebAuthn'
import GenerateRecoveryCodes, { loader as generateRecoveryCodesLoader } from './django-allauth/mfa/GenerateRecoveryCodes'
import { resetPasswordByLinkLoader, ResetPasswordByCode, ResetPasswordByLink } from './django-allauth/account/ResetPassword'
import AuthenticateTOTP from './django-allauth/mfa/AuthenticateTOTP'
import AuthenticateRecoveryCodes from './django-allauth/mfa/AuthenticateRecoveryCodes'
import AuthenticateWebAuthn from './django-allauth/mfa/AuthenticateWebAuthn'
import ReauthenticateRecoveryCodes from './django-allauth/mfa/ReauthenticateRecoveryCodes'
import ReauthenticateTOTP from './django-allauth/mfa/ReauthenticateTOTP'
import CreateSignupPasskey from './django-allauth/mfa/CreateSignupPasskey'
import Trust from './django-allauth/mfa/Trust'
import Reauthenticate from './django-allauth/account/Reauthenticate'
import Sessions from './django-allauth/usersessions/Sessions'
import Root from './Root'
import { useConfig } from './django-allauth/auth/hooks'

function createRouter (config) {
  return createBrowserRouter([
    {
      path: '/',
      element: <AuthChangeRedirector><Root /></AuthChangeRedirector>,
      children: [
        {
          path: '/',
          element: <Home />
        },
        {
          path: '/calculator',
          element: <Calculator />
        },
        {
          path: '/account/login',
          element: <AnonymousRoute><Login /></AnonymousRoute>
        },
        {
          path: '/account/login/code',
          element: <AnonymousRoute><RequestLoginCode /></AnonymousRoute>
        },
        {
          path: '/account/login/code/confirm',
          element: <AnonymousRoute><ConfirmLoginCode /></AnonymousRoute>
        },
        {
          path: '/account/email',
          element: <AuthenticatedRoute><ChangeEmail /></AuthenticatedRoute>
        },
        {
          path: '/account/logout',
          element: <Logout />
        },
        {
          path: '/account/provider/callback',
          element: <ProviderCallback />
        },
        {
          path: '/account/provider/signup',
          element: <AnonymousRoute><ProviderSignup /></AnonymousRoute>
        },
        {
          path: '/account/providers',
          element: <AuthenticatedRoute><ManageProviders /></AuthenticatedRoute>
        },
        {
          path: '/account/signup',
          element: <AnonymousRoute><Signup /></AnonymousRoute>
        },
        {
          path: '/account/signup/passkey',
          element: <AnonymousRoute><SignupByPasskey /></AnonymousRoute>
        },
        {
          path: '/account/signup/passkey/create',
          element: <AnonymousRoute><CreateSignupPasskey /></AnonymousRoute>
        },
        {
          path: '/account/verify-email',
          element: config.data.account.email_verification_by_code_enabled ? <VerifyEmailByCode /> : <VerificationEmailSent />
        },
        {
          path: '/account/verify-email/:key',
          element: <VerifyEmail />,
          loader: verifyEmailLoader
        },
        {
          path: '/account/password/reset',
          element: <AnonymousRoute><RequestPasswordReset /></AnonymousRoute>
        },
        {
          path: '/account/password/reset/confirm',
          element: <AnonymousRoute><ConfirmPasswordResetCode /></AnonymousRoute>
        },
        {
          path: '/account/password/reset/complete',
          element: <AnonymousRoute><ResetPasswordByCode /></AnonymousRoute>
        },
        {
          path: '/account/password/reset/key/:key',
          element: <AnonymousRoute><ResetPasswordByLink /></AnonymousRoute>,
          loader: resetPasswordByLinkLoader
        },
        {
          path: '/account/password/change',
          element: <AuthenticatedRoute><ChangePassword /></AuthenticatedRoute>
        },
        {
          path: '/account/2fa',
          element: <AuthenticatedRoute><MFAOverview /></AuthenticatedRoute>,
          loader: mfaOverviewLoader
        },
        {
          path: '/account/reauthenticate',
          element: <AuthenticatedRoute><Reauthenticate /></AuthenticatedRoute>
        },
        {
          path: '/account/reauthenticate/totp',
          element: <AuthenticatedRoute><ReauthenticateTOTP /></AuthenticatedRoute>
        },
        {
          path: '/account/reauthenticate/recovery-codes',
          element: <AuthenticatedRoute><ReauthenticateRecoveryCodes /></AuthenticatedRoute>
        },
        {
          path: '/account/reauthenticate/webauthn',
          element: <AuthenticatedRoute><ReauthenticateWebAuthn /></AuthenticatedRoute>
        },
        {
          path: '/account/authenticate/totp',
          element: <AnonymousRoute><AuthenticateTOTP /></AnonymousRoute>
        },
        {
          path: '/account/2fa/trust',
          element: <AnonymousRoute><Trust /></AnonymousRoute>
        },
        {
          path: '/account/authenticate/recovery-codes',
          element: <AnonymousRoute><AuthenticateRecoveryCodes /></AnonymousRoute>
        },
        {
          path: '/account/authenticate/webauthn',
          element: <AnonymousRoute><AuthenticateWebAuthn /></AnonymousRoute>
        },
        {
          path: '/account/2fa/totp/activate',
          element: <AuthenticatedRoute><ActivateTOTP /></AuthenticatedRoute>,
          loader: activateTOTPLoader
        },
        {
          path: '/account/2fa/totp/deactivate',
          element: <AuthenticatedRoute><DeactivateTOTP /></AuthenticatedRoute>
        },
        {
          path: '/account/2fa/recovery-codes',
          element: <AuthenticatedRoute><RecoveryCodes /></AuthenticatedRoute>,
          loader: recoveryCodesLoader
        },
        {
          path: '/account/2fa/recovery-codes/generate',
          element: <AuthenticatedRoute><GenerateRecoveryCodes /></AuthenticatedRoute>,
          loader: generateRecoveryCodesLoader
        },
        {
          path: '/account/2fa/webauthn',
          element: <AuthenticatedRoute><ListWebAuthn /></AuthenticatedRoute>,
          loader: listWebAuthnLoader
        },
        {
          path: '/account/2fa/webauthn/add',
          element: <AuthenticatedRoute><AddWebAuthn /></AuthenticatedRoute>
        },
        {
          path: '/account/sessions',
          element: <AuthenticatedRoute><Sessions /></AuthenticatedRoute>
        }
      ]
    }
  ])
}

export default function Router () {
  // If we create the router globally, the loaders of the routes already trigger
  // even before the <AuthContext/> trigger the initial loading of the auth.
  // state.
  const [router, setRouter] = useState(null)
  const config = useConfig()
  useEffect(() => {
    setRouter(createRouter(config))
  }, [config])
  return router ? <RouterProvider router={router} /> : null
}