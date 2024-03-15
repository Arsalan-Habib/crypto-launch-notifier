import { PORT } from "./config";
import express from "express";
import { extractLinks, getContractSrcCode, getTokenAddress } from "./utils";
import { Address } from "viem";

export const initializeServer = () => {
  const app = express();

  app.get("/", (req, res) => {
    res.send("Token launch notifier bot is running!");
  });

  app.get("/extract-links/:address", async (req, res) => {
    try {
      const address: Address = req.params.address as Address;

      const contractCode = await getContractSrcCode(address);

      if (!contractCode) {
        return res.json({
          error: "Contract not found",
        });
      }

      const links = extractLinks(contractCode.sourceCode);

      res.json({
        links: links,
      });
    } catch (error) {
      console.log("error =>", error);
      res.json({
        error,
      });
    }
  });

  app.get("/get-tokens/:address", async (req, res) => {
    const address: Address = req.params.address as Address;

    const token = await getTokenAddress(address);

    res.json({
      success: true,
      token,
    });
  });

  app.get("/get-contract-code/:address", async (req, res) => {
    try {
      const address: Address = req.params.address as Address;

      const contractCode = await getContractSrcCode(address);

      if (!contractCode) {
        return res.json({
          error: "Contract not found",
        });
      }

      res.json({
        contractCode,
      });
    } catch (error) {
      console.log("error =>", error);
      res.json({
        error,
      });
    }
  });

  app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
  });
};
