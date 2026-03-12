/**
 * db/offlineDb.js
 *
 * dexie.js indexeddb schema for offline-first functionality
 * stores cached leads, offline mutation queue, lms content, and dashboard cache
 *
 * this file defines the schema only; actual sync logic is in hooks/useOfflineLeads.js
 */
import Dexie from 'dexie'

export const db = new Dexie('EasyFinanceCRM_Offline')

db.version(1).stores({
  // cached lead records for offline viewing
  leads: 'id, name, phone, stage, assigned_to, follow_up_date, _syncStatus',

  // offline mutation queue (pending api calls)
  mutations: '++id, type, endpoint, method, createdAt',

  // cached lms content for offline reading
  lmsContent: 'id, type, courseId, title',

  // cached dashboard stats
  dashboardCache: 'key',
})

export default db
