import type { AdminRole } from '../generated/prisma/enums.js';

/** The signed-in admin, as every handler sees it (never carries the password hash) */
export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: AdminIdentity;
  }
}
