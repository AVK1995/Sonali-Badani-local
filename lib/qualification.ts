import { FORM } from './webinar-content';

/**
 * The qualification gate, decided in exactly one place.
 *
 * Two answers on the registration form decide whether a registrant is
 * "Qualified". Both gates must pass:
 *
 *   Gate 1, "What best describes you?"
 *     PASS  Working Professional, Entrepreneur / Business Owner, Freelancer
 *     FAIL  Homemaker, and anything typed into Other
 *
 *   Gate 2, "Are you willing to transform your relationship?"
 *     PASS  Yes I'm ready right now, Yes but I want to understand the approach first
 *     FAIL  Not sure, just exploring
 *
 * A qualified registrant gets a third Meta event, `QualifiedLead`, on top of
 * `CompleteRegistration` and `Lead`, and `status: "Qualified"` on the webhook.
 * Everyone else gets the two events and `status: "Not Qualified"`.
 *
 * WHY THIS LIVES HERE. The Meta event and the CRM row must never disagree about
 * the same woman: an ad account optimising toward QualifiedLead while the sheet
 * calls her Not Qualified is the kind of drift nobody notices for a month. Both
 * read this function, and the pass lists come from the same option objects the
 * form renders, so a new option added to the copy cannot silently default to
 * qualifying.
 */

export type QualificationStatus = 'Qualified' | 'Not Qualified';

/** True when this answer to Q1 passes gate 1. Free text never qualifies. */
export function occupationQualifies(occupation: string): boolean {
  const match = FORM.fields.occupation.options.find((o) => o.value === occupation);
  return match?.qualifying ?? false;
}

/** True when this answer to Q2 passes gate 2. */
export function readinessQualifies(readiness: string): boolean {
  const match = FORM.fields.readiness.options.find((o) => o.value === readiness);
  return match?.qualifying ?? false;
}

/** Both gates, as the single yes or no the rest of the funnel reads. */
export function isQualified(occupation: string, readiness: string): boolean {
  return occupationQualifies(occupation) && readinessQualifies(readiness);
}

/** The exact string written to the `status` key on the registration webhook. */
export function qualificationStatus(
  occupation: string,
  readiness: string
): QualificationStatus {
  return isQualified(occupation, readiness) ? 'Qualified' : 'Not Qualified';
}
