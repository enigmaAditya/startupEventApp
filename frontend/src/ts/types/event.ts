/* ============================================
   StartupEvents — Event Type Definitions
   Syllabus: FE Unit V — Interfaces, type aliases,
             union types, enums, literal types
   ============================================ */

/**
 * Event categories as a union of string literals
 * Demonstrates: type alias, union of literal types
 */
export type EventCategory =
  | 'hackathon'
  | 'pitch-night'
  | 'workshop'
  | 'meetup'
  | 'conference';

/**
 * Event status as a union type
 * Demonstrates: literal union type
 */
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

/**
 * Location interface — nested object typing
 * Demonstrates: interface, optional properties (?)
 */
export interface ILocation {
  venue: string;
  city: string;
  state?: string;
  country: string;
  isVirtual: boolean;
  meetingLink?: string;
}

/**
 * Time range interface
 * Demonstrates: simple interface
 */
export interface ITimeRange {
  start: string;
  end: string;
}

/**
 * Event interface — main data model
 * Demonstrates: interface, optional props, arrays,
 *               nested interfaces, readonly, index signature
 */
export interface IEvent {
  readonly _id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // ISO date string
  endDate?: string;
  time?: ITimeRange;
  location: ILocation;
  organizer: string | IUserSummary; // Union: ObjectId string OR populated user
  capacity: number;
  attendees: string[];
  tags: string[];
  image?: string;
  status: EventStatus;
  prizePool?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;

  // Virtual fields (computed by Mongoose, not stored)
  attendeeCount?: number;
  spotsRemaining?: number;
  isFullyBooked?: boolean;
}

/**
 * Minimal user summary (when user is populated in event)
 * Demonstrates: interface for a subset of data
 */
export interface IUserSummary {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

/**
 * Event with populated organizer
 * Demonstrates: intersection type — combines IEvent with a narrower organizer type
 */
export type IEventPopulated = Omit<IEvent, 'organizer'> & {
  organizer: IUserSummary;
};

/**
 * Create event payload — what the client sends to POST /events
 * Demonstrates: Omit utility type — excludes server-generated fields
 */
export type CreateEventPayload = Omit<
  IEvent,
  '_id' | 'organizer' | 'attendees' | 'status' | 'createdAt' | 'updatedAt' | 'attendeeCount' | 'spotsRemaining' | 'isFullyBooked'
>;

/**
 * Update event payload — all fields optional
 * Demonstrates: Partial utility type
 */
export type UpdateEventPayload = Partial<CreateEventPayload>;

/**
 * Event filter options for the listing page
 * Demonstrates: type alias with optional fields
 */
export interface IEventFilters {
  category?: EventCategory;
  status?: EventStatus;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'date-asc' | 'date-desc' | 'name-asc' | 'popular';
}
