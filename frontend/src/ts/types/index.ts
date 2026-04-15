/* ============================================
   StartupEvents — Type Re-exports
   Syllabus: FE Unit V — ES Modules, barrel exports
   ============================================ */

/**
 * Barrel file — re-exports all types from a single entry point
 * Demonstrates: named re-exports, module organization
 *
 * Usage: import { IEvent, IUser, ApiResponse } from '@types';
 */

export type {
  EventCategory,
  EventStatus,
  ILocation,
  ITimeRange,
  IEvent,
  IEventPopulated,
  IUserSummary,
  CreateEventPayload,
  UpdateEventPayload,
  IEventFilters,
} from './event';

export type {
  UserRole,
  IUser,
  RegisterPayload,
  LoginPayload,
  UpdateProfilePayload,
  IAuthResponse,
  IRSVP,
} from './user';

export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  PaginatedResponse,
  IPagination,
  IValidationError,
  HttpMethod,
  RequestConfig,
} from './api';
