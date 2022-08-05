const { network, ethers } = require("hardhat");
const { developmentChains , networkConfig} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2");

module.exports  = async function({getNamedAccounts, deployments}) {
    const {deploy , log} = deployments;
    const {deployer} = await getNamedAccounts();
    let vrfCoordinatorV2Address , subscriptionId;

    const chainId = network.config.chainId;

    if(developmentChains.includes(network.name)){
        const vrfCordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCordinatorV2Mock.address;
        const transactionResponse = await vrfCordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        subscriptionId = transactionReceipt.events[0].args.subId;
        //fund the subscription
        await vrfCordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);


    }else{
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
    }

    const entranceFee = networkConfig[chainId]["entranceFee"];
    const gasLane = networkConfig[chainId]["gasLane"];
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
    const interval = networkConfig[chainId]["interval"];

    const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId , callbackGasLimit, interval];
    
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitingConfirmations: network.config.blockConfirmations || 1
    });
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("verifying....");
        await verify(raffle.address, args);
        log("------------------*** Verified ***-----------------");
    }else{
        log("------------*** No need To Verify on local network ***----------------");
    }
}

module.exports.tags = ["all", "raffle"];