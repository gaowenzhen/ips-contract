import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-web3";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";

const TEST_OWNER_KEY = "5511a7aeb49a387168e4cc16a815f7b641d5fa4afe442a2dede56398df6fd84d"; //测试网的OWNER私钥  0x910cBA72870aaCA57BdFC8A98A76bA46F0a08573
const MATIC_OWNER_KEY = "5511a7aeb49a387168e4cc16a815f7b641d5fa4afe442a2dede56398df6fd82d"; //生产替换私钥

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  // defaultNetwork: "goerli",
  networks: {
    hardhat: {},
    maticTest: {
      url: "https://rpc-mumbai.matic.today",
      chainId: 80001,
      accounts: [`0x${TEST_OWNER_KEY}`], //第一个owner
      timeout: 40000,
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 20000,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "SBN1X32FKU66M4HRXENZH2JXJ5S2TQB4NC",
  },
};
