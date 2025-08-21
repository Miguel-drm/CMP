// API Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:3001',
    frontendUrl: 'http://localhost:5173'
  },
  production: {
    apiUrl: process.env.VITE_API_URL || 'https://your-backend-url.onrender.com',
    frontendUrl: process.env.VITE_FRONTEND_URL || 'https://your-frontend-url.netlify.app'
  }
};

const environment = import.meta.env.MODE || 'development';
export const API_BASE_URL = config[environment as keyof typeof config].apiUrl;
export const FRONTEND_URL = config[environment as keyof typeof config].frontendUrl;

export default config[environment as keyof typeof config]; 