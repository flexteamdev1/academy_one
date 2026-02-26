const readStorageValue = (storage) => {
  try {
    const raw = storage.getItem('userInfo');
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

export const getStoredUserInfo = () => {
  const localValue = readStorageValue(localStorage);
  if (localValue) return localValue;
  const sessionValue = readStorageValue(sessionStorage);
  return sessionValue || {};
};

export const setStoredUserInfo = (value, remember = false) => {
  const payload = JSON.stringify(value || {});
  if (remember) {
    localStorage.setItem('userInfo', payload);
    sessionStorage.removeItem('userInfo');
  } else {
    sessionStorage.setItem('userInfo', payload);
    localStorage.removeItem('userInfo');
  }
};

export const clearStoredUserInfo = () => {
  localStorage.removeItem('userInfo');
  sessionStorage.removeItem('userInfo');
};

export const getUserInfo = () => getStoredUserInfo();

export const getUserRole = () =>
  String(getUserInfo()?.role || getUserInfo()?.user?.role || '').toLowerCase();

export const hasRole = (allowedRoles = []) => {
  if (!allowedRoles.length) return true;
  const role = getUserRole();
  return allowedRoles.includes(role);
};
