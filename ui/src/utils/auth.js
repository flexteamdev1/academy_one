export const getUserInfo = () => {
  try {
    const raw = localStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : {};
  } catch (_error) {
    return {};
  }
};

export const getUserRole = () =>
  String(getUserInfo()?.role || getUserInfo()?.user?.role || '').toLowerCase();

export const hasRole = (allowedRoles = []) => {
  if (!allowedRoles.length) return true;
  const role = getUserRole();
  return allowedRoles.includes(role);
};
