//执行：npx hardhat run scripts/deploy-matic-test.ts --network maticTest

let moment = require("moment");
const { ethers } = require("hardhat");
let abi = require("ethereumjs-abi");
let Web3 = require("web3");
const { assert, expect } = require("chai");

const {
  openLocalTest,
  waitTrans,
  deployIPS,
  deployCNSRegistrarController,
  deployIPSCoordinateSystem,
  deployIPSNFTFactory,
  deployIPSMetaverseRegistrar,
  deployBaseCoordinateBind,
  deployMyNft,
  deployIPSCoordinateVerify,
} = require("../scripts/contractDeploy.ts");

const { generateProof,getAllMerkelData } = require("../scripts/merkleTreeHelper.ts");

//合约地址
let ipsAddress = ""; //首个IPS坐标合约
let cnsRegistrarControllerAddress = "";
let ipsCoordinateSystemAddress = "";
let ipsMetaverseRegistrarAddress = "";
let ipsNFTFactoryAddress = "";
let baseCoordinateBindAddress = "";
let ipsCoordinateVerifyAddress = "";
//测试用
let testMyNftAddress = "";

//已部署的合约
let deployedIPS: any;
let deployedCNSRegistrarController: any;
let deployedIPSCoordinateSystem: any;
let deployedIPSNFTFactory: any;
let deployedIPSMetaverseRegistrar: any;
let deployedBaseCoordinateBind: any;
let deployedIPSCoordinateVerify: any;
//测试用
let testDeployedMyNft: any;

//坐标校验合约的参数
const level27 = 27; //第一层IPFS坐标合约选择的球的层级
const level27CollectionSize = 10610; //该合约最多能铸造个数(首个球固定有10610个坐标,其它延申的球由factory根据层数确定坐标个数)
const level27MerkleRootHash = "0x7d4db63df1e43b9ed415e7e582ea777f49fc6b6bd00df6122c998d7c2aee8116";
const level27BaseUrl = "https://ipfs.io/ipfs/Qmf3brToWP1NqnJ21Qr3g7tCXea4mzQRi3p5s6gzCq8S5e/"; //IPS的基础URL

//参数
const ballLevel = 27; //第一层IPFS坐标合约选择的球的层级
const maxBatchSize = 3; //每次最多铸造坐标个数
const amountForAuction = 100; //计划拍卖坐标个数
const ipsName = "IPSNFT";
const ipsSymbol = "IPS";
const mintlistPriceWei = 100; //拍卖期间，每铸造个坐标的价格，wei
const publicPriceWei = 100; //公售期间，每铸造个坐标的价格，wei
const auctioinSaleStartTime = parseInt(new Date().getTime() / 1000 + "") - 1000; //拍卖起始时间,默认当前时间
const publicSaleStartTime = auctioinSaleStartTime + 30 * 24 * 60; //公售起始时间

//测试期间用
let fromJsonFile = "F:\\codes\\github\\ips-contract\\scripts\\coordinatesJson\\coord10610.json";

async function deployContract() {
  //deployedIPSCoordinateVerify
  deployedIPSCoordinateVerify = await deployIPSCoordinateVerify(ipsCoordinateVerifyAddress);
  ipsCoordinateVerifyAddress = deployedIPSCoordinateVerify.address;

  //IPS
  deployedIPS = await deployIPS(ipsAddress, level27, level27BaseUrl, maxBatchSize, level27CollectionSize, amountForAuction, ipsName, ipsSymbol);
  ipsAddress = deployedIPS.address;

  //CNSRegistrarController
  deployedCNSRegistrarController = await deployCNSRegistrarController(cnsRegistrarControllerAddress);
  cnsRegistrarControllerAddress = deployedCNSRegistrarController.address;

  //IPSCoordinateSystem
  deployedIPSCoordinateSystem = await deployIPSCoordinateSystem(ipsCoordinateSystemAddress, ipsCoordinateVerifyAddress);
  ipsCoordinateSystemAddress = deployedIPSCoordinateSystem.address;

  //IPSMetaverseRegistrar
  deployedIPSMetaverseRegistrar = await deployIPSMetaverseRegistrar(ipsMetaverseRegistrarAddress, ipsAddress);
  ipsMetaverseRegistrarAddress = deployedIPSMetaverseRegistrar.address;

  //IPSNFTFactory
  deployedIPSNFTFactory = await deployIPSNFTFactory(ipsNFTFactoryAddress, ipsMetaverseRegistrarAddress, ipsCoordinateVerifyAddress);
  ipsNFTFactoryAddress = deployedIPSNFTFactory.address;

  //BaseCoordinateBind
  deployedBaseCoordinateBind = await deployBaseCoordinateBind(baseCoordinateBindAddress, ipsCoordinateSystemAddress, cnsRegistrarControllerAddress);
  baseCoordinateBindAddress = deployedBaseCoordinateBind.address;

  //IPS
  testDeployedMyNft = await deployMyNft(testMyNftAddress, maxBatchSize, 1000);
  testMyNftAddress = testDeployedMyNft.address;
}

//合约部署之后进行初始化
async function initAfterDeploy() {
  //ips config
  await waitTrans(await deployedIPS.endAuctionAndSetupNonAuctionSaleInfo(mintlistPriceWei, publicPriceWei, publicSaleStartTime), "init ipfs");
  // await waitTrans(await deployedIPS.setBaseURI(level27BaseUrl), "set ips base path");
  await waitTrans(await deployedIPS.setAuctionSaleStartTime(auctioinSaleStartTime), "ipfs setAuctionSaleStartTime");
  await waitTrans(await deployedIPSMetaverseRegistrar.setControllers(ipsNFTFactoryAddress), "deployedIPSMetaverseRegistrar setControllers");
}

//用户及地址
let deployer: any, user1: any;
let deployerAddress: any;
let isLocalTest = true;
describe("===========================IPFS test===========================", function () {
  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();
    deployerAddress = deployer.address;
    //开启测试环境，即在部署合约之后不会睡眠5秒
    if (isLocalTest) {
      await openLocalTest();
    }
  });

  it("deploy test", async function () {
    await deployContract();
    await initAfterDeploy();
  });

  it("IPSCoordinateVerify set level test", async function () {
    await waitTrans(await deployedIPSCoordinateVerify.setBallLevel(ballLevel, level27MerkleRootHash, level27CollectionSize, level27BaseUrl), "setLevel");
  });

  // it("IPSCoordinateVerify verify test", async function () {
  //   var [x, y, z] = [2, 50, 2];
  //   var targetTokenId = 1;
  //   var level = 27;
  //   let fromJsonFile = "F:\\codes\\github\\ips-contract\\scripts\\coordinatesJson\\coord10610.json";
  //   const proofHex = (await generateProof(fromJsonFile, level, targetTokenId, x, y, z)).proofHex;
  //   console.log("proofHex", JSON.stringify(proofHex));
  //   const verifyRsp = await deployedIPSCoordinateVerify.verifyCoordinateProof(level, targetTokenId, x, y, z, proofHex);
  //   console.log(`verifyRsp:${verifyRsp}`);
  //   expect(verifyRsp).to.equal(true);
  // });

  it("mint test", async function () {
    await waitTrans(await testDeployedMyNft.connect(user1).mint(3), "mint myNFT");
    await waitTrans(await deployedIPS.connect(user1).auctionMint(3, { value: ethers.utils.parseUnits("0.03", "ether") }), "mint ipfs");
  });

  it("createCoordinate test", async function () {
    const tokenId = 0;
    const [x, y, z] = [1, 51, 1];
    const coordParams = [x, y, z, tokenId, ipsAddress];
    const proofHexArray = (await generateProof(fromJsonFile, ballLevel, tokenId, x, y, z)).proofHex;
    console.log(`proofHexArray:${JSON.stringify(proofHexArray)}`);
    await waitTrans(await deployedIPSCoordinateSystem.connect(user1).createCoordinate(coordParams, tokenId, proofHexArray), "createCoordinate");
  });

  it("bind ipfs with otherNFT test", async function () {
    await waitTrans(await deployedIPSNFTFactory.connect(user1).bind(0, ipsAddress, testMyNftAddress), "bind metaverese");
  });

  it("buy domain and bind cns", async function () {
    let domain = "MyDomain";
    let domainDuration = 3; //month
    let metaData = JSON.stringify({ tokenPage: "https://abc.com?name=alice" }); //month
    //buy domain
    var price = await deployedCNSRegistrarController.price(domain, domainDuration);
    await waitTrans(await deployedCNSRegistrarController.connect(user1).registerWithConfig(domain, domainDuration, { value: price }), "buy domain");

    //bind domain
    await waitTrans(await deployedBaseCoordinateBind.connect(user1).BindCNS(ipsAddress, 0, domain, metaData), "bind domain");
  });
});
