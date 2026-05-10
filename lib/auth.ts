// Thin shim — real logic lives in lib/session.ts and lib/services/auth.service.ts.
// This file keeps the import path stable for the dashboard route guard.

export { hasValidSession as isAuthed } from './session';
export { logoutUser as logout } from './services/auth.service';
