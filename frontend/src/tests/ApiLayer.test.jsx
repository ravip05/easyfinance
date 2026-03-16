import { describe, it, expect, vi } from 'vitest';
import apiClient from '../api/client';
import { leadsApi, staffApi } from '../api/leads';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
    }
  },
}));

describe('API Layer', () => {
  it('leadsApi.list calls correct endpoint', async () => {
    apiClient.get.mockResolvedValueOnce({ data: [] });
    await leadsApi.list({ search: 'abc' });
    expect(apiClient.get).toHaveBeenCalledWith('/leads', { params: { search: 'abc', per_page: 200 } });
  });

  it('leadsApi.create calls post', async () => {
    apiClient.post.mockResolvedValueOnce({ data: {} });
    await leadsApi.create({ name: 'Test' });
    expect(apiClient.post).toHaveBeenCalledWith('/leads', { name: 'Test' });
  });

  it('staffApi.list calls correct endpoint', async () => {
    apiClient.get.mockResolvedValueOnce({ data: [] });
    await staffApi.list();
    expect(apiClient.get).toHaveBeenCalledWith('/staff');
  });
});
