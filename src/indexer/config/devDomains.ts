import { LocalDomainConfig } from "."

// map domainID: rpcURL
export const devDomains = new Map<number, string>([
  [
    0, "https://eth-goerli.g.alchemy.com/v2/wkF4rGEBspanIYTCzspMVFbOPjHP_IhL",
  ],
  [
    1, "https://polygon-mumbai.g.alchemy.com/v2/LquJll0ZH2yYtHx74WScXNSXAj8C1DsP",
  ],
  [
    2, "https://moonbase-alpha.blastapi.io/be6f59cb-0c85-444f-b8bc-4179bd203cac",
  ],
  [
    3, "https://eth-sepolia.g.alchemy.com/v2/XEdjTRcsZFKjg7Cqx7C6l5KODNZGDxuY",
  ],
  [
    5, "wss://rhala-node.phala.network/ws",
  ],
  [
    6, "https://canto-testnet.plexnode.wtf",
  ],
])
