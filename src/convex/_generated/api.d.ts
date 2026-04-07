/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as private_courseDrafts from '../private/courseDrafts.js';
import type * as private_courseHelpers from '../private/courseHelpers.js';
import type * as private_courseImport from '../private/courseImport.js';
import type * as private_coursePublish from '../private/coursePublish.js';
import type * as private_courseValidators from '../private/courseValidators.js';
import type * as private_courses from '../private/courses.js';
import type * as private_helpers from '../private/helpers.js';
import type * as private_submissions from '../private/submissions.js';
import type * as authed_users from '../authed/users.js';

import type { ApiFromModules, FilterApi, FunctionReference } from 'convex/server';

declare const fullApi: ApiFromModules<{
	'authed/users': typeof authed_users;
	'private/courseDrafts': typeof private_courseDrafts;
	'private/courseHelpers': typeof private_courseHelpers;
	'private/courseImport': typeof private_courseImport;
	'private/coursePublish': typeof private_coursePublish;
	'private/courseValidators': typeof private_courseValidators;
	'private/courses': typeof private_courses;
	'private/helpers': typeof private_helpers;
	'private/submissions': typeof private_submissions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, 'public'>>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, 'internal'>>;

export declare const components: {};
