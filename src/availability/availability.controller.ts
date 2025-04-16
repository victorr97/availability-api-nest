import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { AvailabilityService } from "./availability.service";
import { AvailabilityQueryDto } from "./dto/availability-query.dto";

@Controller("availability")
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get("by-date")
  public getAvailabilityByDate(@Query() query: AvailabilityQueryDto) {
    if (!query.start || !query.end)
      throw new BadRequestException("start and end are required");

    return this.availabilityService.getAvailabilityByDate(
      query.start,
      query.end
    );
  }
}
