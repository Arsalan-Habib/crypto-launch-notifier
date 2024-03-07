import axios from "axios";
import { defaultChain } from "../constants/chains";
import { Address } from "viem";
import { ETHERSCAN_API_KEY } from ".";

export const getSourceCode = async (address: Address) => {
  try {
    const response = await axios.get(
      `${defaultChain.api}?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`
    );

    return response.data;
  } catch (error: any) {
    console.log("error =>", error);
  }
};
