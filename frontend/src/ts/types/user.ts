/* ============================================
   StartupEvents — User Type Definitions
   Syllabus: FE Unit V — Interfaces, enums,
             utility types, readonly
   ============================================ */

/**
 * User roles as a union of string literals
 * Demonstrates: type alias, literal union
 */
export type UserRole = 'attendee' | 'organizer' | 'admin';

/**
 * Full user interface
 * Demonstrates: interface, readonly, optional properties, arrays
 */
export interface IUser {
  readonly _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  interests: string[];
  eventsOrganized: string[];
  eventsAttending: string[];
  createdAt: string;
  updatedAt: string;

  // Virtual
  fullName?: string;
}

/**
 * User registration payload
 * Demonstrates: Pick utility type — selects specific fields
 */
export type RegisterPayload = Pick<IUser, 'firstName' | 'lastName' | 'email'> & {
  password: string;
  role?: UserRole;
};

/**
 * Login payload
 * Demonstrates: simple interface
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * User profile update payload
 * Demonstrates: Partial + Pick combination
 */
export type UpdateProfilePayload = Partial<
  Pick<IUser, 'firstName' | 'lastName' | 'bio' | 'interests' | 'avatar'>
>;

/**
 * Auth response from login/register endpoints
 * Demonstrates: interface with nested types
 */
export interface IAuthResponse {
  user: Omit<IUser, 'eventsOrganized' | 'eventsAttending'>;
  accessToken: string;
  refreshToken: string;
}

/**
 * RSVP data
 */
export interface IRSVP {
  readonly _id: string;
  user: string | IUser;
  event: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'waitlisted';
  role: 'developer' | 'designer' | 'product-manager' | 'entrepreneur' | 'student' | 'other';
  teamSize: number;
  notes?: string;
  createdAt: string;
}
