import { Timeslot } from '@features/availability/interfaces/availability.interface';

export interface Forecasting {
  date: string;
  activityId: string;
  venue: string;
  city: string;
  predictedTimeslots: Timeslot[];
}
