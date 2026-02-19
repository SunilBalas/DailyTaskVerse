const IST_TZ = 'Asia/Kolkata';

// Ensure date strings without timezone info are treated as UTC
const asUtc = (dateStr) => {
  if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 19)) {
    return dateStr + 'Z';
  }
  return dateStr;
};

export const formatDateIST = (dateStr, options = {}) => {
  return new Date(asUtc(dateStr)).toLocaleString('en-IN', { timeZone: IST_TZ, ...options });
};

export const formatDateShortIST = (dateStr) => {
  return new Date(asUtc(dateStr)).toLocaleDateString('en-IN', {
    timeZone: IST_TZ, month: 'short', day: 'numeric'
  });
};

export const formatDateFullIST = (dateStr) => {
  return new Date(asUtc(dateStr)).toLocaleDateString('en-IN', {
    timeZone: IST_TZ, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
};

export const formatDateTimeIST = (dateStr) => {
  return new Date(asUtc(dateStr)).toLocaleString('en-IN', {
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
