import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { Throttle } from '@nestjs/throttler';
import { EnquiriesService } from './enquiries.service.js';
import {
  createEnquirySchema,
  listEnquiriesSchema,
  updateEnquirySchema,
  type CreateEnquiry,
  type ListEnquiries,
  type UpdateEnquiry,
} from './enquiries.schemas.js';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post()
  create(@Body({ schema: createEnquirySchema }) body: CreateEnquiry) {
    return this.enquiries.create(body);
  }
}

@Controller('admin/enquiries')
export class AdminEnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Get()
  list(@Query({ schema: listEnquiriesSchema }) query: ListEnquiries) {
    return this.enquiries.list(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body({ schema: updateEnquirySchema }) body: UpdateEnquiry) {
    return this.enquiries.update(id, body);
  }
}
