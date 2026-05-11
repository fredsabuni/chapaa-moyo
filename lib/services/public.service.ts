import { publicGet, BASE_URL } from '../api';
import type { PublicCampaign, PublicDonor, ListResponse } from '../types';

export const getPublicCampaign = (slug: string) =>
  publicGet<PublicCampaign>(`/public/campaigns/${slug}`);

export async function getTopDonors(slug: string, page = 1, limit = 8): Promise<ListResponse<PublicDonor>> {
  const res = await fetch(
    `${BASE_URL}/public/campaigns/${slug}/donors?page=${page}&limit=${limit}`,
    { headers: { Accept: 'application/json' } },
  );
  const json = await res.json();
  const m = json.meta ?? {};
  return {
    items: json.data ?? [],
    meta: {
      page:     m.page      ?? page,
      limit:    m.per_page  ?? limit,
      total:    m.total     ?? 0,
      has_more: (m.page ?? page) < (m.last_page ?? 1),
    },
  };
}
