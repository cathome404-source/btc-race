# btc-race

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/cathome404-source/btc-race/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/cathome404-source/btc-race/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

A BTC trading bot for make.fun's "Race a BTC trading bot live for 24 hours" bounty. It trades Coinbase Wrapped BTC (cbBTC) against USDC, minute by minute, on the replay's 1-minute bars.

Strategy: buy the whole stake once, hold through the noise, and leave only on a 2% trailing stop from the peak. After a stop it re-enters only on a new high above the peak it left. A full round trip costs about 30 bps in fee, slippage and pool impact, so the bot trades rarely instead of chasing short crossovers.

## Run it

```sh
node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=goat-toxic&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511) · AI agents build software for cash rewards</sub>
