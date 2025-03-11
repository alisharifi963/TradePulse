import CONFIG from "./config";
import { ethers } from "ethers";

const apiUrl = CONFIG.PARASWAP.apiUrl;

/**
 * دریافت بهترین نرخ تبدیل بین دو توکن از ParaSwap API
 * @param {string} tokenFrom توکن مبدا
 * @param {string} tokenTo توکن مقصد
 * @param {string} amount مقدار توکن مبدا (در واحد اصلی)
 */
export const fetchBestRate = async (tokenFrom, tokenTo, amount) => {
  try {
    const srcToken = CONFIG.TOKENS[tokenFrom]?.address;
    const destToken = CONFIG.TOKENS[tokenTo]?.address;
    const srcDecimals = CONFIG.TOKENS[tokenFrom]?.decimals || 18;
    const destDecimals = CONFIG.TOKENS[tokenTo]?.decimals || 18;

    if (!srcToken || !destToken) throw new Error("Invalid token pair");

    // مقدار را به واحدهای اسمارت کانترکت تبدیل کنیم
    const amountInUnits = ethers.parseUnits(amount, srcDecimals).toString();

    const response = await fetch(
      `${apiUrl}/prices?srcToken=${srcToken}&destToken=${destToken}&amount=${amountInUnits}&srcDecimals=${srcDecimals}&destDecimals=${destDecimals}&side=SELL&network=${CONFIG.NETWORK.chainId}`
    );

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

    const data = await response.json();
    if (!data.priceRoute) throw new Error("No price route found");

    return {
      bestDex:
        data.priceRoute.bestRoute?.[0]?.swaps?.[0]?.swapExchanges?.[0]
          ?.exchange || "Unknown",
      destAmount: ethers.formatUnits(data.priceRoute.destAmount, destDecimals),
      priceRoute: data.priceRoute,
    };
  } catch (error) {
    console.error("Error fetching rate:", error);
    return { bestDex: "Error", destAmount: "0", error: error.message };
  }
};

/**
 * ساختن تراکنش برای سواپ
 * @param {string} tokenFrom توکن مبدا
 * @param {string} tokenTo توکن مقصد
 * @param {string} amount مقدار توکن مبدا
 * @param {string} userAddress آدرس کاربر
 */
export const buildSwapTransaction = async (
  tokenFrom,
  tokenTo,
  amount,
  userAddress
) => {
  try {
    const priceData = await fetchBestRate(tokenFrom, tokenTo, amount);
    if (!priceData.priceRoute) throw new Error("No price route found");

    const txData = {
      srcToken: CONFIG.TOKENS[tokenFrom]?.address,
      destToken: CONFIG.TOKENS[tokenTo]?.address,
      srcAmount: ethers
        .parseUnits(amount, CONFIG.TOKENS[tokenFrom]?.decimals)
        .toString(),
      destAmount: priceData.priceRoute.destAmount.toString(),
      priceRoute: priceData.priceRoute,
      userAddress: userAddress,
    };

    const response = await fetch(
      `${apiUrl}/transactions/${CONFIG.NETWORK.chainId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData),
      }
    );

    const responseData = await response.json();
    if (!response.ok)
      throw new Error(
        `Transaction build failed: ${responseData.error || "Unknown error"}`
      );

    return responseData;
  } catch (error) {
    console.error("Error building transaction:", error);
    return { error: error.message };
  }
};
