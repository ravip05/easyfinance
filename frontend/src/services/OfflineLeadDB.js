import Dexie from 'dexie';

// offline first database for lead management
// uses indexeddb via dexie v4 for sql-like querying on cached lead data
// syncs mutations back to the server when connectivity is restored

class OfflineLeadDB extends Dexie {
  constructor() {
    super('EasyFinanceCRM');

    // schema versioning for future migrations
    this.version(1).stores({
      // primary lead cache with indexed fields for filtering
      leads: 'id, name, phone, loan_type, stage, assigned_to, franchise_id, priority, created_at, updated_at',

      // pending mutations queue for offline edits
      // auto-incremented id ensures fifo ordering on sync
      pendingMutations: '++id, entity, entityId, action, timestamp',

      // dashboard cache for role specific aggregations
      dashboardCache: 'role, fetched_at',
    });

    this.leads = this.table('leads');
    this.pendingMutations = this.table('pendingMutations');
    this.dashboardCache = this.table('dashboardCache');
  }
}

const db = new OfflineLeadDB();

// cache an array of leads from the api response into indexeddb
export async function cacheLeads(leads) {
  if (!leads || leads.length === 0) return;

  await db.transaction('rw', db.leads, async () => {
    await db.leads.bulkPut(leads);
  });
}

// get cached leads with optional filters for offline browsing
export async function getCachedLeads(filters = {}) {
  let collection = db.leads.toCollection();

  if (filters.stage) {
    collection = db.leads.where('stage').equals(filters.stage);
  }

  if (filters.loan_type) {
    collection = db.leads.where('loan_type').equals(filters.loan_type);
  }

  const results = await collection.sortBy('updated_at');
  return results.reverse();
}

// get a single lead by id from cache
export async function getCachedLead(id) {
  return db.leads.get(id);
}

// queue an offline mutation for later sync
export async function queueMutation(entity, entityId, action, payload) {
  await db.pendingMutations.add({
    entity,
    entityId,
    action,
    payload: JSON.stringify(payload),
    timestamp: new Date().toISOString(),
  });
}

// get all pending mutations in fifo order
export async function getPendingMutations() {
  return db.pendingMutations.orderBy('id').toArray();
}

// remove a mutation after successful sync
export async function removeMutation(id) {
  await db.pendingMutations.delete(id);
}

// cache role based dashboard data
export async function cacheDashboardData(role, data) {
  await db.dashboardCache.put({
    role,
    data: JSON.stringify(data),
    fetched_at: new Date().toISOString(),
  });
}

// retrieve cached dashboard data for a role
export async function getCachedDashboard(role) {
  const cached = await db.dashboardCache.get(role);
  if (!cached) return null;
  return {
    data: JSON.parse(cached.data),
    fetched_at: cached.fetched_at,
  };
}

// clear all offline data on logout
export async function clearOfflineData() {
  await db.leads.clear();
  await db.pendingMutations.clear();
  await db.dashboardCache.clear();
}

export default db;
