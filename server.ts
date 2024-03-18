import { PORT, ignoredLinks } from "./config";
import express from "express";
import { extractLinks, verifyLinkUsingAI, getContractSrcCode, getTokenAddress } from "./utils";
import { Address } from "viem";

export const initializeServer = () => {
  const app = express();

  app.use(express.urlencoded({ extended: false }));

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

  app.post("/isWebUrl", async (req, res) => {
    try {
      const {contractName, url} = req.body;

      const result = await verifyLinkUsingAI(contractName, url);

      console.log('result =>', result);

      res.json({
        success: true,
        result,
      });
    } 
    catch (error) {
      console.log("error =>", error);
      res.json({
        error,
      });
    }
  })


  app.post("/is-ignored-link", async(req, res)=>{
    const {link} = req.body

    console.log('link =>', link);

    const ignored = ignoredLinks.some((_link) => {


      console.log('_link =>', _link);
      console.log('link =>', link.search(_link) !== -1);
      return link.search(_link) !== -1
    })

    return res.json({
      status:true,
      ignored,
    })
  })

  app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
  });
};
