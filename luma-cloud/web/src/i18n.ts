import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app_title: 'Luma Cloud',
      login: 'Login',
      logout: 'Logout',
      username: 'Username',
      password: 'Password',
      files: 'Files',
      assistant: 'Assistant',
      language: 'Language',
      upload: 'Upload',
      chat_placeholder: 'Ask the assistant...'
    },
  },
  es: {
    translation: {
      app_title: 'Luma Nube',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      username: 'Usuario',
      password: 'Contraseña',
      files: 'Archivos',
      assistant: 'Asistente',
      language: 'Idioma',
      upload: 'Subir',
      chat_placeholder: 'Pregunta al asistente...'
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;