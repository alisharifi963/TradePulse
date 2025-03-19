import { motion } from "framer-motion";
import { ChevronDown, X, HeartPulse, ArrowLeftRight, Wallet, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { ethers } from "ethers";

// آدرس‌های قرارداد صرافی‌ها برای هر شبکه
const EXCHANGE_ROUTERS = {
  uniswap: {
    1: ethers.getAddress("0xE592427A0AEce92De3Edee1F18E0157C05861564"), // اتریوم
    42161: ethers.getAddress("0xE592427A0AEce92De3Edee1F18E0157C05861564"), // آربیتروم
    8453: ethers.getAddress("0x2626664c2603E547cE16bd5fF32a7028897935e"), // بیس
  },
  sushiswap: {
    1: ethers.getAddress("0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"), // اتریوم
    42161: ethers.getAddress("0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"), // آربیتروم
    8453: ethers.getAddress("0x8c3085D9a440EBeC94fAca430D5D2A2c49d5d48"), // بیس
  },
  curve: {
    1: ethers.getAddress("0x99a58482BD75cbab83b27EC03CA68fF489b5788"), // اتریوم (Curve 3Pool)
    42161: ethers.getAddress("0x960ea3e3C7FB317332d990873d354E18d764559"), // آربیتروم (Curve 2Pool)
    8453: null, // فعلاً Curve روی بیس پشتیبانی نمی‌شه
  },
};

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

const UNISWAP_V3_ABI = [
  "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
];

const SUSHISWAP_V2_ABI = [
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)"
];

const CURVE_ABI = [
  "function exchange(int128 i, int128 j, uint256 dx, uint256 min_dy) external returns (uint256)"
];

// آدرس‌های توکن‌ها برای هر شبکه
const tokenAddressesByNetwork = {
  1: { // اتریوم
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
    UNI: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    LINK: "0x514910771af9ca656af840dff83e8264ecf986ca",
  },
  42161: { // آربیتروم
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    UNI: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    GMX: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  },
  8453: { // بیس
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USDT: "0xfde4C96c8593536E31F229EA8f63b2ADa7699bb",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    WBTC: "0xBBeB516fb02a01611cbD2175504913A516F81b2",
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  },
};

// تعداد اعشار توکن‌ها
const tokenDecimals = {
  ETH: 18,
  USDT: 6,
  USDC: 6,
  WBTC: 8,
  DAI: 18,
  UNI: 18,
  LINK: 18,
  ARB: 18,
  WETH: 18,
  GMX: 18,
};

// تنظیمات شبکه‌ها
const networkDetails = {
  1: {
    chainName: "Ethereum Mainnet",
    rpcUrls: ["https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID"],
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://etherscan.io"],
  },
  42161: {
    chainName: "Arbitrum One",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  8453: {
    chainName: "Base",
    rpcUrls: ["https://mainnet.base.org"],
    nativeCurrency: { symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://basescan.org"],
  },
};

const tokensByNetwork = {
  1: ["ETH", "USDT", "USDC", "WBTC", "DAI", "UNI", "LINK"],
  42161: ["ETH", "USDC", "DAI", "WBTC", "ARB", "UNI", "LINK", "WETH", "GMX", "USDT"],
  8453: ["ETH", "USDT", "USDC", "WBTC", "DAI"],
};

const apiUrl = "https://apiv5.paraswap.io";

const switchNetwork = async (provider, chainId) => {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [networkDetails[chainId]],
      });
    } else {
      throw error;
    }
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function Swap() {
  const abortController = new AbortController();

  const [tokenFrom, setTokenFrom] = useState("USDC");
  const [tokenTo, setTokenTo] = useState("ETH");
  const [amountFrom, setAmountFrom] = useState("5");
  const [amountTo, setAmountTo] = useState("");
  const [bestDex, setBestDex] = useState("Fetching...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectingFrom, setIsSelectingFrom] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [priceRoute, setPriceRoute] = useState(null);
  const [isPriceRouteReady, setIsPriceRouteReady] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [customTokens, setCustomTokens] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [usdEquivalent, setUsdEquivalent] = useState("");
  const [tokenFromBalance, setTokenFromBalance] = useState("0");
  const [tokenToBalance, setTokenToBalance] = useState("0");
  const [gasEstimate, setGasEstimate] = useState(null);
  const [swapNotification, setSwapNotification] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(42161); // شبکه پیش‌فرض: آربیتروم
  const [currentNetworkName, setCurrentNetworkName] = useState("Arbitrum");

  const fetchTokenBalance = async (tokenSymbol, userAddress) => {
    if (!userAddress || !provider) return "0";
    try {
      const tokenAddress = tokenAddressesByNetwork[currentNetwork][tokenSymbol];
      let balance;
      if (tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        balance = await provider.getBalance(userAddress);
      } else {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        balance = await tokenContract.balanceOf(userAddress);
      }
      return ethers.formatUnits(balance, tokenDecimals[tokenSymbol]);
    } catch (error) {
      console.error(`Error fetching balance for ${tokenSymbol}:`, error);
      return "0";
    }
  };

  useEffect(() => {
    const updateBalances = async () => {
      if (isConnected && address && provider) {
        const fromBalance = await fetchTokenBalance(tokenFrom, address);
        const toBalance = await fetchTokenBalance(tokenTo, address);
        setTokenFromBalance(fromBalance);
        setTokenToBalance(toBalance);
      }
    };
    updateBalances();
  }, [isConnected, address, provider, tokenFrom, tokenTo, currentNetwork]);

  useEffect(() => {
    if (amountFrom && Number(amountFrom) > 0 && tokenFrom && tokenTo && tokenFrom !== tokenTo) {
      fetchBestRate();
    } else if (amountFrom && Number(amountFrom) <= 0) {
      setAmountTo("");
      setBestDex("Enter a valid amount greater than 0");
      setPriceRoute(null);
      setIsPriceRouteReady(false);
      setUsdEquivalent("");
    }
  }, [amountFrom, tokenFrom, tokenTo, currentNetwork]);

  const fetchBestRate = async () => {
    try {
      setIsPriceRouteReady(false);
      const amountFromInWei = ethers.parseUnits(amountFrom || "0", tokenDecimals[tokenFrom]);
      if (Number(amountFrom) <= 0) {
        setAmountTo("");
        setBestDex("Enter a valid amount greater than 0");
        setPriceRoute(null);
        setUsdEquivalent("");
        return;
      }

      const response = await fetch(
        `${apiUrl}/prices?srcToken=${tokenAddressesByNetwork[currentNetwork][tokenFrom]}&destToken=${tokenAddressesByNetwork[currentNetwork][tokenTo]}&amount=${amountFromInWei.toString()}&srcDecimals=${tokenDecimals[tokenFrom]}&destDecimals=${tokenDecimals[tokenTo]}&side=SELL&network=${currentNetwork}`,
        { signal: abortController.signal }
      );

      if (!response.ok) {
        const errorText = await response.text();
        const parsedError = JSON.parse(errorText);
        if (parsedError.error === "ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT") {
          setAmountTo("0.000000");
          setBestDex("Price Impact Too High");
          setPriceRoute(null);
          setUsdEquivalent("");
          setSwapNotification({ message: "Price impact too high! Reduce the amount.", isSuccess: false });
          setTimeout(() => setSwapNotification(null), 3000);
          return;
        }
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.priceRoute) {
        setPriceRoute(data.priceRoute);
        const rawDestAmount = data.priceRoute.destAmount;
        const formattedAmountTo = ethers.formatUnits(rawDestAmount, tokenDecimals[tokenTo]);
        setAmountTo(formattedAmountTo);
        setBestDex(data.priceRoute.bestRoute[0]?.swaps[0]?.swapExchanges[0]?.exchange || "ParaSwap");
        setIsPriceRouteReady(true);

        let usdValue;
        if (tokenFrom === "USDC") {
          usdValue = Number(amountFrom).toFixed(2);
        } else {
          const srcUSD = data.priceRoute.srcUSD || 1;
          const srcAmount = Number(ethers.formatUnits(amountFromInWei, tokenDecimals[tokenFrom]));
          usdValue = (srcAmount * srcUSD).toFixed(2);
        }
        setUsdEquivalent(`≈ $${usdValue} USD`);
      } else {
        setAmountTo("0.000000");
        setBestDex("No route found");
        setPriceRoute(null);
        setUsdEquivalent("N/A");
      }
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Error fetching rate:", error);
      setAmountTo("");
      setBestDex("Error fetching rate");
      setPriceRoute(null);
      setUsdEquivalent("N/A");
      setSwapNotification({ message: `Error fetching rate: ${error.message}`, isSuccess: false });
      setTimeout(() => setSwapNotification(null), 3000);
    }
  };

  const estimateGas = async (txParams) => {
    if (signer) {
      try {
        const gas = await signer.estimateGas(txParams);
        const gasInWei = ethers.toBigInt(gas.toString());
        const gasInEth = ethers.formatEther(gasInWei);
        const gasInGwei = ethers.formatUnits(gasInWei, "gwei");

        const ethPriceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const ethPriceData = await ethPriceResponse.json();
        const ethPriceInUSD = ethPriceData.ethereum.usd || 1000;
        const gasCostInUSD = (Number(gasInEth) * ethPriceInUSD).toFixed(2);

        setGasEstimate({ gwei: gasInGwei, usd: gasCostInUSD });
      } catch (error) {
        console.error("Error estimating gas:", error);
        setGasEstimate({ gwei: "Unable to estimate", usd: "N/A" });
        setErrorMessage(`Gas estimation failed: ${error.message}`);
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
      }
    }
  };

  useEffect(() => {
    if (isPriceRouteReady) {
      const srcTokenAddress = tokenAddressesByNetwork[currentNetwork][tokenFrom];
      const destTokenAddress = tokenAddressesByNetwork[currentNetwork][tokenTo];
      const amountIn = ethers.parseUnits(amountFrom, tokenDecimals[tokenFrom]);
      const amountOutMin = ethers.parseUnits(amountTo, tokenDecimals[tokenTo]).mul(99).div(100); // 1% slippage tolerance

      let txParams;
      const dex = bestDex.toLowerCase();

      if (dex.includes("uniswap")) {
        const params = {
          tokenIn: srcTokenAddress,
          tokenOut: destTokenAddress,
          fee: 3000, // کارمزد 0.3%
          recipient: address,
          deadline: Math.floor(Date.now() / 1000) + 60 * 20,
          amountIn: amountIn,
          amountOutMinimum: amountOutMin,
          sqrtPriceLimitX96: 0,
        };
        const data = new ethers.Interface(UNISWAP_V3_ABI).encodeFunctionData("exactInputSingle", [params]);
        txParams = {
          to: EXCHANGE_ROUTERS.uniswap[currentNetwork],
          data: data,
          value: srcTokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? amountIn : 0,
        };
      } else if (dex.includes("sushiswap")) {
        const path = [srcTokenAddress, destTokenAddress];
        const params = [
          amountIn,
          amountOutMin,
          path,
          address,
          Math.floor(Date.now() / 1000) + 60 * 20,
        ];
        const data = new ethers.Interface(SUSHISWAP_V2_ABI).encodeFunctionData("swapExactTokensForTokens", params);
        txParams = {
          to: EXCHANGE_ROUTERS.sushiswap[currentNetwork],
          data: data,
          value: 0, // SushiSwap از ETH مستقیم پشتیبانی نمی‌کنه، باید WETH استفاده بشه
        };
      } else if (dex.includes("curve") && EXCHANGE_ROUTERS.curve[currentNetwork]) {
        // برای Curve، باید i و j (اندیس توکن‌ها توی pool) رو مشخص کنیم
        // این فقط یه مثال ساده‌ست، توی عمل باید pool و اندیس‌ها رو دقیق‌تر مشخص کنیم
        const i = tokenFrom === "USDC" ? 1 : 0; // فرض: USDC اندیس 1
        const j = tokenTo === "DAI" ? 0 : 1; // فرض: DAI اندیس 0
        const params = [i, j, amountIn, amountOutMin];
        const data = new ethers.Interface(CURVE_ABI).encodeFunctionData("exchange", params);
        txParams = {
          to: EXCHANGE_ROUTERS.curve[currentNetwork],
          data: data,
          value: 0,
        };
      } else {
        setErrorMessage(`Unsupported DEX: ${bestDex}`);
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
        return;
      }

      estimateGas(txParams);
    }
  }, [isPriceRouteReady, currentNetwork, bestDex]);

  const checkAndApproveToken = async (spender) => {
    const srcTokenAddress = tokenAddressesByNetwork[currentNetwork][tokenFrom];
    if (!srcTokenAddress || srcTokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      console.log("No approval needed for ETH.");
      return true;
    }

    try {
      const tokenContract = new ethers.Contract(srcTokenAddress, ERC20_ABI, signer);
      const amountBN = ethers.parseUnits(amountFrom, tokenDecimals[tokenFrom]);

      const network = await provider.getNetwork();
      if (Number(network.chainId) !== currentNetwork) await switchNetwork(window.ethereum, currentNetwork);

      let allowance = await tokenContract.allowance(address, spender);
      let allowanceBN = ethers.toBigInt(allowance.toString());

      if (allowanceBN < amountBN) {
        const tx = await tokenContract.approve(spender, amountBN);
        await tx.wait();
        await delay(10000);
        allowance = await tokenContract.allowance(address, spender);
        allowanceBN = ethers.toBigInt(allowance.toString());
        if (allowanceBN < amountBN) throw new Error("Allowance insufficient after approval!");
      }
      return true;
    } catch (error) {
      console.error("Approval failed:", error);
      setErrorMessage(`Token approval failed: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      throw error;
    }
  };

  const handleSwap = async () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first!");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      return;
    }

    if (!amountFrom || Number(amountFrom) <= 0) {
      setErrorMessage("Please enter a valid amount to swap!");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      return;
    }

    if (!isPriceRouteReady) {
      setErrorMessage("Price route not ready. Please wait or try again.");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      return;
    }

    setIsSwapping(true);
    try {
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== currentNetwork) await switchNetwork(window.ethereum, currentNetwork);

      const srcTokenAddress = tokenAddressesByNetwork[currentNetwork][tokenFrom];
      const destTokenAddress = tokenAddressesByNetwork[currentNetwork][tokenTo];
      const amountIn = ethers.parseUnits(amountFrom, tokenDecimals[tokenFrom]);
      const amountOutMin = ethers.parseUnits(amountTo, tokenDecimals[tokenTo]).mul(99).div(100);

      const dex = bestDex.toLowerCase();
      let tx;

      if (dex.includes("uniswap")) {
        const params = {
          tokenIn: srcTokenAddress,
          tokenOut: destTokenAddress,
          fee: 3000,
          recipient: address,
          deadline: Math.floor(Date.now() / 1000) + 60 * 20,
          amountIn: amountIn,
          amountOutMinimum: amountOutMin,
          sqrtPriceLimitX96: 0,
        };
        await checkAndApproveToken(EXCHANGE_ROUTERS.uniswap[currentNetwork]);
        const uniswapContract = new ethers.Contract(EXCHANGE_ROUTERS.uniswap[currentNetwork], UNISWAP_V3_ABI, signer);
        tx = await uniswapContract.exactInputSingle(params, {
          value: srcTokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? amountIn : 0,
          gasLimit: 500000,
        });
      } else if (dex.includes("sushiswap")) {
        const path = [srcTokenAddress, destTokenAddress];
        const params = [
          amountIn,
          amountOutMin,
          path,
          address,
          Math.floor(Date.now() / 1000) + 60 * 20,
        ];
        await checkAndApproveToken(EXCHANGE_ROUTERS.sushiswap[currentNetwork]);
        const sushiswapContract = new ethers.Contract(EXCHANGE_ROUTERS.sushiswap[currentNetwork], SUSHISWAP_V2_ABI, signer);
        tx = await sushiswapContract.swapExactTokensForTokens(...params, {
          gasLimit: 500000,
        });
      } else if (dex.includes("curve") && EXCHANGE_ROUTERS.curve[currentNetwork]) {
        const i = tokenFrom === "USDC" ? 1 : 0; // فرض: USDC اندیس 1
        const j = tokenTo === "DAI" ? 0 : 1; // فرض: DAI اندیس 0
        const params = [i, j, amountIn, amountOutMin];
        await checkAndApproveToken(EXCHANGE_ROUTERS.curve[currentNetwork]);
        const curveContract = new ethers.Contract(EXCHANGE_ROUTERS.curve[currentNetwork], CURVE_ABI, signer);
        tx = await curveContract.exchange(...params, {
          gasLimit: 500000,
        });
      } else {
        throw new Error(`Unsupported DEX: ${bestDex}`);
      }

      await tx.wait();

      setSwapNotification({ message: `Swap successful! Tx Hash: ${tx.hash}`, isSuccess: true });
      setTimeout(() => setSwapNotification(null), 5000);
    } catch (error) {
      console.error("Swap error:", error);
      setErrorMessage(`Swap failed: ${error.message}`);
      setSwapNotification({ message: `Swap failed: ${error.message}`, isSuccess: false });
      setTimeout(() => setSwapNotification(null), 5000);
    } finally {
      setIsSwapping(false);
    }
  };

  const openModal = (isFrom) => {
    setIsSelectingFrom(isFrom);
    setIsModalOpen(true);
  };

  const selectToken = (token) => {
    if (isSelectingFrom) setTokenFrom(token);
    else setTokenTo(token);
    setIsModalOpen(false);
  };

  const handleConnect = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        if (!networkDetails[chainId]) {
          setErrorMessage("Unsupported network. Please switch to Ethereum, Arbitrum, or Base.");
          setIsNotificationVisible(true);
          setTimeout(() => setIsNotificationVisible(false), 3000);
          return;
        }
        setCurrentNetwork(chainId);
        setCurrentNetworkName(networkDetails[chainId].chainName);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setProvider(provider);
        setSigner(signer);
        setAddress(userAddress);
        setIsConnected(true);
      } else {
        setErrorMessage("MetaMask is not installed!");
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setErrorMessage(`Failed to connect wallet: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
    }
  };

  const disconnectWallet = () => {
    setAddress("");
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setTokenFromBalance("0");
    setTokenToBalance("0");
  };

  const searchToken = async () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first!");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
      return;
    }

    if (ethers.isAddress(customTokenAddress)) {
      try {
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== currentNetwork) {
          setErrorMessage(`Connected to wrong network. Switch to ${networkDetails[currentNetwork].chainName}.`);
          setIsNotificationVisible(true);
          setTimeout(() => setIsNotificationVisible(false), 3000);
          await switchNetwork(provider, currentNetwork);
          return;
        }

        const contract = new ethers.Contract(customTokenAddress, ERC20_ABI, provider);
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const newCustomToken = { symbol, address: customTokenAddress, decimals };
        setCustomTokens((prev) => [...prev, newCustomToken].filter((item, index, self) => index === self.findIndex((t) => t.address === item.address)));
        setTokenFrom(symbol);
      } catch (error) {
        console.error("Error fetching token:", error);
        setErrorMessage(`Failed to fetch token: ${error.message}`);
        setIsNotificationVisible(true);
        setTimeout(() => setIsNotificationVisible(false), 3000);
      }
    } else {
      setErrorMessage("Invalid contract address");
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
    }
  };

  const swapTokens = () => {
    setTokenFrom(tokenTo);
    setTokenTo(tokenFrom);
    setAmountFrom("");
    setAmountTo("");
    setBestDex("Fetching...");
    setUsdEquivalent("");
  };

  const setMaxAmountFrom = () => {
    if (tokenFromBalance && Number(tokenFromBalance) > 0) setAmountFrom(tokenFromBalance);
  };

  const handleNetworkChange = async (chainId) => {
    try {
      await switchNetwork(window.ethereum, chainId);
      setCurrentNetwork(chainId);
      setCurrentNetworkName(networkDetails[chainId].chainName);
      setTokenFrom(tokensByNetwork[chainId][0]);
      setTokenTo(tokensByNetwork[chainId][1]);
      setAmountFrom("");
      setAmountTo("");
      setBestDex("Fetching...");
    } catch (error) {
      console.error("Network switch error:", error);
      setErrorMessage(`Failed to switch network: ${error.message}`);
      setIsNotificationVisible(true);
      setTimeout(() => setIsNotificationVisible(false), 3000);
    }
  };

  const displayToken = (token) => token === "USDC" ? "USD" : token;

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <Particle />
          <ParticleBottom />
        </div>

        <Header>
          <HeaderTitle>
            <HeartIcon animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <HeartPulse size={20} />
            </HeartIcon>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>TradePulse Swap</h1>
            <BetaTag>Beta</BetaTag>
          </HeaderTitle>
          <WalletContainer>
            <NetworkSelector>
              <select
                value={currentNetwork}
                onChange={(e) => handleNetworkChange(Number(e.target.value))}
                style={{ padding: "5px", borderRadius: "5px", background: "#333", color: "white", border: "none" }}
              >
                {Object.keys(networkDetails).map((chainId) => (
                  <option key={chainId} value={chainId}>
                    {networkDetails[chainId].chainName}
                  </option>
                ))}
              </select>
            </NetworkSelector>
            <ConnectButton onClick={isConnected ? disconnectWallet : handleConnect} whileHover={{ scale: 1.05 }}>
              {isConnected ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
            </ConnectButton>
          </WalletContainer>
        </Header>

        <TrustSticker>
          <TrustText>The Dex You Can Trust</TrustText>
        </TrustSticker>

        <MainContent>
          <Card>
            <CardContent>
              <Subtitle>Swap Tokens Seamlessly</Subtitle>
              <div>
                <InputContainer>
                  <Input
                    type="number"
                    placeholder="Amount to sell"
                    value={amountFrom}
                    onChange={(e) => setAmountFrom(e.target.value || "")}
                    min="0.001"
                  />
                  <TokenButtonContainer>
                    {isConnected && <MaxButton onClick={setMaxAmountFrom}>Max</MaxButton>}
                    <TokenButton onClick={() => openModal(true)}>
                      <span>{displayToken(tokenFrom)}</span>
                      <ChevronDown size={16} />
                    </TokenButton>
                    {isConnected && (
                      <BalanceContainer>
                        <Wallet size={14} />
                        <span>{parseFloat(tokenFromBalance).toFixed(4)}</span>
                      </BalanceContainer>
                    )}
                  </TokenButtonContainer>
                </InputContainer>
                <UsdEquivalent>{usdEquivalent}</UsdEquivalent>

                <SwapTokensContainer>
                  <SwapTokensButton onClick={swapTokens} whileHover={{ scale: 1.05 }}>
                    <ArrowLeftRight size={24} />
                  </SwapTokensButton>
                </SwapTokensContainer>

                <InputContainer>
                  <Input
                    type="number"
                    placeholder="Amount to buy"
                    value={amountTo}
                    readOnly
                  />
                  <TokenButtonContainer>
                    <TokenButton onClick={() => openModal(false)}>
                      <span>{displayToken(tokenTo)}</span>
                      <ChevronDown size={16} />
                    </TokenButton>
                    {isConnected && (
                      <BalanceContainer>
                        <Wallet size={14} />
                        <span>{parseFloat(tokenToBalance).toFixed(4)}</span>
                      </BalanceContainer>
                    )}
                  </TokenButtonContainer>
                </InputContainer>
                <UsdEquivalent>{/* می‌توانید معادل USD برای tokenTo را هم اضافه کنید */}</UsdEquivalent>

                {isConnected && (
                  <InputContainer>
                    <Input
                      type="text"
                      value={customTokenAddress}
                      onChange={(e) => setCustomTokenAddress(e.target.value)}
                      placeholder="Search token by contract address"
                    />
                    <button onClick={searchToken}>Search</button>
                  </InputContainer>
                )}

                <RateInfo>Best Rate from: <span style={{ fontWeight: "600" }}>{bestDex}</span></RateInfo>
                <RateInfo>Estimated Gas: {gasEstimate ? `${gasEstimate.gwei} Gwei (~$${gasEstimate.usd} USD)` : "Calculating..."}</RateInfo>

                <SwapButton
                  onClick={handleSwap}
                  disabled={isSwapping || !amountFrom || Number(amountFrom) <= 0 || !isPriceRouteReady}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSwapping ? "Swapping..." : `Swap ${displayToken(tokenFrom)} to ${displayToken(tokenTo)}`}
                </SwapButton>
              </div>
            </CardContent>
          </Card>
        </MainContent>

        {isModalOpen && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
              <ModalHeader>
                <ModalTitle>Select Token</ModalTitle>
                <button onClick={() => setIsModalOpen(false)} style={{ color: "white" }}><X size={24} /></button>
              </ModalHeader>
              <TokenGrid>
                {tokensByNetwork[currentNetwork].map((token) => (
                  <TokenOption key={token} onClick={() => selectToken(token)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {displayToken(token)}
                  </TokenOption>
                ))}
                {customTokens.map((token) => (
                  <TokenOption key={token.address} onClick={() => selectToken(token.symbol)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {token.symbol}
                  </TokenOption>
                ))}
              </TokenGrid>
            </ModalContent>
          </ModalOverlay>
        )}

        {isNotificationVisible && (
          <Notification initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }}>
            {errorMessage}
            <CloseButton onClick={() => setIsNotificationVisible(false)}><X size={18} /></CloseButton>
          </Notification>
        )}

        <SwapAnimation isSwapping={isSwapping} hasError={!!errorMessage} />

        {swapNotification && <SwapNotification message={swapNotification.message} isSuccess={swapNotification.isSuccess} onClose={() => setSwapNotification(null)} />}

        <Footer>
          <FooterText>Powered by TradePulse | Built on {currentNetworkName} | <FooterLink href="#">Learn More</FooterLink></FooterText>
        </Footer>
      </AppContainer>
    </>
  );
}

export default Swap;

// استایل‌ها (بدون تغییر)
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }
  body {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    min-height: 100vh;
    color: white;
    overflow-x: hidden;
  }
`;

const AppContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
  position: relative;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeartIcon = styled(motion.div)`
  color: #ff6b6b;
`;

const BetaTag = styled.span`
  background: #ff6b6b;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
`;

const WalletContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NetworkSelector = styled.div`
  display: flex;
  align-items: center;
`;

const ConnectButton = styled(motion.button)`
  background: linear-gradient(90deg, #ff6b6b 0%, #ff8e53 100%);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
`;

const TrustSticker = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 2rem;
`;

const TrustText = styled.p`
  font-size: 0.9rem;
  color: #a0a0a0;
`;

const MainContent = styled.main`
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
`;

const InputContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Input = styled.input`
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  width: 100%;
  outline: none;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const TokenButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MaxButton = styled.button`
  background: #ff6b6b;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
`;

const TokenButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const BalanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: #a0a0a0;
`;

const UsdEquivalent = styled.div`
  font-size: 0.9rem;
  color: #a0a0a0;
  text-align: right;
`;

const SwapTokensContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;

const SwapTokensButton = styled(motion.button)`
  background: #ff6b6b;
  border: none;
  padding: 0.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const RateInfo = styled.div`
  font-size: 0.9rem;
  color: #a0a0a0;
  text-align: center;
`;

const SwapButton = styled(motion.button)`
  background: linear-gradient(90deg, #ff6b6b 0%, #ff8e53 100%);
  border: none;
  padding: 1rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;

  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled(motion.div)`
  background: #1a1a2e;
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
`;

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
`;

const TokenOption = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
`;

const Notification = styled(motion.div)`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff6b6b;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
`;

const SwapAnimation = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  display: ${(props) => (props.isSwapping ? "block" : "none")};
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SwapNotification = styled(motion.div)`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${(props) => (props.isSuccess ? "#28a745" : "#ff6b6b")};
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const Footer = styled.footer`
  text-align: center;
  margin-top: 2rem;
  color: #a0a0a0;
  font-size: 0.9rem;
`;

const FooterText = styled.p`
  opacity: 0.7;
`;

const FooterLink = styled.a`
  color: #ff6b6b;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Particle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://www.transparenttextures.com/patterns/stardust.png');
  opacity: 0.05;
`;

const ParticleBottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(to top, rgba(255, 107, 107, 0.1), transparent);
`;
