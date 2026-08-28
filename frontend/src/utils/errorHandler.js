export const getErrorMessage = (err, fallback = 'An unexpected error occurred. Please try again.') => {
  if (typeof err === 'string') return err;
  
  if (err?.data) {
    if (typeof err.data === 'string') {
      if (err.data.toLowerCase().includes('<html') || err.data.toLowerCase().includes('<!doctype')) {
        return 'Server experienced an internal fault. Please check your connection or try again later.';
      }
      return err.data;
    }
    
    if (err.data.message) {
      return err.data.message;
    }
  }

  if (err?.error) {
    if (typeof err.error === 'string') return err.error;
    if (err.error.message) return err.error.message;
  }
  
  if (err?.message) {
    return err.message;
  }

  return fallback;
};
