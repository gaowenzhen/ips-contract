//执行：npx hardhat run scripts/deploy-matic-test.ts --network maticTest

//下一版本修改
//1、注意IPS合约的一个钱包地址：ipsVault
//2、需要改造，不是绑定域名时填媒体数据，而是在绑定元宇宙时

let moment = require("moment");
const { ethers } = require("hardhat");
const {
  waitTrans,
  deployIPS,
  deployCNSRegistrarController,
  deployIPSCoordinateSystem,
  deployIPSNFTFactory,
  deployIPSMetaverseRegistrar,
  deployBaseCoordinateBind,
  deployIPSCoordinateVerify,
} = require("./contractDeploy.ts");

//合约地址
let ipsCoordinateVerifyAddress = "0x1299b636104159D46d628199C880adb9f49267C2";
let ipsAddress = "0x423B2fe7Acc1aeA40C08717f98264c3CDD21Ae96"; //首个IPS坐标合约
let cnsRegistrarControllerAddress = "0xc6E9a824b0364ac7642c9E6925fc893e39077afA";
let ipsCoordinateSystemAddress = "0x0f556E162Ed16cD445903034BE1a3E34B3A54470";
let ipsMetaverseRegistrarAddress = "0xA90b1d9608596132ec9850FF91152083c2EA5bd2";
let ipsNFTFactoryAddress = "0x82d62C6f1fC998ECDC14332ad86a719C472a27C5";
let baseCoordinateBindAddress = "0x2D4D842f6b71A35FDA2630612ba281902047CD6d";


//已部署的合约
let deployedIPS: any;
let deployedCNSRegistrarController: any;
let deployedIPSCoordinateSystem: any;
let deployedIPSNFTFactory: any;
let deployedIPSMetaverseRegistrar: any;
let deployedBaseCoordinateBind: any;
let deployedIPSCoordinateVerify: any;

//用户及地址
let deployer: any;
let deployerAddress: any;

//坐标校验合约的参数
const level27 = 27; //第一层IPFS坐标合约选择的球的层级
const level27CollectionSize = 10610; //该合约最多能铸造个数(首个球固定有10610个坐标,其它延申的球由factory根据层数确定坐标个数)
const level27MerkleRootHash = "0x7d4db63df1e43b9ed415e7e582ea777f49fc6b6bd00df6122c998d7c2aee8116";
const level27BaseUrl = "https://ipfs.io/ipfs/Qmf3brToWP1NqnJ21Qr3g7tCXea4mzQRi3p5s6gzCq8S5e/"; //IPS第27层球的基础URL

//参数
const maxBatchSize = 20; //每次最多铸造坐标个数
const amountForAuction = 100; //计划拍卖坐标个数
const ipsName = "IPSNFT";
const ipsSymbol = "IPS";
const mintlistPriceWei = 100; //拍卖期间，每铸造个坐标的价格，wei
const publicPriceWei = 100; //公售期间，每铸造个坐标的价格，wei
const auctioinSaleStartTime = parseInt(new Date().getTime() / 1000 + ""); //拍卖起始时间,默认当前时间
const publicSaleStartTime = auctioinSaleStartTime + 30 * 24 * 60; //公售起始时间


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
}

//合约部署之后进行初始化
async function initAfterDeploy() {
  //ips config
  await waitTrans(await deployedIPS.endAuctionAndSetupNonAuctionSaleInfo(mintlistPriceWei, publicPriceWei, publicSaleStartTime), "init ipfs");
  await waitTrans(await deployedIPS.setAuctionSaleStartTime(auctioinSaleStartTime), "ipfs setAuctionSaleStartTime");
  await waitTrans(await deployedIPSMetaverseRegistrar.setControllers(ipsNFTFactoryAddress), "deployedIPSMetaverseRegistrar setControllers");

  //坐标校验合约设置27层球的配置
  await waitTrans(await deployedIPSCoordinateVerify.setBallLevel(level27, level27MerkleRootHash, level27CollectionSize, level27BaseUrl), "setBallLevel");

}

async function main() {
  [deployer] = await ethers.getSigners();
  deployerAddress = deployer.address;

  //部署合约
  await deployContract();
  //合约部署之后进行初始化
  await initAfterDeploy();
  console.log("deploy finish");
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


export {};
