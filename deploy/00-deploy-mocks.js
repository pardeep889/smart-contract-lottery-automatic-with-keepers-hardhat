const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25"); // 0.25 is the premium and per request cost.
const GASS_PRICE_LINK = 1e9; //link per gas. calculated value based on gas price of the chain.

module.exports = async function({getNamedAccounts, deployments}){
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;
    const networkName = network.name;
    
    if(developmentChains.includes(networkName)){
        log("Local network detected.");
        log("Deploying Mocks...");
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GASS_PRICE_LINK]
        });
        log("Mocks deployed");
        log("--------------------*** END of Mock deployment ***------------------------");

    }
}

module.exports.tags  = ["all", "mocks"];