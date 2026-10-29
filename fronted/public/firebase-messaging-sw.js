/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBu8PaWKJyz5YxcGmcntgopyik5Bxyn9z0',
  authDomain: 'vmovexa-5f0cf.firebaseapp.com',
  projectId: 'vmovexa-5f0cf',
  storageBucket: 'vmovexa-5f0cf.firebasestorage.app',
  messagingSenderId: '1007241948280',
  appId: '1:1007241948280:web:3d9d021e3fab6d5c95118d',
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  self.registration.showNotification(notification.title || 'VMOVEXA', {
    body: notification.body || 'You have a new notification.',
    icon: '/favicon.ico',
    data: payload.data || {},
  });
});
