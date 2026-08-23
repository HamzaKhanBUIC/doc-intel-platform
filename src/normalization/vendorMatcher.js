/**
 * Enterprise Fuzzy Vendor Matcher & Master Catalog Resolution
 * Uses Levenshtein Distance & Token Sort Ratio to match noisy OCR vendor strings
 * against known Vendor Masters with aliases, tax IDs, and GL account codes.
 */

export class VendorMatcher {
  constructor(customCatalog = []) {
    // Default Enterprise Vendor Master Catalog
    this.vendorMaster = [
      {
        id: 'VEND_001',
        canonicalName: 'Acme Industrial Supplies Inc.',
        taxId: 'US-94829103',
        defaultGlAccount: '5010 - Cost of Goods Sold',
        defaultPaymentTerms: 'NET30',
        aliases: [
          'acme industrial',
          'acme supplies',
          'acme ind supply',
          'acme ind supp inc',
          'acme industrial supplies'
        ]
      },
      {
        id: 'VEND_002',
        canonicalName: 'Pacific Overland Logistics LLC',
        taxId: 'US-88129044',
        defaultGlAccount: '6020 - Freight & Delivery Expense',
        defaultPaymentTerms: 'NET15',
        aliases: [
          'pacific overland',
          'pacific logistics',
          'pacific overland freight',
          'pacific freight',
          'pacific overland log llc'
        ]
      },
      {
        id: 'VEND_003',
        canonicalName: 'Global Cloud Infrastructure AWS Corp',
        taxId: 'US-44771122',
        defaultGlAccount: '6050 - Software & Technology Hosting',
        defaultPaymentTerms: 'DUE_ON_RECEIPT',
        aliases: [
          'aws cloud services',
          'amazon web services',
          'aws compute cloud',
          'global cloud infra'
        ]
      },
      {
        id: 'VEND_004',
        canonicalName: 'Delta Precision Machine Tools Corp',
        taxId: 'US-33990011',
        defaultGlAccount: '1500 - Machinery & Equipment Asset',
        defaultPaymentTerms: 'NET45',
        aliases: [
          'delta precision',
          'delta machine tools',
          'delta tools corp',
          'delta precision tools'
        ]
      },
      ...customCatalog
    ];
  }

  /**
   * Resolve an extracted raw vendor name and optional Tax ID to canonical vendor master
   * @param {string} rawVendorName
   * @param {string} [rawTaxId]
   * @returns {{ matched: boolean, vendor: any | null, confidence: number, matchType: 'EXACT' | 'TAX_ID' | 'FUZZY_ALIAS' | 'FUZZY_NAME' | 'UNMATCHED', distance?: number }}
   */
  resolveVendor(rawVendorName, rawTaxId = null) {
    if (!rawVendorName || rawVendorName.trim().length === 0) {
      return { matched: false, vendor: null, confidence: 0.0, matchType: 'UNMATCHED' };
    }

    const cleanRaw = this.sanitizeString(rawVendorName);
    const cleanTax = rawTaxId ? rawTaxId.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : null;

    // 1. Tax ID Exact Match
    if (cleanTax) {
      for (const master of this.vendorMaster) {
        const masterTax = master.taxId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (masterTax === cleanTax) {
          return {
            matched: true,
            vendor: master,
            confidence: 0.99,
            matchType: 'TAX_ID'
          };
        }
      }
    }

    // 2. Exact Canonical Name Match (Case-Insensitive)
    for (const master of this.vendorMaster) {
      if (this.sanitizeString(master.canonicalName) === cleanRaw) {
        return {
          matched: true,
          vendor: master,
          confidence: 0.99,
          matchType: 'EXACT'
        };
      }
    }

    // 3. Exact Alias Match
    for (const master of this.vendorMaster) {
      for (const alias of master.aliases) {
        if (this.sanitizeString(alias) === cleanRaw) {
          return {
            matched: true,
            vendor: master,
            confidence: 0.95,
            matchType: 'FUZZY_ALIAS'
          };
        }
      }
    }

    // 4. Fuzzy Levenshtein & Token Similarity Search
    let bestMatch = null;
    let highestScore = 0;
    let matchType = 'UNMATCHED';

    for (const master of this.vendorMaster) {
      // Check against canonical name
      const nameScore = this.calculateTokenSimilarity(cleanRaw, this.sanitizeString(master.canonicalName));
      if (nameScore > highestScore) {
        highestScore = nameScore;
        bestMatch = master;
        matchType = 'FUZZY_NAME';
      }

      // Check against all aliases
      for (const alias of master.aliases) {
        const aliasScore = this.calculateTokenSimilarity(cleanRaw, this.sanitizeString(alias));
        if (aliasScore > highestScore) {
          highestScore = aliasScore;
          bestMatch = master;
          matchType = 'FUZZY_ALIAS';
        }
      }
    }

    // Minimum acceptance threshold: 0.70 similarity
    if (highestScore >= 0.70 && bestMatch) {
      return {
        matched: true,
        vendor: bestMatch,
        confidence: Math.round(highestScore * 100) / 100,
        matchType
      };
    }

    return {
      matched: false,
      vendor: null,
      confidence: Math.round(highestScore * 100) / 100,
      matchType: 'UNMATCHED'
    };
  }

  /**
   * Token Sort Similarity Ratio (0.0 to 1.0)
   */
  calculateTokenSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    const tokens1 = str1.split(/\s+/).sort().join(' ');
    const tokens2 = str2.split(/\s+/).sort().join(' ');

    const lev = this.levenshteinDistance(tokens1, tokens2);
    const maxLen = Math.max(tokens1.length, tokens2.length);
    if (maxLen === 0) return 1.0;
    return Math.max(0, 1 - (lev / maxLen));
  }

  /**
   * Classic Levenshtein Distance Matrix Calculation
   */
  levenshteinDistance(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],     // deletion
            dp[i][j - 1],     // insertion
            dp[i - 1][j - 1]  // substitution
          );
        }
      }
    }
    return dp[m][n];
  }

  sanitizeString(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getAllVendors() {
    return this.vendorMaster;
  }
}
