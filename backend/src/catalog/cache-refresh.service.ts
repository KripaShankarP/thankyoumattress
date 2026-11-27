import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * The website caches the catalogue; after an admin change we ask it to refresh
 * (frontend/src/app/api/revalidate/route.ts). Failures are logged, never thrown:
 * the change is saved either way and the site refreshes on its next deploy.
 */
@Injectable()
export class CacheRefreshService {
  private readonly logger = new Logger(CacheRefreshService.name);

  constructor(private readonly config: ConfigService) {}

  async catalogChanged() {
    const url = `${this.config.getOrThrow<string>('FRONTEND_URL')}/api/revalidate`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'x-revalidate-secret': this.config.getOrThrow<string>('REVALIDATE_SECRET') },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) this.logger.warn(`Website refresh answered ${res.status}`);
    } catch (e) {
      this.logger.warn(`Could not reach the website to refresh its catalogue: ${(e as Error).message}`);
    }
  }
}
