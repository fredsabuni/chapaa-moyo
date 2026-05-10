import { api } from '../api';
import type { Contributor, ContributorStats, ListResponse } from '../types';
import { CONTRIBUTOR_PAGE_LIMIT } from '../constants';

export interface ContributorFilters {
  page?:    number;
  limit?:   number;
  channel?: string;
  region?:  string;
  type?:    string;
  sort?:    string;
}

export function listContributors(filters: ContributorFilters = {}): Promise<ListResponse<Contributor>> {
  return api.list<Contributor>('/contributors', {
    page:    filters.page  ?? 1,
    limit:   filters.limit ?? CONTRIBUTOR_PAGE_LIMIT,
    channel: filters.channel,
    region:  filters.region,
    type:    filters.type,
    sort:    filters.sort,
  });
}

export const getContributorStats = () => api.get<ContributorStats>('/contributors/stats');
