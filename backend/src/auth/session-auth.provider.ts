import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, SessionCookieProvider, type SessionRecord } from '@nestjs/authentication';
import type { AdminIdentity } from './admin-identity.js';
import { AdminUsersService } from './admin-users.service.js';

/** Signs admins in with the session cookie; reloads the admin on every request */
@Injectable()
export class SessionAuth extends SessionCookieProvider<AdminIdentity> {
  constructor(
    private readonly users: AdminUsersService,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  validate(session: SessionRecord) {
    // null for a deleted or deactivated admin ends the session at once
    return this.users.findActive(session.userId);
  }
}
