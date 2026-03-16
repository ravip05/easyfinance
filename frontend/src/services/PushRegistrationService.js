import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import apiClient from '../api/client';

// handles native push notification registration and deep linking
// only activates on native platforms (ios and android)
// on web the service worker handles push via web push api

const PushRegistrationService = {
  isNative: Capacitor.isNativePlatform(),

  // call on first login for staff manager and admin roles
  async register() {
    if (!this.isNative) {
      console.log('push: web platform detected, skipping native registration');
      return;
    }

    try {
      // request permission from the os
      const permResult = await PushNotifications.requestPermissions();

      if (permResult.receive !== 'granted') {
        console.warn('push: user denied notification permission');
        return;
      }

      // register with apns or fcm
      await PushNotifications.register();

      // listen for the registration token
      PushNotifications.addListener('registration', async (token) => {
        console.log('push: registration token received');

        // send token to backend for storage
        try {
          await apiClient.post('/api/push-subscriptions', {
            token: token.value,
            platform: Capacitor.getPlatform(),
            device_name: navigator.userAgent.substring(0, 100),
          });
          console.log('push: token registered with backend');
        } catch (err) {
          console.error('push: failed to register token with backend', err);
        }
      });

      // handle registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('push: registration failed', error);
      });

      // handle incoming notifications when app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('push: foreground notification', notification);
        // the app can show an in-app toast or banner here
        // notification.data contains the lead_id and action for routing
      });

      // handle notification tap when app is in background or killed
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        const data = action.notification.data;
        console.log('push: notification tapped', data);

        // deep link to the lead detail page if the action is open_lead
        if (data.type === 'follow_up_reminder' && data.lead_id) {
          window.location.href = `/leads/${data.lead_id}`;
        }
      });

    } catch (err) {
      console.error('push: initialization failed', err);
    }
  },

  // call on logout to remove the token from backend
  async unregister() {
    if (!this.isNative) return;

    try {
      await apiClient.delete('/api/push-subscriptions');
      await PushNotifications.removeAllListeners();
      console.log('push: unregistered and listeners removed');
    } catch (err) {
      console.error('push: unregistration failed', err);
    }
  },
};

export default PushRegistrationService;
