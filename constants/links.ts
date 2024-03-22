// remove any links that contain these strings
export const KEYWORDS_TO_IGNORE = [
  "eips.ethereum.org",
  "consensys",
  "solidity.readthedocs",
  "ethereum/EIPs",
  "forum.openzeppelin.com",
  "OpenZeppelin",
  "forum.zeppelin.solutions",
  "docs.soliditylang.org",
  "eth.wiki/json-rpc",
  "openzeppelin-contracts",
  "/issues",
];

export const REGEX_FOR_WEBSITE_URLS = [
  /Website:?\s*(?<links>https?:\/\/.+)\n?\s?/gim,
  /Web:?\s*(?<links>https?:\/\/.+)\n?\s?/gim,
  /Web\s*\|\s*(?<links>https?:\/\/.+)\n?\s?/gim,
  /Website\s*\|\s*(?<links>https?:\/\/.+)\n?\s?/gim,
];

// order of links to be displayed in the rendered message.
export const LINKS_ORDER = {
  Website: 0,
  X: 1,
  Telegram: 2,
  Discord: 3,
  Facebook: 4,
  Instagram: 5,
  Coingecko: 6,
  Github: 7,
  LinkedIn: 8,
  PDF: 9,
  Unknown: 10,
};
