/**
 * services/pushNotifications.js
 *
 * unified push notification service
 * native: uses capacitor push notifications plugin
 * web: uses web push api + service worker
 *
 * call initPushNotifications() after login to register the device
 */
import { isNative } from '../utils/platform'

/**
 * initialize push notifications
 * registers the device with the backend after getting permission + token
 */
export async function initPushNotifications(apiToken) {
  if (isNative) {
    return initNativePush(apiToken)
  }
  return initWebPush(apiToken)
}

/**
 * native push via capacitor
 */
async function initNativePush(apiToken) {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    // request permission
    const permission = await PushNotifications.requestPermissions()
    if (permission.receive !== 'granted') {
      console.log('push permission not granted')
      return
    }

    // register with os
    await PushNotifications.register()

    // listen for registration token
    PushNotifications.addListener('registration', async (token) => {
      try {
        const { Capacitor } = await import('@capacitor/core')
        await fetch('/api/push-subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            platform: Capacitor.getPlatform(),
            token: token.value,
          }),
        })
        console.log('push device registered')
      } catch (e) {
        console.error('failed to register push device:', e)
      }
    })

    // registration error
    PushNotifications.addListener('registrationError', (err) => {
      console.error('push registration error:', err)
    })

    // foreground notification
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      // show in-app toast — dispatch custom event for the toast system
      window.dispatchEvent(new CustomEvent('push-notification', {
        detail: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
        },
      }))
    })

    // notification tapped from background
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification?.data
      if (data?.route) {
        // deep link to the relevant page
        window.location.hash = data.route
      }
    })
  } catch (e) {
    console.error('native push init failed:', e)
  }
}

/**
 * web push via service worker
 */
async function initWebPush(apiToken) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('web push not supported')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // check existing subscription
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // we need a vapid key from the backend
      // for now we skip web push registration since the backend needs to provide the key
      console.log('web push: no vapid key configured yet')
      return
    }

    // send subscription to backend
    await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        platform: 'web',
        subscription: subscription.toJSON(),
      }),
    })
    console.log('web push subscription registered')
  } catch (e) {
    console.error('web push init failed:', e)
  }
}
