/**
 * Blood Type Compatibility Utility
 *
 * Implements standard ABO/Rh compatibility rules:
 *   - O- is the universal donor (can donate to all blood types)
 *   - AB+ is the universal recipient (can receive from all blood types)
 *   - Rh- donors can donate to both Rh- and Rh+ recipients of the same ABO group
 *   - Same blood type is always compatible
 */

/** All valid blood types */
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

/**
 * Compatibility matrix: maps each donor type to the set of recipient types it can donate to.
 * Built from standard ABO/Rh transfusion rules.
 */
const COMPATIBILITY_MAP = {
  "O-":  ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"], // universal donor
  "O+":  ["O+", "A+", "B+", "AB+"],
  "A-":  ["A-", "A+", "AB-", "AB+"],
  "A+":  ["A+", "AB+"],
  "B-":  ["B-", "B+", "AB-", "AB+"],
  "B+":  ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],                                              // can only donate to AB+
};

/**
 * Check whether blood from a donor can be safely transfused to a recipient.
 *
 * @param {string} donorType     - Donor blood type (e.g. "O-", "A+")
 * @param {string} recipientType - Recipient blood type (e.g. "AB+", "B-")
 * @returns {boolean} true if compatible, false if incompatible or input is invalid
 */
export function isCompatible(donorType, recipientType) {
  if (!BLOOD_TYPES.includes(donorType) || !BLOOD_TYPES.includes(recipientType)) {
    return false;
  }
  return COMPATIBILITY_MAP[donorType].includes(recipientType);
}

/**
 * Return all blood types that can safely donate to the given recipient type.
 *
 * @param {string} recipientType - The recipient's blood type
 * @returns {string[]} Array of compatible donor blood types, or [] for invalid input
 */
export function getCompatibleDonors(recipientType) {
  if (!BLOOD_TYPES.includes(recipientType)) {
    return [];
  }
  return BLOOD_TYPES.filter((donor) => COMPATIBILITY_MAP[donor].includes(recipientType));
}

/**
 * Return all blood types that can safely receive a donation from the given donor type.
 *
 * @param {string} donorType - The donor's blood type
 * @returns {string[]} Array of compatible recipient blood types, or [] for invalid input
 */
export function getCompatibleRecipients(donorType) {
  if (!BLOOD_TYPES.includes(donorType)) {
    return [];
  }
  return [...COMPATIBILITY_MAP[donorType]];
}
