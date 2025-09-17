import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function normalizeMsisdn(input: string, defaultCountry: string): string {
  const p = parsePhoneNumberFromString(input, defaultCountry);
  if (!p || !p.isValid()) throw new Error('Invalid MSISDN');
  return p.number; // E.164 format, e.g. +2507xxxxxxx
}