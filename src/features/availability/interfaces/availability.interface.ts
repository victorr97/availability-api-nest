import { Timeslot } from '@common/interfaces/interfaces';

export interface Availability {
  date: string;
  activityId: string;
  venue: string;
  city: string;
  timeslots: Timeslot[];
}
