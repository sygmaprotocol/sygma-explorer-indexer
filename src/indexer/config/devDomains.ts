import { LocalDomainConfig } from "."

export const devDomains = new Map<number, LocalDomainConfig>([
  [
    0,
    {
      url: "https://eth-goerli.g.alchemy.com/v2/wkF4rGEBspanIYTCzspMVFbOPjHP_IhL",
      startBlock: 8981365,
    },
  ],
  [
    1,
    {
      url: "https://polygon-mumbai.g.alchemy.com/v2/LquJll0ZH2yYtHx74WScXNSXAj8C1DsP",
      startBlock: 42573834,
    },
  ],
  [
    2,
    {
      url: "https://moonbase-alpha.blastapi.io/be6f59cb-0c85-444f-b8bc-4179bd203cac",
      startBlock: 2916751,
    },
  ],
  [
    3,
    {
      url: "https://eth-sepolia.g.alchemy.com/v2/XEdjTRcsZFKjg7Cqx7C6l5KODNZGDxuY",
      startBlock: 3054823,
    },
  ],
  [
    5,
    {
      url: "wss://rhala-node.phala.network/ws",
      startBlock: 468700,
    },
  ],
  [
    6,
    {
      url: "https://canto-testnet.plexnode.wtf",
      startBlock: 1096573,
    },
  ],
])
