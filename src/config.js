const CONFIG = {
  NETWORK: {
    chainId: 42161, // آربیتروم
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
  },

  PARASWAP: {
    apiUrl: "https://apiv5.paraswap.io",
    proxyAddress: "0x216B4B4Ba9F3e719726886d34a1774842785337C",
  },

  TOKENS: {
    ETH: {
      symbol: "ETH",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    USDC: {
      symbol: "USDC",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
    },
    DAI: {
      symbol: "DAI",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
    },
    WBTC: {
      symbol: "WBTC",
      address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      decimals: 8,
    },
    ARB: {
      symbol: "ARB",
      address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
      decimals: 18,
    },
    UNI: {
      symbol: "UNI",
      address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      decimals: 18,
    },
    LINK: {
      symbol: "LINK",
      address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      decimals: 18,
    },
    WETH: {
      symbol: "WETH",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18,
    },
    GMX: {
      symbol: "GMX",
      address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
      decimals: 18,
    },
  },
};

export default CONFIG;
