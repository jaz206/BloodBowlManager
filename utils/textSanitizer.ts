const COMMON_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\u00C3\u00A1/g, '\u00E1'],
  [/\u00C3\u00A9/g, '\u00E9'],
  [/\u00C3\u00AD/g, '\u00ED'],
  [/\u00C3\u00B3/g, '\u00F3'],
  [/\u00C3\u00BA/g, '\u00FA'],
  [/\u00C3\u00B1/g, '\u00F1'],
  [/\u00C3\u0081/g, '\u00C1'],
  [/\u00C3\u0089/g, '\u00C9'],
  [/\u00C3\u008D/g, '\u00CD'],
  [/\u00C3\u0093/g, '\u00D3'],
  [/\u00C3\u009A/g, '\u00DA'],
  [/\u00C3\u0091/g, '\u00D1'],
  [/\u00E2\u20AC\u201C/g, '-'],
  [/\u00E2\u20AC\u201D/g, '\u2014'],
  [/\u00E2\u20AC\u02DC|\u00E2\u20AC\u2122/g, "'"],
  [/\u00E2\u20AC\u0153|\u00E2\u20AC\u009D/g, '"'],
  [/\u00C2/g, ''],
  [/\u00C3\u0192\u00C2\u00A1/g, '\u00E1'],
  [/\u00C3\u0192\u00C2\u00A9/g, '\u00E9'],
  [/\u00C3\u0192\u00C2\u00AD/g, '\u00ED'],
  [/\u00C3\u0192\u00C2\u00B3/g, '\u00F3'],
  [/\u00C3\u0192\u00C2\u00BA/g, '\u00FA'],
  [/\u00C3\u0192\u00C2\u00B1/g, '\u00F1'],
  [/\u00C3\u0192\u00E2\u20AC\u02DC/g, '\u00D1'],
  [/\u00C3\u0192\u00C2\u0081/g, '\u00C1'],
  [/\u00C3\u0192\u00E2\u20AC\u00B0/g, '\u00C9'],
  [/\u00C3\u0192\u00C2\u008D/g, '\u00CD'],
  [/\u00C3\u0192\u00E2\u20AC\u015C/g, '\u00D3'],
  [/\u00C3\u0192\u00C5\u00A1/g, '\u00DA'],
  [/\u00C3\u00A2\u20AC\u201C/g, '-'],
  [/\u00C3\u00A2\u20AC\u201D/g, '\u2014'],
  [/\u00C3\u00A2\u20AC\u02DC|\u00C3\u00A2\u20AC\u2122/g, "'"],
  [/\u00C3\u00A2\u20AC\u0153|\u00C3\u00A2\u20AC\u00EF\u00BF\u00BD/g, '"'],
  [/todav\?a/g, 'todav?a'],
  [/A\?adir/g, 'A?adir'],
  [/navegaci\u00C3\u00B3n/g, 'navegaci?n'],
  [/corrupci\?n/g, 'corrupci?n'],
  [/Competici\u00C3\u00B3n/g, 'Competici?n'],
  [/Nigrom\u00C3\u00A1ntico/g, 'Nigrom?ntico'],
  [/N\u00C3\u00B3rdicos/g, 'N?rdicos'],
  [/L\u00C3\u00ADnea/g, 'L?nea'],
  [/L\u00C3\u0192\u00C2\u00ADnea/g, 'L?nea'],
  [/Zombi\s+L\u00C3\u00ADnea/g, 'Zombie L?nea'],
  [/Zombi\s+L\u00C3\u0192\u00C2\u00ADnea/g, 'Zombie L?nea'],
];

export const sanitizeMojibakeText = (value: string): string => {
  let result = String(value ?? '');
  for (const [pattern, replacement] of COMMON_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
};

export const deepSanitizeText = <T,>(value: T): T => {
  if (typeof value === 'string') {
    return sanitizeMojibakeText(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepSanitizeText(item)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, deepSanitizeText(item)])
    ) as T;
  }
  return value;
};
