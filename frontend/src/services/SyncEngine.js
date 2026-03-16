import { Network } from '@capacitor/network';
import apiClient from '../api/client';
import { getPendingMutations, removeMutation, cacheLeads } from './OfflineLeadDB';

// sync engine that processes queued offline mutations when connectivity is restored
// uses a conflict resolution strategy of last-write-wins

let isSyncing = false;

// process all pending mutations in fifo order
async function processQueue() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const mutations = await getPendingMutations();

    if (mutations.length === 0) {
      isSyncing = false;
      return;
    }

    console.log(`sync: processing ${mutations.length} pending mutations`);

    for (const mutation of mutations) {
      try {
        const payload = JSON.parse(mutation.payload);

        switch (mutation.action) {
          case 'create':
            await apiClient.post(`/api/${mutation.entity}`, payload);
            break;

          case 'update':
            await apiClient.put(`/api/${mutation.entity}/${mutation.entityId}`, payload);
            break;

          case 'patch_stage':
            await apiClient.patch(`/api/${mutation.entity}/${mutation.entityId}/stage`, payload);
            break;

          case 'delete':
            await apiClient.delete(`/api/${mutation.entity}/${mutation.entityId}`);
            break;

          default:
            console.warn(`sync: unknown action ${mutation.action}, skipping`);
        }

        // remove from queue after successful sync
        await removeMutation(mutation.id);
        console.log(`sync: mutation ${mutation.id} synced and removed`);

      } catch (err) {
        // if the server returns a conflict we skip the mutation
        if (err.response && err.response.status === 409) {
          console.warn(`sync: conflict on mutation ${mutation.id}, removing stale entry`);
          await removeMutation(mutation.id);
        } else if (err.response && err.response.status >= 400 && err.response.status < 500) {
          // client errors are not retryable so remove them
          console.error(`sync: mutation ${mutation.id} failed with ${err.response.status}, removing`);
          await removeMutation(mutation.id);
        } else {
          // network or server errors stop the queue to retry later
          console.error(`sync: mutation ${mutation.id} failed, will retry later`, err);
          break;
        }
      }
    }

    // after syncing mutations refresh the local lead cache
    try {
      const response = await apiClient.get('/api/leads?per_page=100');
      if (response.data && response.data.data) {
        await cacheLeads(response.data.data);
        console.log('sync: local lead cache refreshed');
      }
    } catch (err) {
      console.warn('sync: failed to refresh lead cache after sync', err);
    }

  } finally {
    isSyncing = false;
  }
}

// initialize the sync engine with network change listeners
export function initSyncEngine() {
  // listen for connectivity changes on native platforms
  Network.addListener('networkStatusChange', (status) => {
    console.log(`sync: network status changed, connected=${status.connected}`);
    if (status.connected) {
      processQueue();
    }
  });

  // also attempt sync on page visibility change for web
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        processQueue();
      }
    });
  }

  // attempt initial sync
  processQueue();

  console.log('sync: engine initialized');
}

export { processQueue };
