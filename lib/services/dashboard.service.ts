import { api } from '../api';
import type { DashboardOverview } from '../types';

export const getOverview = () => api.get<DashboardOverview>('/dashboard/overview');
