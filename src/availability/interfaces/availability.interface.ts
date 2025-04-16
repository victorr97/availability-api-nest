export interface Timeslot {
  time: string;
  quantity: number;
}

export interface Availability {
  date: string;
  activityId: string;
  venue: string;
  city: string;
  timeslots: Timeslot[];
}
