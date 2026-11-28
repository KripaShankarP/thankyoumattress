import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mailer, html } from '@nestjs/mail';
import type { OtpChannel } from '../generated/prisma/enums.js';
import { SmsService } from './sms.service.js';

/** Delivers sign-in codes by SMS or email */
@Injectable()
export class OtpSenderService {
  private readonly logger = new Logger(OtpSenderService.name);

  constructor(
    private readonly sms: SmsService,
    private readonly mailer: Mailer,
    private readonly config: ConfigService,
  ) {}

  /** In development (console SMS / log email) the code is also shown on the sign-in page */
  printsCodes(channel: OtpChannel) {
    if (this.config.get('NODE_ENV') === 'production') return false;
    return channel === 'SMS' ? this.sms.printsCodes : this.config.get('MAIL_TRANSPORT') !== 'smtp';
  }

  /** Throws when this channel can't deliver codes (mobile sign-in turned off) */
  assertAvailable(channel: OtpChannel) {
    if (channel === 'SMS') this.sms.assertEnabled();
  }

  async send(channel: OtpChannel, target: string, code: string) {
    if (channel === 'SMS') return this.sms.sendOtp(target, code);
    try {
      await this.mailer.send({
        to: target,
        subject: `${code} is your Thankyou Mattresses sign-in code`,
        text: `Your Thankyou Mattresses sign-in code is ${code}.\n\nIt is valid for 5 minutes. If you didn't ask for it, you can ignore this email.`,
        html: html`<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;color:#0f172a">
          <p style="font-size:16px">Your Thankyou Mattresses sign-in code is</p>
          <p style="font-size:34px;font-weight:700;letter-spacing:8px;margin:16px 0">${code}</p>
          <p style="color:#5b6478;font-size:14px">It is valid for 5 minutes. If you didn’t ask for it, you can ignore this email.</p>
        </div>`,
      });
    } catch (e) {
      this.logger.error(`Sign-in email to ${target} failed: ${(e as Error).message}`);
      throw new ServiceUnavailableException('Could not send the email right now. Please try again in a minute.');
    }
    if (this.config.get('MAIL_TRANSPORT') !== 'smtp') {
      this.logger.warn(`Sign-in code for ${target}: ${code}  (MAIL_TRANSPORT=log — not emailed)`);
    }
  }
}
