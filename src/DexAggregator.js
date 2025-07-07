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
    base: "0x61ffe014ba17989e743c5f6cb21bf9697530b21e",
    ethereum: "0x61ffe014ba17989e743c5f6cb21bf9697530b21e",
    arbitrum: "0x61ffe014ba17989e743c5f6cb21bf9697530b21e",
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
  const quoterAddress = quoterAddresses.uniswap[network];
  if (!quoterAddress || quoterAddress.length !== 42) {
    console.error(`Uniswap quoter address invalid for ${network}`);
    return null;
  }
  const quoterContract = new ethers.Contract(quoterAddress, QUOTER_ABI, provider);
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
  const quoterAddress = quoterAddresses.pancakeswap[network];
  if (!quoterAddress || quoterAddress.length !== 42) {
    console.error(`PancakeSwap quoter address invalid for ${network}`);
    return null;
  }
  const quoterContract = new ethers.Contract(quoterAddress, QUOTER_ABI, provider);
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
    ? "0x960ea3e3c7fb317332d990873d354e18d7645590"
      : "0xc9b8a3fdecb9d5a63354d2262ee2e2e2e2e2e2e0";
  if (!poolAddress || poolAddress.length !== 42) {
    console.error(`Curve pool address invalid for ${network}`);
    return null;
  }
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
