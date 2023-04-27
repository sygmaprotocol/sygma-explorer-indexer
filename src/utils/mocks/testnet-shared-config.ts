// Note: I have to do this because regardless of the resolveJsonModule flag, the compiler will not resolve the json file
export default {
  "domains": [
    {
      "id": 1,
      "name": "ethereum",
      "type": "evm",
      "bridge": "0x95ECF5ae000e0fe0e0dE63aDE9b7D82a372038b4",
      "handlers": [
        {
          "type": "erc20",
          "address": "0xea24Bb5500fE670d1ce1B9EaEbA942a5ca85e5Ea"
        },
        {
          "type": "erc721",
          "address": "0xC2aae1ac76eD2Bb37bF4AdD72A82165bD2bf99F3"
        },
        {
          "type": "permissionedGeneric",
          "address": "0xd8681e9c2bA2fdfE6690F59bc726C657ed8B494D"
        },
        {
          "type": "permissionlessGeneric",
          "address": "0x8DeCB677dAD03F07b5647eAA0B502d8f44B645eF"
        }
      ],
      "nativeTokenSymbol": "eth",
      "nativeTokenFullName": "ether",
      "nativeTokenDecimals": 18,
      "blockConfirmations": 5,
      "startBlock": 8056086,
      "feeRouter": "0xC3ea0Fbaa708D225BD2575dC4A57e0eaE8aFc77F",
      "feeHandlers": [
        {
          "address": "0x530Ca8291856c727cc6a33c2ACD50f79184AFA3d",
          "type": "basic"
        },
        {
          "address": "0x7350e258Cb88a22572Edefe5d80BAD21b42Cc124",
          "type": "oracle"
        }
      ],
      "resources": [
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "type": "erc20",
          "address": "0x3D151A97A446C9ea6893038e7C0db73466f3f3af",
          "symbol": "ERC20TST",
          "decimals": 18
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000300",
          "type": "erc20",
          "address": "0x3F9A68fF29B3d86a6928C44dF171A984F6180009",
          "symbol": "ERC20LRTest",
          "decimals": 18
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000200",
          "type": "erc721",
          "address": "0xe9d3b1433bACDfC26ee097629D238A41BF6dA3aE",
          "symbol": "ERC721TST",
          "decimals": 0
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000500",
          "type": "permissionlessGeneric",
          "address": "",
          "symbol": "",
          "decimals": 0
        }
      ]
    },
    {
      "id": 2,
      "name": "moonbeam",
      "type": "evm",
      "bridge": "0xd8681e9c2bA2fdfE6690F59bc726C657ed8B494D",
      "handlers": [
        {
          "type": "erc20",
          "address": "0xC3ea0Fbaa708D225BD2575dC4A57e0eaE8aFc77F"
        },
        {
          "type": "erc721",
          "address": "0x530Ca8291856c727cc6a33c2ACD50f79184AFA3d"
        },
        {
          "type": "permissionedGeneric",
          "address": "0x7350e258Cb88a22572Edefe5d80BAD21b42Cc124"
        },
        {
          "type": "permissionlessGeneric",
          "address": "0x06f3CE7b93eBE17Df5F46d23934F1125C1dcC5f5"
        }
      ],
      "nativeTokenSymbol": "glmr",
      "nativeTokenFullName": "dev",
      "nativeTokenDecimals": 18,
      "blockConfirmations": 5,
      "startBlock": 3282200,
      "feeRouter": "0x6593d8aF009d35d0BbB6eDe1dd29dF55b73F9A98",
      "feeHandlers": [
        {
          "address": "0xe7Ed7AAd072ACd23bA36F906C2515DF8eD43d482",
          "type": "basic"
        },
        {
          "address": "0x0693FeBE4766b85CcecB0C5168b39c81E0251366",
          "type": "oracle"
        }
      ],
      "resources": [
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "type": "erc20",
          "address": "0xAc693E44E1EDe5f66A4e1406F65b904450932fB3",
          "symbol": "ERC20TST",
          "decimals": 18
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000300",
          "type": "erc20",
          "address": "0x3690601896C289be2d894c3d1213405310D0a25C",
          "symbol": "ERC20LRTest",
          "decimals": 18
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000200",
          "type": "erc721",
          "address": "0x3D151A97A446C9ea6893038e7C0db73466f3f3af",
          "symbol": "ERC721TST",
          "decimals": 0
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000500",
          "type": "permissionlessGeneric",
          "address": "",
          "symbol": "",
          "decimals": 0
        }
      ]
    },
    {
      "id": 3,
      "name": "polygon",
      "type": "evm",
      "bridge": "0x9a8F70222FB768e16FE343c9EbA8634e4bd6524A",
      "handlers": [
        {
          "type": "erc20",
          "address": "0xb76A581fc20020675651EABC465ECaA311474186"
        },
        {
          "type": "erc721",
          "address": "0x5D7fc7407F00C415a13C43076e7Db82b357DE658"
        },
        {
          "type": "permissionedGeneric",
          "address": "0x16B10caAacc1a87C7C92Ec281A96323faA0f3CA0"
        },
        {
          "type": "permissionlessGeneric",
          "address": "0x314c8b3C6643D237213381ee3a6D5bDaeDFaD477"
        }
      ],
      "nativeTokenSymbol": "matic",
      "nativeTokenFullName": "matic",
      "nativeTokenDecimals": 18,
      "blockConfirmations": 5,
      "startBlock": 29438072,
      "feeRouter": "0x2247c836CC252F0D7D06883350e902996Ddb442D",
      "feeHandlers": [
        {
          "address": "0xe255cA458925c26d3E05004e247579A64b020cEF",
          "type": "basic"
        },
        {
          "address": "0x0B4Befb569dEa0cA11f0bFeF6919a28Ae7d829E1",
          "type": "oracle"
        }
      ],
      "resources": [
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "type": "erc20",
          "address": "0x2465c8F84bDB7130ACDf31d694bc9c820F70ac06",
          "symbol": "ERC20TST",
          "decimals": 18
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000300",
          "type": "erc20",
          "address": "0xFC072Aa8ABB5646aFD0c22994bdE30dB57B1BF1C",
          "symbol": "ERC20LRTest",
          "decimals": 18
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000200",
          "type": "erc721",
          "address": "0x4beD477d1f5D338855A521ABa2A88c9a15e2eA5d",
          "symbol": "ERC721TST",
          "decimals": 0
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000500",
          "type": "permissionlessGeneric",
          "address": "",
          "symbol": "",
          "decimals": 0
        }
      ]
    },
    {
      "id": 4,
      "name": "ethereum",
      "type": "evm",
      "bridge": "0x9a8F70222FB768e16FE343c9EbA8634e4bd6524A",
      "handlers": [
        {
          "type": "erc20",
          "address": "0xb76A581fc20020675651EABC465ECaA311474186"
        },
        {
          "type": "erc721",
          "address": "0x5D7fc7407F00C415a13C43076e7Db82b357DE658"
        },
        {
          "type": "permissionedGeneric",
          "address": "0x16B10caAacc1a87C7C92Ec281A96323faA0f3CA0"
        },
        {
          "type": "permissionlessGeneric",
          "address": "0xB408D2329cB7ffFAecABa8811f165369a8C1E76B"
        }
      ],
      "nativeTokenSymbol": "eth",
      "nativeTokenFullName": "ether",
      "nativeTokenDecimals": 18,
      "blockConfirmations": 5,
      "startBlock": 3127956,
      "feeRouter": "0x2247c836CC252F0D7D06883350e902996Ddb442D",
      "feeHandlers": [
        {
          "address": "0xe255cA458925c26d3E05004e247579A64b020cEF",
          "type": "basic"
        },
        {
          "address": "0x0B4Befb569dEa0cA11f0bFeF6919a28Ae7d829E1",
          "type": "oracle"
        }
      ],
      "resources": [
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "type": "erc20",
          "address": "0x06f3CE7b93eBE17Df5F46d23934F1125C1dcC5f5",
          "symbol": "ERC20TST",
          "decimals": 18
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000300",
          "type": "erc20",
          "address": "0xA9C41B54e635259EB1C72Fde4a6844D82eD00cde",
          "symbol": "ERC20LRTest",
          "decimals": 18
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000200",
          "type": "erc721",
          "address": "0x37313Ab1701fCfC5050E84B4E7f841abB588a1db",
          "symbol": "ERC721TST",
          "decimals": 0
        },
        {
          "resourceId": "0x0000000000000000000000000000000000000000000000000000000000000500",
          "type": "permissionlessGeneric",
          "address": "",
          "symbol": "",
          "decimals": 0
        }
      ]
    }
  ]
}