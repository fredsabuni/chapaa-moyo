import { api } from '../api';
import type {
  DailyAnalytics,
  ChannelAnalytics,
  RegionAnalytics,
  ContributionSizeAnalytics,
} from '../types';

export type DailyRange = '7' | '14' | '30' | 'all';

export const getDaily    = (days: DailyRange) => api.get<DailyAnalytics[]>(`/analytics/daily?days=${days}`);
export const getChannels = ()                  => api.get<ChannelAnalytics[]>('/analytics/channels');
export const getRegions  = ()                  => api.get<RegionAnalytics[]>('/analytics/regions');
export const getSizes    = ()                  => api.get<ContributionSizeAnalytics[]>('/analytics/contribution-sizes');
