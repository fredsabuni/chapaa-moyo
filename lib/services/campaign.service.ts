import { api } from '../api';
import type { Campaign } from '../types';

export const getCampaign = () => api.get<Campaign>('/campaign');

export const updateCampaign = (data: Partial<Pick<Campaign, 'name' | 'description' | 'goal' | 'end_date'>>) =>
  api.patch<Campaign>('/campaign', data);
