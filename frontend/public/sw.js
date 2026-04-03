// sw.js
// Firebase or standard VAPID WebPush Service Worker

self.addEventListener('push', function (event) {
    if (!event.data) {
        console.warn('Push event received with no data.');
        return;
    }

    try {
        const payload = event.data.json();
        
        let title = 'CRM Notification';
        let body = 'You have a new message.';
        let tag = 'default';
        let data = {};
        
        // FCM standard shape
        if (payload.notification) {
            title = payload.notification.title || title;
            body = payload.notification.body || body;
            tag = payload.notification.tag || tag;
        }
        
        if (payload.data) {
            data = payload.data;
        }
        
        const options = {
            body: body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: tag,
            data: data,
            requireInteraction: true // keeps it on screen until clicked
        };
        
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (err) {
        console.error('Error processing push event payload', err);
    }
});

self.addEventListener('notificationclick', function(event) {
    console.log('Notification click received.');
    event.notification.close();

    const data = event.notification.data || {};
    const urlToOpen = new URL(data.url || '/', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            let matchingClient = null;
            for (let i = 0; i < windowClients.length; i++) {
                const windowClient = windowClients[i];
                if (windowClient.url === urlToOpen) {
                    matchingClient = windowClient;
                    break;
                }
            }

            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
