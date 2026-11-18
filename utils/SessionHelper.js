// utils/SessionHelper.js
import Cookies from 'js-cookie';

// Dashboard-scoped keys: the customer portal uses the same generic names, so
// without a prefix signing in to one panel overwrites the other's token.
const PREFIX = 'dash_';
const KEYS = {
  token: `${PREFIX}authToken`,
  tokenAlt: `${PREFIX}token`,
  email: `${PREFIX}email`,
  otp: `${PREFIX}otp`,
  user: `${PREFIX}user`,
  userDetails: `${PREFIX}userDetails`,
};
const TOKEN_KEYS = [KEYS.token, KEYS.tokenAlt];
const USER_KEYS = [KEYS.userDetails, KEYS.user];

const cookieOptions = (days) => ({
  expires: days,
  // A production build does not guarantee HTTPS (e.g. cPanel static hosting),
  // so Secure must follow the real protocol rather than NODE_ENV.
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  sameSite: 'Lax',
  path: '/',
});

const writeCookie = (name, value, days) => {
  Cookies.set(name, value, cookieOptions(days));
};

// ============ TOKEN MANAGEMENT ============
export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    TOKEN_KEYS.forEach((key) => {
      writeCookie(key, token, 7);
      localStorage.setItem(key, token);
    });
  }
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  for (const key of TOKEN_KEYS) {
    const fromCookie = Cookies.get(key);
    if (fromCookie) return fromCookie;
  }
  for (const key of TOKEN_KEYS) {
    const fromStorage = localStorage.getItem(key);
    if (fromStorage) return fromStorage;
  }
  return null;
};

// ============ EMAIL MANAGEMENT ============
export const setEmail = (email) => {
  if (typeof window !== 'undefined') {
    writeCookie(KEYS.email, email, 1);
    localStorage.setItem(KEYS.email, email);
  }
};

export const getEmail = () => {
  if (typeof window === 'undefined') return null;
  return Cookies.get(KEYS.email) || localStorage.getItem(KEYS.email);
};

// ============ OTP MANAGEMENT ============
export const setOTP = (otp) => {
  if (typeof window !== 'undefined') {
    writeCookie(KEYS.otp, otp, 1 / 24);
    localStorage.setItem(KEYS.otp, otp);
  }
};

export const getOTP = () => {
  if (typeof window === 'undefined') return null;
  return Cookies.get(KEYS.otp) || localStorage.getItem(KEYS.otp);
};

// ============ USER DETAILS MANAGEMENT ============
export const setUserDetails = (user) => {
  if (typeof window !== 'undefined') {
    const userStr = JSON.stringify(user);
    USER_KEYS.forEach((key) => {
      writeCookie(key, userStr, 7);
      localStorage.setItem(key, userStr);
    });
  }
};

export const getUserDetails = () => {
  if (typeof window === 'undefined') return null;
  for (const key of USER_KEYS) {
    const raw = Cookies.get(key) || localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing user details:', e);
        return null;
      }
    }
  }
  return null;
};

const clearSessionData = () => {
  if (typeof window !== 'undefined') {
    [...TOKEN_KEYS, KEYS.email, KEYS.otp, ...USER_KEYS].forEach((name) => {
      Cookies.remove(name, { path: '/' });
      Cookies.remove(name);
      localStorage.removeItem(name);
    });
    window.dispatchEvent(new Event('authChange'));
  }
};

// ============ SESSION CLEAR / LOGOUT ============
export const clearAllSessions = clearSessionData;
export const logout = clearSessionData;

export const expireSession = () => {
  const hadToken = Boolean(getAuthToken());
  clearSessionData();
  if (hadToken && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sessionExpired'));
  }
};

// ============ CHECK AUTHENTICATION ============
export const isAuthenticated = () => Boolean(getAuthToken());
