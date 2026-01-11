const API_URL = {
    DEV: 'https://devenv.com.tr/api',
    LOCAL: 'https://localhost:7080/api',
};

export const environment = {
    production: false,
    appVersion: 'v1.0.0',
    USERDATA_KEY: 'authf649fc9a5f54',
    apiUrl: API_URL.LOCAL, // Geliştirme ortamı için LOCAL kullanılıyor
};

import 'zone.js/plugins/zone-error';
