window.OSL_CONFIG = {
  API_BASE: window.location.origin.includes('github.io')
    ? 'http://127.0.0.1:8000'
    : window.location.origin,
};
