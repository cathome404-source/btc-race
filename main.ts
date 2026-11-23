// BTC race bot: buy-and-hold with a 2% trailing stop and new-high re-entry.
//
// Idea: cbBTC on a 1-minute chart is noisy (about 8 bps of minute-to-minute
// standard deviation) while a full round trip costs roughly 30 bps in fee,
// slippage and pool impact. Any strategy that trades on short crossovers
// whipsaws itself to death on the dev window, so this bot trades rarely:
// it buys the whole stake once, holds through the noise, and only leaves
// when the price has fallen 2% from its trailing peak. After a stop it
// stays in cash unless the price makes a new high above the peak it left,
// which is the one re-entry that cannot whipsaw on a small bounce.
//
// On the frozen dev window (a slow +3.6% rise) the stop never fires and the
// bot keeps the whole move, about +$32 on $1,000. On the same window
// reversed (a -3.6% fall) it exits near -2% and keeps about -$15 instead
// of buy-and-hold's -$38, so the downside is capped near the stop while
// the upside is left open.
//
// All arithmetic is integer (bigint) on the harness's own scales, so two
// runs on the same bars produce the same orders. No clock, no network, no
// randomness, no files outside the repository.

import { runBars, type BarsState, type Batch, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
/** 2% trailing stop: sell when the close is at or under 98% of the trailing peak. */
const STOP_NUM = 98n;
const STOP_DEN = 100n;
/** Cap the move an order tolerates past the close it was decided on. */
const MAX_SLIPPAGE_BPS = 100;

/** Highest close seen while long, in the symbol's price units (price_scale 5). */
let peak = 0n;
/** The peak the bot left on its last stop, for the new-high re-entry. 0 while long or never stopped. */
let exitPeak = 0n;
/** True once the bot has bought at least once. */
let entered = false;

await runBars({
  onBatch(state: BarsState, batch: Batch) {
    if (state.warmingUp) return [];
    const bar = batch.bars.find((b) => b.symbol === SYMBOL);
    if (bar === undefined) return [];
    const close = BigInt(bar.c);
    const held = state.positions.get(SYMBOL);
    const orders: (BuyInput | SellInput)[] = [];

    if (held !== undefined) {
      // Long: raise the peak, sell on the trailing stop.
      if (close > peak) peak = close;
      if (close * STOP_DEN <= peak * STOP_NUM) {
        exitPeak = peak;
        peak = 0n;
        orders.push({ side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS });
      }
      return orders;
    }

    // Flat.
    if (!entered) {
      // First tradable batch: buy the whole stake.
      entered = true;
      peak = close;
      const cash = state.cash;
      const room = state.weightRoom(SYMBOL);
      const stake = cash < room ? cash : room;
      if (stake >= BigInt(state.hello.fees.min_notional_quote_units)) {
        orders.push({ side: 'buy', symbol: SYMBOL, notional_quote_units: stake, max_slippage_bps: MAX_SLIPPAGE_BPS });
      }
      return orders;
    }

    // Stopped out before: re-enter only on a new high above the peak it left.
    if (exitPeak > 0n && close > exitPeak) {
      exitPeak = 0n;
      peak = close;
      const cash = state.cash;
      const room = state.weightRoom(SYMBOL);
      const stake = cash < room ? cash : room;
      if (stake >= BigInt(state.hello.fees.min_notional_quote_units)) {
        orders.push({ side: 'buy', symbol: SYMBOL, notional_quote_units: stake, max_slippage_bps: MAX_SLIPPAGE_BPS });
      }
    }
    return orders;
  },
});
