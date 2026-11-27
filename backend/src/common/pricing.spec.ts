import type { CatalogProduct, StoreSettings } from './catalog.types.js';
import { deliveryZone, priceCart } from './pricing.js';

const settings: StoreSettings = { gstPct: 18, offerPct: 50, deliveryPerPiece: 500, freePincodePrefixes: ['110'] };

const royale = {
  id: 'p1',
  slug: 'royale-series',
  name: 'Royale Series',
  cover: '/royale.webp',
  sizes: ['72 x 30', '72 x 36'],
  priceRows: [{ model: 'Royale', thickness: 4, prices: [7500, null] }],
  comfortOptions: ['Softy-Puff'],
  colours: [{ name: 'Grey', hex: '#888888' }],
  offerPct: 50,
} as CatalogProduct;

const line = { slug: 'royale-series', model: 'Royale', thickness: 4, size: '72 x 30', colour: 'Grey', qty: 2 };

describe('priceCart', () => {
  it('applies the offer, coupon, delivery outside Delhi and GST', () => {
    const cart = priceCart([royale], settings, [line], { code: 'WELCOME5', percent: 5 }, '122001');
    expect(cart.lines[0].unitPrice).toBe(3750);
    expect(cart).toMatchObject({ subtotal: 7500, discount: 375, shipping: 1000, gst: 1463, total: 9588, zone: 'outside' });
  });

  it('delivers free in Delhi', () => {
    const cart = priceCart([royale], settings, [line], undefined, '110043');
    expect(cart).toMatchObject({ shipping: 0, gst: 1350, total: 8850, zone: 'delhi' });
  });

  it('drops unknown products, sizes with no price and colours not offered', () => {
    const lines = [
      { ...line, slug: 'nope' },
      { ...line, size: '72 x 36' },
      { ...line, colour: 'Pink' },
    ];
    expect(priceCart([royale], settings, lines).lines).toHaveLength(0);
  });

  it('flags a mattress line without a colour', () => {
    expect(priceCart([royale], settings, [{ ...line, colour: undefined }]).lines[0].needsColour).toBe(true);
  });

  it('caps the quantity at 20', () => {
    expect(priceCart([royale], settings, [{ ...line, qty: 99 }]).lines[0].qty).toBe(20);
  });
});

describe('deliveryZone', () => {
  it.each([
    ['110043', 'delhi'],
    ['400001', 'outside'],
    ['1100', 'unknown'],
    [undefined, 'unknown'],
  ])('%s → %s', (pin, zone) => expect(deliveryZone(settings, pin)).toBe(zone));
});
