import { ethers } from "hardhat";
let moment = require("moment");

let isLocalTest = false; //是否是本地测试， true: 本地测试  false: 部署远程节点    如果本地测试则部署之后不会进行睡眠
async function openLocalTest() {
  isLocalTest = true;
}

//部署IPS
async function deployIPS(selfAddress: any, ballLevel: any, baseUrl: any, maxBatchSize: any, collectionSize: any, amountForAuction: any, name: any, symbol: any) {
  const Contract = await ethers.getContractFactory("IPS");
  let deployedContract: any;
  if (!selfAddress || selfAddress == "") {
    console.log("deploy IPS start");
    deployedContract = await Contract.deploy(ballLevel, baseUrl, maxBatchSize, collectionSize, amountForAuction, name, symbol);
    await deployedContract.deployed();
    selfAddress = deployedContract.address;
    await sleep(5000);
  } else {
    console.log("init IPS by address: %s", selfAddress);
    deployedContract = Contract.attach(selfAddress);
  }
  console.log("IPS deploy finish, address: %s", selfAddress);
  return deployedContract;
}

//部署BaseCoordinateBind
async function deployBaseCoordinateBind(selfAddress: any, ipsCoordinateSystemAddr: any, cnsRegistrarControllerAddr: any) {
  const Contract = await ethers.getContractFactory("BaseCoordinateBind");
  let deployedContract: any;
  if (!selfAddress || selfAddress == "") {
    console.log("deploy basecoordinate start");
    deployedContract = await Contract.deploy(ipsCoordinateSystemAddr, cnsRegistrarControllerAddr);
    await deployedContract.deployed();
    selfAddress = deployedContract.address;
    await sleep(5000);
  } else {
    console.log("init basecoordinate by address: %s", selfAddress);
    deployedContract = Contract.attach(selfAddress);
  }
  console.log("basecoordinate deploy finish, address: %s", selfAddress);
  return deployedContract;
}

//部署CNSRegistrarController
async function deployCNSRegistrarController(selfAddress: any) {
  const Contract = await ethers.getContractFactory("CNSRegistrarController");
  let deployedContract: any;
  if (!selfAddress || selfAddress == "") {
    console.log("deploy CNSRegistrarController start");
    deployedContract = await Contract.deploy();
    await deployedContract.deployed();
    selfAddress = deployedContract.address;
    await sleep(5000);
  } else {
    console.log("init CNSRegistrarController by address: %s", selfAddress);
    deployedContract = Contract.attach(selfAddress);
  }
  console.log("CNSRegistrarController deploy finish, address: %s", selfAddress);
  return deployedContract;
}

//部署IPSCoordinateSystem
async function deployIPSCoordinateSystem(selfAddress: any,ipsCoordinateVerifyAddr: any) {
  const Contract = await ethers.getContractFactory("IPSCoordinateSystem");
  let deployedContract: any;
  if (!selfAddress || selfAddress == "") {
    console.log("deploy IPSCoordinateSystem start");
    deployedContract = await Contract.deploy(ipsCoordinateVerifyAddr);
    await deployedContract.deployed();
    selfAddress = deployedContract.address;
    await sleep(5000);
  } else {
    console.log("init IPSCoordinateSystem by address: %s", selfAddress);
    deployedContract = Contract.attach(selfAddress);
  }
  console.log("IPSCoordinateSystem deploy finish, address: %s", selfAddress);
  return deployedContract;
}

//部署IPSNFTFactory
async function deployIPSNFTFactory(selfAddress: any, IPSMetaverseRegistrarAddr: any, ipsCoordinateVerifyAddr: any) {
  const Contract = await ethers.getContractFactory("IPSNFTFactory");
  let deployedContract: any;
  if (!selfAddress || selfAddress == "") {
    console.log("deploy IPSNFTFactory start");
    deployedContract = await Contract.deploy(IPSMetaverseRegistrarAddr, ipsCoordinateVerifyAddr);
    await deployedContract.deployed();
    selfAddress = deployedContract.address;
    await sleep(5000);
  } else {
    console.log("init IPSNFTFactory by address: %s", selfAddress);
    deployedContract = Contract.attach(selfAddress);
  }
  console.log("IPSNFTFactory deploy finish, address: %s", selfAddress);
  return deployedContract;
}

//部署IPSNFTFactory
async function deployIPSMetaverseRegistrar(selfAddress: any, ipsAddr: any) {
  const Contract = await ethers.getContractFactory("IPSMetaverseRegistrar");
  let deployedContract: any;
  if (!selfAddress || selfAddress == "") {
    console.log("deploy IPSMetaverseRegistrar start");
    deployedContract = await Contract.deploy(ipsAddr);
    await deployedContract.deployed();
    selfAddress = deployedContract.address;
    await sleep(5000);
  } else {
    console.log("init IPSMetaverseRegistrar by address: %s", selfAddress);
    deployedContract = Contract.attach(selfAddress);
  }
  console.log("IPSMetaverseRegistrar deploy finish, address: %s", selfAddress);
  return deployedContract;
}

//部署MyNft
async function deployMyNft(selfAddress: any, maxBatchSize: any, collectionSize: any) {
  const Contract = await ethers.getContractFactory("MyNFT");
  let deployedContract: any;
  if (!selfAddress || selfAddress == "") {
    console.log("deploy MyNFT start");
    deployedContract = await Contract.deploy(maxBatchSize, collectionSize);
    await deployedContract.deployed();
    selfAddress = deployedContract.address;
    await sleep(5000);
  } else {
    console.log("init MyNFT by address: %s", selfAddress);
    deployedContract = Contract.attach(selfAddress);
  }
  console.log("MyNFT deploy finish, address: %s", selfAddress);
  return deployedContract;
}

//部署IPSCoordinateVerify
async function deployIPSCoordinateVerify(selfAddress: any) {
  const Contract = await ethers.getContractFactory("IPSCoordinateVerify");
  let deployedContract: any;
  if (!selfAddress || selfAddress == "") {
    console.log("deploy IPSCoordinateVerify start");
    deployedContract = await Contract.deploy();
    await deployedContract.deployed();
    selfAddress = deployedContract.address;
    await sleep(5000);
  } else {
    console.log("init IPSCoordinateVerify by address: %s", selfAddress);
    deployedContract = Contract.attach(selfAddress);
  }
  console.log("IPSCoordinateVerify deploy finish, address: %s", selfAddress);
  return deployedContract;
}

//睡眠指定时间
function sleep(ms: any) {
  console.log(moment().format("YYYYMMDD HH:mm:ss"), "DEBUG", "sleep ms " + ms);
  if (!isLocalTest) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

//等待交易执行完之后，仍继续等待5秒
async function waitTrans(trans: any, transDesc: any) {
  console.log("%s start", transDesc);
  await trans.wait();
  await sleep(5000);
  console.log("%s success", transDesc);
}

export {
  waitTrans,
  deployIPS,
  deployBaseCoordinateBind,
  openLocalTest,
  deployCNSRegistrarController,
  deployIPSCoordinateSystem,
  deployIPSNFTFactory,
  deployIPSMetaverseRegistrar,
  deployIPSCoordinateVerify,
  deployMyNft,
};
