import { Timeslot } from '@common/interfaces/interfaces';

export interface Forecasting {
  date: string;
  activityId: string;
  venue: string;
  city: string;
  predictedTimeslots: Timeslot[];
}
