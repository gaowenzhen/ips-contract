# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
```
IPSNFT: https://goerli.etherscan.io/address/0x7a44b20eafD6AD656E70606Fe7323D859C5fc9Ed#code ipsabi

1.function auctionMint(uint256 quantity) external payable
2.function whitelistMint(uint256 quantity, bytes32[] memory _proof)
3.function publicSaleMint(uint256 quantity) external payable
```
```
IPSRegistrar: https://goerli.etherscan.io/address/0x290342E43E3728eeE83929c4688341D3F5d3D163#code ipsmetaverseregister
1.function getTokenMeta(address _metaverse, uint256 tokenId)
2.  mapping(address => mapping(uint256 => address)) public metaBinded;
    mapping(address => mapping(uint256 => address)) public metaCreated;
    mapping(address => bool) public beenBinded;
    mapping(address => bool) public beenCreated;
```
```
IPSFactory: https://goerli.etherscan.io/address/0xA44ebFf35B82f5F952Cb0b234ce63552BE82fA28#code ipsfactory
1.function createMetaverse(CreateConfig memory config) 
struct CreateConfig {
        string name;
        string symbol;
        uint256 amountForAuction;
        uint256 maxBatchSize;
        uint256 collectionSize;
        uint256 tokenId;
        address metaverse;
    }
2.function bind(uint256 tokenId, address _metaverse, address metaverse_)
```
```
IPSCoordinateSystem: https://goerli.etherscan.io/address/0x2eF342544A6519c788743D380037B47bEB6A49Cf#code systemabi
1.funciton createCoordinate(Coordinate memory coord, uint256 tokenId, bytes memory signature)
struct Coordinate {
        uint256 x;
        uint256 y;
        uint256 z;
        uint256 tokenId;
        address metaverse;
    }
2.function getCoordinate(address meta_, uint256 tokenId)
```
```
CNSRegistrarController: https://goerli.etherscan.io/address/0x139b6AC6588694e542cbb72536099f39757a7Ab0 cns
1.function registerWithConfig(string memory name, uint256 duration) public payable
2.function renew(string memory name, uint256 duration) public payable
3.function price(string memory name, uint256 duration) public view returns (uint256)
4.function available(string memory name) public view returns (bool) //name available
```
```
BaseCoordinateBind: https://goerli.etherscan.io/address/0xC486a3064d4f1D8C5377Df7c2a2aA96baB9194F3#code basebind
1.function BindCNS(address metaverse, uint256 tokenId, string memory name) public
2.function getTokenCNS(address metaverse, uint256 tokenId) public view returns(string memory)
    mapping(string => Coordinate) public nameCoordinate;
    mapping(string => uint256) public nameTokenId;
    mapping(string => address) public nameMeta;
    mapping(address => mapping(uint256 => string)) public tokenCNS;
// 由坐标获取域名
3. function getTokenCNSByCoord(Coordinate memory coord) public view returns(string memory) 
```


```js
[域名]x,y,z[a-hax](m,n,k)

```