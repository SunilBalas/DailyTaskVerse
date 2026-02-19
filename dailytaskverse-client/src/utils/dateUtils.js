const IST_TZ = 'Asia/Kolkata';

export const formatDateIST = (dateStr, options = {}) => {
  return new Date(dateStr).toLocaleString('en-IN', { timeZone: IST_TZ, ...options });
};

export const formatDateShortIST = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    timeZone: IST_TZ, month: 'short', day: 'numeric'
  });
};

export const formatDateFullIST = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    timeZone: IST_TZ, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
};

export const formatDateTimeIST = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-IN', {
    timeZone: IST_TZ, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const todayIST = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: IST_TZ });
};

export const nowTimeIST = () => {
  return new Date().toLocaleTimeString('en-GB', { timeZone: IST_TZ, hour: '2-digit', minute: '2-digit', hour12: false });
};

export const plusOneHourIST = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  return d.toLocaleTimeString('en-GB', { timeZone: IST_TZ, hour: '2-digit', minute: '2-digit', hour12: false });
};
