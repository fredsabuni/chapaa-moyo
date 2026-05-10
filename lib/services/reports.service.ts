import { api } from '../api';
import type { Report, ReportDownload } from '../types';

export const listReports       = () => api.get<Report[]>('/reports');
export const getReportDownload = (id: string) => api.get<ReportDownload>(`/reports/${id}/download`);
