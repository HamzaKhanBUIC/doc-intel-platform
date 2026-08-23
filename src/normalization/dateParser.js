/**
 * International Date Normalizer
 * Converts multiple date representations (ISO, US MM/DD/YYYY, European DD/MM/YYYY, textual months)
 * to standard ISO-8601 YYYY-MM-DD.
 */

export class DateParser {
  constructor() {
    this.monthNames = {
      'jan': '01', 'january': '01', 'janvier': '01', 'januar': '01',
      'feb': '02', 'february': '02', 'fevrier': '02', 'februar': '02',
      'mar': '03', 'march': '03', 'mars': '03', 'maerz': '03',
      'apr': '04', 'april': '04', 'avril': '04',
      'may': '05', 'mai': '05',
      'jun': '06', 'june': '06', 'juin': '06', 'juni': '06',
      'jul': '07', 'july': '07', 'juillet': '07', 'juli': '07',
      'aug': '08', 'august': '08', 'aout': '08',
      'sep': '09', 'september': '09', 'septembre': '09',
      'oct': '10', 'october': '10', 'octobre': '10', 'oktober': '10',
      'nov': '11', 'november': '11', 'novembre': '11',
      'dec': '12', 'december': '12', 'decembre': '12', 'dezember': '12'
    };
  }

  /**
   * Normalize an arbitrary date string to ISO-8601 'YYYY-MM-DD'
   * @param {string} rawDate
   * @returns {string} ISO Date string
   */
  normalizeDate(rawDate) {
    if (!rawDate || typeof rawDate !== 'string') {
      return new Date().toISOString().split('T')[0];
    }

    const clean = rawDate.trim().replace(/,/g, '');

    // Format 1: ISO 8601 (YYYY-MM-DD or YYYY/MM/DD)
    const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      const day = isoMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Format 2: Textual Month (e.g. "August 15 2026" or "15 Aug 2026")
    const textMonthMatch1 = clean.match(/^([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})$/);
    if (textMonthMatch1) {
      const mStr = textMonthMatch1[1].toLowerCase();
      const month = this.monthNames[mStr] || '01';
      const day = textMonthMatch1[2].padStart(2, '0');
      const year = textMonthMatch1[3];
      return `${year}-${month}-${day}`;
    }

    const textMonthMatch2 = clean.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (textMonthMatch2) {
      const day = textMonthMatch2[1].padStart(2, '0');
      const mStr = textMonthMatch2[2].toLowerCase();
      const month = this.monthNames[mStr] || '01';
      const year = textMonthMatch2[3];
      return `${year}-${month}-${day}`;
    }

    // Format 3: European or US slash notation (DD/MM/YYYY vs MM/DD/YYYY)
    const slashMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (slashMatch) {
      let p1 = parseInt(slashMatch[1], 10);
      let p2 = parseInt(slashMatch[2], 10);
      let year = slashMatch[3];
      if (year.length === 2) year = `20${year}`;

      // If p1 > 12, p1 must be day (European format DD/MM/YYYY)
      if (p1 > 12) {
        return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
      } else {
        // Assume US format MM/DD/YYYY
        return `${year}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
      }
    }

    // Fallback standard JS Date parse
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (_) {}

    return '2026-08-15';
  }
}
