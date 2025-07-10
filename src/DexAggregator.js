import { ethers } from "ethers"; 

// RPCهای شبکه‌ها
const providers = {
  base: new ethers.providers.JsonRpcProvider("https://mainnet.base.org"),
  ethereum: new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`),
  arbitrum: new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc"),
  bnb: new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/"),
};

// آدرس قراردادهای Quoter
const quoterAddresses = {
  uniswap: {
    base: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76",
    ethereum: "0x61fFE014bA17989E743c5F6cB21bF9697530B21",
    arbitrum: "0x1F8c9623aD0C2e63cDBeC0EeBEd2BaF54d2dA3D",
  },
  pancakeswap: {
    bnb: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
  },
};

const QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256 amountOut)",
];

async function getUniswapRate(network, tokenIn, tokenOut, amountIn, decimalsTo) {
  if (!["base", "ethereum", "arbitrum"].includes(network)) return null;
  const provider = providers[network];
  const quoterContract = new ethers.Contract(quoterAddresses.uniswap[network], QUOTER_ABI, provider);
  const fee = 3000; // 0.3%
  try {
    const amountOut = await quoterContract.quoteExactInputSingle(tokenIn, tokenOut, fee, amountIn, 0);
    return ethers.utils.formatUnits(amountOut, decimalsTo);
  } catch (error) {
    console.error(`Uniswap Rate Error on ${network}:`, error.message);
    return null;
  }
}

async function getPancakeSwapRate(network, tokenIn, tokenOut, amountIn, decimalsTo) {
  if (network !== "bnb") return null;
  const provider = providers[network];
  const quoterContract = new ethers.Contract(quoterAddresses.pancakeswap[network], QUOTER_ABI, provider);
  const fee = 2500; // 0.25%
  try {
    const amountOut = await quoterContract.quoteExactInputSingle(tokenIn, tokenOut, fee, amountIn, 0);
    return ethers.utils.formatUnits(amountOut, decimalsTo);
  } catch (error) {
    console.error(`PancakeSwap Rate Error on ${network}:`, error.message);
    return null;
  }
}

async function getCurveRate(network, tokenIn, tokenOut, amountIn, decimalsTo) {
  if (!["base", "ethereum", "arbitrum"].includes(network)) return null;
  const CURVE_POOL_ABI = [
    "function get_dy(int128 i, int128 j, uint256 dx) external view returns (uint256 dy)",
  ];
  const provider = providers[network];
  const poolAddress =
    network === "ethereum"
      ? "0x960ea3e3C7FB317332d990873d354E18d764559"
      : "0xC9B8a3FDECB9D5a63354D2262Ee2e2e2e2e2e2e";
  const poolContract = new ethers.Contract(poolAddress, CURVE_POOL_ABI, provider);
  try {
    const amountOut = await poolContract.get_dy(0, 1, amountIn);
    return ethers.utils.formatUnits(amountOut, decimalsTo);
  } catch (error) {
    console.error(`Curve Rate Error on ${network}:`, error.message);
    return null;
  }
}

export async function findBestRate(network, tokenIn, tokenOut, amountIn, decimalsTo) {
  const rates = [];

  const uniswapRate = await getUniswapRate(network, tokenIn, tokenOut, amountIn, decimalsTo);
  if (uniswapRate) rates.push({ dex: "Uniswap", amountOut: uniswapRate });

  const pancakeRate = await getPancakeSwapRate(network, tokenIn, tokenOut, amountIn, decimalsTo);
  if (pancakeRate) rates.push({ dex: "PancakeSwap", amountOut: pancakeRate });

  const curveRate = await getCurveRate(network, tokenIn, tokenOut, amountIn, decimalsTo);
  if (curveRate) rates.push({ dex: "Curve", amountOut: curveRate });

  if (rates.length === 0) {
    throw new Error("No rates found from any DEX");
  }

  rates.sort((a, b) => Number(b.amountOut) - Number(a.amountOut));
  return rates[0];
}
