import test from 'node:test';
import assert from 'node:assert';
import { EInvoiceParser } from '../../src/ingestion/eInvoiceParser.js';

test('EInvoiceParser - Valid UBL 2.1 XML Ingestion', () => {
  const parser = new EInvoiceParser();

  const ublXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <ID>UBL-90021</ID>
  <IssueDate>2026-08-24</IssueDate>
  <DueDate>2026-09-24</DueDate>
  <DocumentCurrencyCode>EUR</DocumentCurrencyCode>
  <AccountingSupplierParty>
    <Party>
      <RegistrationName>European Logistics SAS</RegistrationName>
      <CompanyID>FR-88991122</CompanyID>
    </Party>
  </AccountingSupplierParty>
  <AccountingCustomerParty>
    <Party>
      <RegistrationName>Global Operations GmbH</RegistrationName>
    </Party>
  </AccountingCustomerParty>
  <InvoiceLine>
    <ID>1</ID>
    <InvoicedQuantity>5</InvoicedQuantity>
    <LineExtensionAmount>500.00</LineExtensionAmount>
    <Item>
      <Name>Pallet Shipping Air Freight</Name>
    </Item>
    <Price>
      <PriceAmount>100.00</PriceAmount>
    </Price>
  </InvoiceLine>
  <LegalMonetaryTotal>
    <LineExtensionAmount>500.00</LineExtensionAmount>
    <TaxExclusiveAmount>500.00</TaxExclusiveAmount>
    <TaxInclusiveAmount>600.00</TaxInclusiveAmount>
    <TaxAmount>100.00</TaxAmount>
    <PayableAmount>600.00</PayableAmount>
  </LegalMonetaryTotal>
</Invoice>`;

  assert.strictEqual(parser.isEInvoice(ublXml), true);

  const parsed = parser.parseEInvoice(ublXml, 'doc_ubl_01');
  assert.strictEqual(parsed.invoiceNumber.value, 'UBL-90021');
  assert.strictEqual(parsed.invoiceDate.value, '2026-08-24');
  assert.strictEqual(parsed.currency, 'EUR');
  assert.strictEqual(parsed.vendorName.value, 'European Logistics SAS');
  assert.strictEqual(parsed.vendorTaxId.value, 'FR-88991122');
  assert.strictEqual(parsed.subtotal, 500.00);
  assert.strictEqual(parsed.taxAmount, 100.00);
  assert.strictEqual(parsed.totalAmount, 600.00);
  assert.strictEqual(parsed.lineItems.length, 1);
  assert.strictEqual(parsed.lineItems[0].description, 'Pallet Shipping Air Freight');
});
