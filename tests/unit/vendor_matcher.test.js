import test from 'node:test';
import assert from 'node:assert';
import { VendorMatcher } from '../../src/normalization/vendorMatcher.js';

test('VendorMatcher - Exact Canonical & Alias Matching', () => {
  const matcher = new VendorMatcher();

  // Exact Canonical Name
  const res1 = matcher.resolveVendor('Acme Industrial Supplies Inc.');
  assert.strictEqual(res1.matched, true);
  assert.strictEqual(res1.vendor.id, 'VEND_001');
  assert.strictEqual(res1.matchType, 'EXACT');
  assert.strictEqual(res1.confidence, 0.99);

  // Exact Alias
  const res2 = matcher.resolveVendor('pacific overland freight');
  assert.strictEqual(res2.matched, true);
  assert.strictEqual(res2.vendor.id, 'VEND_002');
  assert.strictEqual(res2.matchType, 'FUZZY_ALIAS');
});

test('VendorMatcher - Tax ID / VAT Matching', () => {
  const matcher = new VendorMatcher();
  const res = matcher.resolveVendor('Some Unknown Mislabeled OCR Text', 'US-44771122');
  assert.strictEqual(res.matched, true);
  assert.strictEqual(res.vendor.id, 'VEND_003');
  assert.strictEqual(res.matchType, 'TAX_ID');
});

test('VendorMatcher - Fuzzy Levenshtein Distance & Token Sort Matching', () => {
  const matcher = new VendorMatcher();

  // Noisy OCR OCR transposition ("Delta Precsion Machne Tolls")
  const res = matcher.resolveVendor('Delta Precsion Machne Tolls');
  assert.strictEqual(res.matched, true);
  assert.strictEqual(res.vendor.id, 'VEND_004');
  assert.ok(res.confidence >= 0.70);
});
