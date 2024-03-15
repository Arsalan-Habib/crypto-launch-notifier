import { Address } from "viem";
import { Chain, bsc, goerli, mainnet, polygon, polygonMumbai, sepolia } from "viem/chains";

export type ICHAINS = {
  [chainId: number]: {
    chain: Chain;
    name: string;
    shortName: string;
    chainId: number;
    rpcUrl: string;
    blockExplorerUrls: string[];
    api: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    factoryAddress: Address;
    wethAddress: Address;
  };
};

export const CHAINS: ICHAINS = {
  56: {
    chain: bsc,
    name: "Binance Smart Chain",
    shortName: "BSC",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorerUrls: ["https://bscscan.com/"],
    api: "https://api.bscscan.com/api",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    factoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  1: {
    chain: mainnet,
    name: "Ethereum",
    chainId: 1,
    shortName: "ETH",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/qxq5obMQ42JA1gka2p69MQ-4Ds4XvLgL",
    blockExplorerUrls: ["https://etherscan.io/"],
    api: "https://api.etherscan.io/api",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    factoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    // usdc:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  },
  137: {
    chain: polygon,
    name: "Polygon",
    shortName: "MATIC",
    chainId: 137,
    rpcUrl: "https://rpc-mainnet.maticvigil.com/",
    blockExplorerUrls: ["https://polygonscan.com/"],
    api: "https://api-testnet.polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    factoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  80001: {
    chain: polygonMumbai,
    name: "Mumbai",
    shortName: "MATIC",
    chainId: 80001,
    // rpcUrl: "https://polygon-mumbai.g.alchemy.com/v2/demo",
    rpcUrl: "https://polygon-mumbai.infura.io/v3/c9296719995042d6adafefe11c6798a2",
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    api: "https://api-testnet.polygonscan.com/api",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    factoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  11155111: {
    chain: sepolia,
    name: "Sepolia",
    shortName: "SEPOLIA",
    chainId: 11155111,
    // rpcUrl: "https://rpc.sepolia.org/",
    rpcUrl: "https://sepolia.infura.io/v3/b89c101e45944350bf6115c768dd1c1a",
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
    api: "https://api-sepolia.etherscan.io/api",
    nativeCurrency: {
      name: "SEPOLIA",
      symbol: "SEPOLIA",
      decimals: 18,
    },
    factoryAddress: "0x",
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  5: {
    chain: goerli,
    name: "Goerli",
    shortName: "GOERLI",
    chainId: 5,
    rpcUrl: "https://goerli.infura.io/v3/832efcccfe9c457eb255d893f2eab5b0",
    blockExplorerUrls: ["https://goerli.etherscan.io/"],
    api: "https://api-goerli.etherscan.io/api",
    nativeCurrency: {
      name: "GOERLI",
      symbol: "GOERLI",
      decimals: 18,
    },
    factoryAddress: "0x",
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
};

export const defaultChain = CHAINS[1];
