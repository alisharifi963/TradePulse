# TradePulse

This project provides a simple interface to compare swap rates across several DEX protocols. The main logic lives in `src/DexAggregator.js`.

## Supported networks
- Ethereum
- Arbitrum
- Base
- BNB Chain

Token addresses for each network are defined in `src/Swap.jsx`. You can adjust them to enable or disable particular token pairs.

## Testing rate queries
1. Install dependencies with `npm install` or `pnpm install`.
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open the app in your browser and choose your network and token pair.
4. The best rate will be fetched automatically and displayed in the UI.

If a token is not supported by a DEX on a given network you may see an error message in the app. Token addresses can be updated under the `tokenAddresses` constant in `src/Swap.jsx`.
