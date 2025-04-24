import { getFullnodeUrl } from "@iota/iota-sdk/client";
import {
  LOYALTY_PACKAGE_ID,
} from "./constants.ts";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        counterPackageId: "0xTODO",
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        counterPackageId: LOYALTY_PACKAGE_ID,
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        counterPackageId: "0xTODO",
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
