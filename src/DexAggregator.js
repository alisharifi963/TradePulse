import { ethers } from "ethers";

function getRpcUrl(network) {
  const infuraKey =
    import.meta?.env?.VITE_INFURA_API_KEY || process.env.INFURA_API_KEY || "";
  switch (network) {
    case "ethereum":
      return infuraKey
        ? `https://mainnet.infura.io/v3/${infuraKey}`
        : "https://cloudflare-eth.com";
    case "arbitrum":
      return "https://arb1.arbitrum.io/rpc";
    case "base":
      return "https://mainnet.base.org";
    case "bnb":
      return "https://bsc-dataseed.binance.org/";
    default:
      throw new Error(`Unsupported network ${network}`);
  }
}

function getProvider(network) {
  return new ethers.providers.JsonRpcProvider(getRpcUrl(network));
}

// آدرس قراردادهای Quoter
const quoterAddresses = {
  uniswap: {
    base: "0x61ffe014ba17989e743c5f6cb21bf9697530b21e",
    ethereum: "0x61ffe014ba17989e743c5f6cb21bf9697530b21e",
    arbitrum: "0x61ffe014ba17989e743c5f6cb21bf9697530b21e",
  },
  pancakeswap: {
    bnb: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
  },
};
const WETH_ADDRESSES = {
  ethereum: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  base: "0x4200000000000000000000000000000000000006",
  bnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
};

function normalizeTokenAddress(network, address) {
  const ETH_PLACEHOLDER = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  if (address.toLowerCase() === ETH_PLACEHOLDER.toLowerCase()) {
    return WETH_ADDRESSES[network];
  }
  return address;
}

const QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256 amountOut)",
];

async function getUniswapRate(network, tokenIn, tokenOut, amountIn, decimalsTo) {
  if (!["base", "ethereum", "arbitrum"].includes(network)) return null;
  const provider = getProvider(network);
  const quoterAddress = quoterAddresses.uniswap[network];
  if (!quoterAddress || quoterAddress.length !== 42) {
    throw new Error(`Uniswap quoter address invalid for ${network}`);
  }
  const quoterContract = new ethers.Contract(quoterAddress, QUOTER_ABI, provider);
  const fee = 3000; // 0.3%
  const inAddr = normalizeTokenAddress(network, tokenIn);
  const outAddr = normalizeTokenAddress(network, tokenOut);
  try {
    const amountOut = await quoterContract.quoteExactInputSingle(inAddr, outAddr, fee, amountIn, 0);
    return ethers.utils.formatUnits(amountOut, decimalsTo);
  } catch (err) {
    const reason = err.reason || err.message || "Unknown";
    throw new Error(`Uniswap quote failed: ${reason}`);
  }

async function getPancakeSwapRate(network, tokenIn, tokenOut, amountIn, decimalsTo) {
  if (network !== "bnb") return null;
  const provider = getProvider(network);
  const quoterAddress = quoterAddresses.pancakeswap[network];
  if (!quoterAddress || quoterAddress.length !== 42) {
    throw new Error(`PancakeSwap quoter address invalid for ${network}`);
  }
  const quoterContract = new ethers.Contract(quoterAddress, QUOTER_ABI, provider);
  const fee = 2500; // 0.25%
  const inAddr = normalizeTokenAddress(network, tokenIn);
  const outAddr = normalizeTokenAddress(network, tokenOut);
  try {
    const amountOut = await quoterContract.quoteExactInputSingle(inAddr, outAddr, fee, amountIn, 0);
    return ethers.utils.formatUnits(amountOut, decimalsTo);
  } catch (err) {
    const reason = err.reason || err.message || "Unknown";
    throw new Error(`Uniswap quote failed: ${reason}`);
  }

async function getCurveRate(network, tokenIn, tokenOut, amountIn, decimalsTo) {
  if (!["base", "ethereum", "arbitrum"].includes(network)) return null;
  const CURVE_POOL_ABI = [
    "function get_dy(int128 i, int128 j, uint256 dx) external view returns (uint256 dy)",
  ];
  const provider = getProvider(network);
  const poolAddress =
    network === "ethereum"
    ? "0x960ea3e3c7fb317332d990873d354e18d7645590" // ETH/USDC 2pool
      : network === "arbitrum"
      ? "0x7f90122bf0700f9e7e1f688fe926940e8839f353" // USDC/USDT 2pool
      : "0";
  if (!poolAddress || poolAddress.length !== 42 || poolAddress === "0") {
    throw new Error(`Curve pool address invalid for ${network}`);
  }
  const poolContract = new ethers.Contract(poolAddress, CURVE_POOL_ABI, provider);
  try {
    const amountOut = await poolContract.get_dy(0, 1, amountIn);
    return ethers.utils.formatUnits(amountOut, decimalsTo);
  } catch (err) {
    const reason = err.reason || err.message || "Unknown";
    throw new Error(`Curve quote failed: ${reason}`);
  }
}

export async function findBestRate(network, tokenIn, tokenOut, amountIn, decimalsTo) {
  const rates = [];
  const errors = [];

await Promise.all([
    (async () => {
      try {
        const r = await getUniswapRate(network, tokenIn, tokenOut, amountIn, decimalsTo);
        if (r) rates.push({ dex: "Uniswap", amountOut: r });
      } catch (err) {
        errors.push(err.message);
        console.error(err.message);
      }
    })(),
    (async () => {
      try {
        const r = await getPancakeSwapRate(network, tokenIn, tokenOut, amountIn, decimalsTo);
        if (r) rates.push({ dex: "PancakeSwap", amountOut: r });
      } catch (err) {
        errors.push(err.message);
        console.error(err.message);
      }
    })(),
    (async () => {
      try {
        const r = await getCurveRate(network, tokenIn, tokenOut, amountIn, decimalsTo);
        if (r) rates.push({ dex: "Curve", amountOut: r });
      } catch (err) {
        errors.push(err.message);
        console.error(err.message);
      }
    })(),
  ]);
  
  if (rates.length === 0) {
const msg = errors.join(" | ") || "No rates found from any DEX";
    throw new Error(msg);
  }

  rates.sort((a, b) => Number(b.amountOut) - Number(a.amountOut));
  return rates[0];
}
