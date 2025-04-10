import { getCSRFToken } from "./django";

export const Client = Object.freeze({
    APP: 'app',
    BROWSER: 'browser'
})

export const settings = {
    client: Client.BROWSER,
    baseUrl: `/_allauth/${Client.BROWSER}/v1`,
    withCredentials: false
}

const ACCEPT_JSON = {
    accept: 'application/json'
}

export const AuthProcess = Object.freeze({
    LOGIN: 'login',
    CONNECT: 'connect'
})

export const Flows = Object.freeze({
    LOGIN: 'login',
    LOGIN_BY_CODE: 'login_by_code',
    MFA_AUTHENTICATE: 'mfa_authenticate',
    MFA_REAUTHENTICATE: 'mfa_reauthenticate',
    MFA_TRUST: 'mfa_trust',
    MFA_WEBAUTHN_SIGNUP: 'mfa_signup_webauthn',
    PASSWORD_RESET_BY_CODE: 'password_reset_by_code',
    PROVIDER_REDIRECT: 'provider_redirect',
    PROVIDER_SIGNUP: 'provider_signup',
    REAUTHENTICATE: 'reauthenticate',
    SIGNUP: 'signup',
    VERIFY_EMAIL: 'verify_email'
})
export const URLs = Object.freeze({
    // meta
    CONFIG: '/config',
    //account management
    CHANGE_PASSWORD: '/account/password/change',
    EMAIL: '/account/email',
    PROVIDERS: '/account/providers',
    // account management: 2fa
    AUTHENTICATORS: '/account/authenticators',
    RECOVERY_CODES: '/account/authenticators/recovery-codes',
    TOTP_AUTHENTICATOR: '/account/authenticators/totp',
    // auth: basics
    LOGIN: '/auth/login',
    REQUEST_LOGIN_CODE: '/auth/code/request',
    CONFIRM_LOGIN_CODE: '/auth/code/confirm',
    SESSION: '/auth/session',
    REAUTHENTICATE: '/auth/reauthenticate',
    REQUEST_PASSWORD_RESET: '/auth/password/request',
    RESET_PASSWORD: '/auth/password/reset',
    SIGNUP: '/auth/signup',
    VERIFY_EMAIL: '/auth/email/verify',
      // Auth: 2FA
    MFA_AUTHENTICATE: '/auth/2fa/authenticate',
    MFA_REAUTHENTICATE: '/auth/2fa/reauthenticate',
    MFA_TRUST: '/auth/2fa/trust',
    // Auth: Social
    PROVIDER_SIGNUP: '/auth/provider/signup',
    REDIRECT_TO_PROVIDER: '/auth/provider/redirect',
    PROVIDER_TOKEN: '/auth/provider/token',
    // Auth: Sessions
    SESSIONS: '/auth/sessions',
    // Auth: WebAuthn
    REAUTHENTICATE_WEBAUTHN: '/auth/webauthn/reauthenticate',
    AUTHENTICATE_WEBAUTHN: '/auth/webauthn/authenticate',
    LOGIN_WEBAUTHN: '/auth/webauthn/login',
    SIGNUP_WEBAUTHN: '/auth/webauthn/signup',
    WEBAUTHN_AUTHENTICATOR: '/account/authenticators/webauthn'
})

export const AuthenticatorType = Object.freeze({
    TOTP: 'totp',
    RECOVERY_CODES: 'recovery_codes',
    WEBAUTHN: 'webauthn'
  })

function postForm (action: any, data: any) {
    const f = document.createElement('form')
    f.method = 'POST'
    f.action = settings.baseUrl + action

    for (const key in data) {
        const d = document.createElement('input')
        d.type = 'hidden'
        d.name = key
        d.value = data[key]
        f.appendChild(d)
    }
    document.body.appendChild(f)
    f.submit()
}

const tokenStorage = window.sessionStorage

export function getSessionToken () {
    return tokenStorage.getItem('sessionToken')
}
type RequestMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export async function request (method: RequestMethodType, path: string, data?: any, headers?: any) {
    const options: RequestInit = {
        method,
        headers: {
        ...ACCEPT_JSON,
        ...headers
        }
    }
    if (settings.withCredentials) {
        options.credentials = 'include'
    }
    // Don't pass along authentication related headers to the config endpoint.
    if (path !== URLs.CONFIG) {
        if (settings.client === Client.BROWSER) {
            (options.headers as Record<string, string | null>)['X-CSRFToken'] = getCSRFToken()
        } else if (settings.client === Client.APP) {
        // IMPORTANT!: Do NOT use `Client.APP` in a browser context, as you will
        // be vulnerable to CSRF attacks. This logic is only here for
        // development/demonstration/testing purposes...
            (options.headers as Record<string, string | null>)['User-Agent'] = 'django-allauth example app'
        const sessionToken = getSessionToken()
        if (sessionToken) {
            (options.headers as Record<string, string | null>)['X-Session-Token'] = sessionToken
        }
        }
    }

    if (typeof data !== 'undefined') {
        options.body = JSON.stringify(data);
        (options.headers as Record<string, string | null>)['Content-Type'] = 'application/json'
    }
    const resp = await fetch(settings.baseUrl + path, options)
    const msg = await resp.json()
    if (msg.status === 410) {
        tokenStorage.removeItem('sessionToken')
    }
    if (msg.meta?.session_token) {
        tokenStorage.setItem('sessionToken', msg.meta.session_token)
    }
    if ([401, 410].includes(msg.status) || (msg.status === 200 && msg.meta?.is_authenticated)) {
        const event = new CustomEvent('allauth.auth.change', { detail: msg })
        document.dispatchEvent(event)
    }
    return msg
}

export async function login (data: {'username': string, 'password': string}) {
    return await request('POST', URLs.LOGIN, data)
}

export async function reauthenticate (data: {'password': string}) {
    return await request('POST', URLs.REAUTHENTICATE, data)
}

export async function logout () {
    return await request('DELETE', URLs.SESSION)
}

export async function signUp (data: {'email': string, 'phone': string, 'username': string, 'password': string}) {
    return await request('POST', URLs.SIGNUP, data)
}

export async function signUpByPasskey (data: {'email': string, 'phone': string, 'username': string}) {
    return await request('POST', URLs.SIGNUP_WEBAUTHN, data)
}

export async function providerSignup (data: {'email': string, 'phone': string, 'username': string}) {
    return await request('POST', URLs.PROVIDER_SIGNUP, data)
}

export async function getProviderAccounts () {
    return await request('GET', URLs.PROVIDERS)
}

export async function disconnectProviderAccount (providerId: string, accountUid: string) {
    return await request('DELETE', URLs.PROVIDERS, { provider: providerId, account: accountUid })
}

export async function requestPasswordReset (email: string) {
    return await request('POST', URLs.REQUEST_PASSWORD_RESET, { email })
}

export async function requestLoginCode (email: string) {
    return await request('POST', URLs.REQUEST_LOGIN_CODE, { email })
}

export async function confirmLoginCode (code: string) {
    return await request('POST', URLs.CONFIRM_LOGIN_CODE, { code })
}

export async function getEmailVerification (key: string) {
    return await request('GET', URLs.VERIFY_EMAIL, undefined, { 'X-Email-Verification-Key': key })
}

export async function getEmailAddresses () {
    return await request('GET', URLs.EMAIL)
}
export async function getSessions () {
    return await request('GET', URLs.SESSIONS)
}

export async function endSessions (ids: number[]) {
    return await request('DELETE', URLs.SESSIONS, { sessions: ids })
}

export async function getAuthenticators () {
    return await request('GET', URLs.AUTHENTICATORS)
}

export async function getTOTPAuthenticator () {
    return await request('GET', URLs.TOTP_AUTHENTICATOR)
}

export async function mfaAuthenticate (code: string) {
    return await request('POST', URLs.MFA_AUTHENTICATE, { code })
}

export async function mfaReauthenticate (code: string) {
    return await request('POST', URLs.MFA_REAUTHENTICATE, { code })
}

export async function mfaTrust (trust: boolean) {
    return await request('POST', URLs.MFA_TRUST, { trust })
}

export async function activateTOTPAuthenticator (code: string) {
    return await request('POST', URLs.TOTP_AUTHENTICATOR, { code })
}

export async function deactivateTOTPAuthenticator () {
    return await request('DELETE', URLs.TOTP_AUTHENTICATOR)
}

export async function getRecoveryCodes () {
    return await request('GET', URLs.RECOVERY_CODES)
}

export async function generateRecoveryCodes () {
    return await request('POST', URLs.RECOVERY_CODES)
}

export async function getConfig () {
    return await request('GET', URLs.CONFIG)
}

export async function addEmail (email: string) {
    return await request('POST', URLs.EMAIL, { email })
}

export async function deleteEmail (email: string) {
    return await request('DELETE', URLs.EMAIL, { email })
}

export async function markEmailAsPrimary (email: string) {
    return await request('PATCH', URLs.EMAIL, { email, primary: true })
}

export async function requestEmailVerification (email: string) {
    return await request('PUT', URLs.EMAIL, { email })
}

export async function verifyEmail (key: string) {
    return await request('POST', URLs.VERIFY_EMAIL, { key })
}

export async function getPasswordReset (key: string) {
    return await request('GET', URLs.RESET_PASSWORD, undefined, { 'X-Password-Reset-Key': key })
}

export async function resetPassword (data: {'key': string, 'password': string}) {
    return await request('POST', URLs.RESET_PASSWORD, data)
}

export async function changePassword (data: {'current_password': string, 'new_password': string}) {
    return await request('POST', URLs.CHANGE_PASSWORD, data)
}

export async function getAuth () {
    return await request('GET', URLs.SESSION)
}

export async function authenticateByToken (providerId: string, token: {'client_id': string, 'id_token': string, 'access_token': string}, process = AuthProcess.LOGIN) {
    return await request('POST', URLs.PROVIDER_TOKEN, {
        provider: providerId,
        token,
        process
    }
    )
}

export function redirectToProvider (providerId: string, callbackURL: string, process = AuthProcess.LOGIN) {
    postForm(URLs.REDIRECT_TO_PROVIDER, {
        provider: providerId,
        process,
        callback_url: window.location.protocol + '//' + window.location.host + callbackURL,
        csrfmiddlewaretoken: getCSRFToken()
    })
}

export async function getWebAuthnCreateOptions (passwordless: boolean) {
    let url = URLs.WEBAUTHN_AUTHENTICATOR
    if (passwordless) {
        url += '?passwordless'
    }
    return await request('GET', url)
}

export async function getWebAuthnCreateOptionsAtSignup () {
    return await request('GET', URLs.SIGNUP_WEBAUTHN)
}

export async function addWebAuthnCredential (name: string, credential: any[]) {
    return await request('POST', URLs.WEBAUTHN_AUTHENTICATOR, {
        name,
        credential
    })
}

export async function signupWebAuthnCredential (name: string, credential: any) {
    return await request('PUT', URLs.SIGNUP_WEBAUTHN, {
        name,
        credential,
    })
}

export async function deleteWebAuthnCredential (ids: number[]) {
    return await request('DELETE', URLs.WEBAUTHN_AUTHENTICATOR, { authenticators: ids })
}

export async function updateWebAuthnCredential (id: number, data: any) {
    return await request('PUT', URLs.WEBAUTHN_AUTHENTICATOR, { id, ...data })
}

export async function getWebAuthnRequestOptionsForReauthentication () {
    return await request('GET', URLs.REAUTHENTICATE_WEBAUTHN)
}

export async function reauthenticateUsingWebAuthn (credential: any) {
    return await request('POST', URLs.REAUTHENTICATE_WEBAUTHN, { credential })
}

export async function authenticateUsingWebAuthn (credential: any) {
    return await request('POST', URLs.AUTHENTICATE_WEBAUTHN, { credential })
}

export async function loginUsingWebAuthn (credential: any) {
    return await request('POST', URLs.LOGIN_WEBAUTHN, { credential })
}

export async function getWebAuthnRequestOptionsForLogin () {
    return await request('GET', URLs.LOGIN_WEBAUTHN)
}

export async function getWebAuthnRequestOptionsForAuthentication () {
    return await request('GET', URLs.AUTHENTICATE_WEBAUTHN)
}

export function setup (client: any, baseUrl: string, withCredentials: boolean) {
    settings.client = client
    settings.baseUrl = baseUrl
    settings.withCredentials = withCredentials
}