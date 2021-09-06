import {ChainbridgeConfig} from "./chainbridgeTypes"

const CHAINBRIDGE: ChainbridgeConfig = {
  chains: [
    {
      chainId: 0,
      networkId: 44787,
      name: "EVM Celo Testnet",
      decimals: 18,
      bridgeAddress: "0x194173CC736b9CCDc4AF0E46eA90872Dc41D0420",
      erc20HandlerAddress: "0x94d72A2984946805275cE97F413B03130647ba82",
      rpcUrl: "https://alfajores-forno.celo-testnet.org",
      type: "Ethereum",
      nativeTokenSymbol: "CELO",
      deployedBlockNumber: 6994823,
      tokens: [
        {
          address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
          name: "an ERC20 (cUSD)",
          symbol: "ERC20",
          imageUri: "ETHIcon",
          resourceId:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      ],
    },
    {
      chainId: 1,
      networkId: 4,
      name: "Ethereum - Rinkeby",
      decimals: 18,
      bridgeAddress: "0x194173CC736b9CCDc4AF0E46eA90872Dc41D0420",
      erc20HandlerAddress: "0xeF721c2F6dfafb6065792CEfFfc77C25A46d67C0",
      rpcUrl:
        "wss://eth-rinkeby.alchemyapi.io/v2/fbIXLWOhL5LNVgJ7uRpQW27CevBffcAf",
      type: "Ethereum",
      nativeTokenSymbol: "ETH",
      deployedBlockNumber: 9211212,
      tokens: [
        {
          address: "0xe09523d86d9b788BCcb580d061605F31FCe69F51",
          name: "an ERC20",
          symbol: "ERC20",
          imageUri: "WETHIcon",
          resourceId:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      ],
    },
  ],
};
export default CHAINBRIDGE