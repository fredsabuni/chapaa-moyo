import { api } from '../api';
import type { Admin, AdminRole } from '../types';

export interface InviteAdminPayload {
  email: string;
  phone: string;
  name:  string;
  role:  AdminRole;
}

export const listAdmins   = () => api.get<Admin[]>('/admins');
export const inviteAdmin  = (payload: InviteAdminPayload) => api.post<Admin>('/admins/invite', payload);
export const removeAdmin  = (id: string) => api.del<{ message: string }>(`/admins/${id}`);
