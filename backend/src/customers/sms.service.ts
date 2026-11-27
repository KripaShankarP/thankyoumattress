import { Injectable, Logger, type OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Sends sign-in codes by SMS through the provider chosen with SMS_PROVIDER */
@Injectable()
export class SmsService implements OnModuleInit {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: ConfigService) {}

  get provider() {
    return this.config.get<'console' | 'msg91' | 'fast2sms'>('SMS_PROVIDER') ?? 'console';
  }

  /** In development the code is printed (and shown on the sign-in page) instead of sent */
  get printsCodes() {
    return this.provider === 'console' && this.config.get('NODE_ENV') !== 'production';
  }

  onModuleInit() {
    if (this.provider === 'console' && this.config.get('NODE_ENV') === 'production')
      throw new Error('SMS_PROVIDER=console is for development only: set msg91 or fast2sms so customers receive their sign-in codes');
    const need: Record<string, string[]> = { msg91: ['MSG91_AUTH_KEY', 'MSG91_TEMPLATE_ID'], fast2sms: ['FAST2SMS_API_KEY'], console: [] };
    const missing = need[this.provider].filter((k) => !this.config.get(k));
    if (missing.length) throw new Error(`SMS_PROVIDER=${this.provider} needs ${missing.join(', ')} in .env`);
  }

  /** `phone` is a 10-digit Indian mobile number */
  async sendOtp(phone: string, code: string) {
    if (this.provider === 'console') {
      this.logger.warn(`Sign-in code for ${phone}: ${code}  (SMS_PROVIDER=console — not sent)`);
      return;
    }
    let res: Response;
    try {
      if (this.provider === 'msg91') {
        const url = new URL('https://control.msg91.com/api/v5/otp');
        url.searchParams.set('template_id', this.config.getOrThrow('MSG91_TEMPLATE_ID'));
        url.searchParams.set('mobile', `91${phone}`);
        url.searchParams.set('otp', code);
        res = await fetch(url, { method: 'POST', headers: { authkey: this.config.getOrThrow('MSG91_AUTH_KEY') }, signal: AbortSignal.timeout(10_000) });
      } else {
        const url = new URL('https://www.fast2sms.com/dev/bulkV2');
        url.searchParams.set('route', 'otp');
        url.searchParams.set('variables_values', code);
        url.searchParams.set('numbers', phone);
        res = await fetch(url, { headers: { authorization: this.config.getOrThrow('FAST2SMS_API_KEY') }, signal: AbortSignal.timeout(10_000) });
      }
    } catch (e) {
      this.logger.error(`SMS provider unreachable: ${(e as Error).message}`);
      throw new ServiceUnavailableException('Could not send the code right now. Please try again in a minute.');
    }
    if (!res.ok) {
      this.logger.error(`SMS provider answered ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`);
      throw new ServiceUnavailableException('Could not send the code right now. Please try again in a minute.');
    }
  }
}
