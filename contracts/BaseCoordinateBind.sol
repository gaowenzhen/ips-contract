// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./IPSCoordinateSystem.sol";

contract BaseCoordinateBind is Ownable {

    address public cds;
    address public cns;

    struct Coordinate {
        uint256 x;
        uint256 y;
        uint256 z;
        uint256 tokenId;
        address metaverse;
    }
    mapping(string => Coordinate) public nameCoordinate;
    mapping(string => uint256) public nameTokenId;
    mapping(string => address) public nameMeta;
    mapping(string => string) public metaDataOf;//map<cnsName=>metaDataString>
    mapping(address => mapping(uint256 => string)) public tokenCNS;
    event NameBinded(address indexed meta_, uint256 tokenId);

    constructor(address cds_, address cns_) {
        cds = cds_;
        cns = cns_;
    }

    //metaData,such as {"tokenPage":"https://abc.com?name=alice"}
    function BindCNS(address metaverse, uint256 tokenId, string memory name,string memory metaData) public {
        require(metaverse != cns, "forbidden");
        uint256 lastId = nameTokenId[name];
        address lastMeta = nameMeta[name];
        if (lastId != tokenId || lastMeta != metaverse) {
            tokenCNS[lastMeta][lastId] = "";
        }
        require(IERC721(metaverse).ownerOf(tokenId) == msg.sender, "invalid nft owner");
        bytes32 label = keccak256(bytes(name));
        require(IERC721(cns).ownerOf(uint256(label)) == msg.sender, "invalid cns owner");
        uint256 x = IPSCoordinateSystem(cds).getCoordinate(metaverse, tokenId).x;
        uint256 y = IPSCoordinateSystem(cds).getCoordinate(metaverse, tokenId).y;
        uint256 z = IPSCoordinateSystem(cds).getCoordinate(metaverse, tokenId).z;
        require(tokenId == IPSCoordinateSystem(cds).getCoordinate(metaverse, tokenId).tokenId, "invalid tokenId");
        Coordinate memory coord = Coordinate(x, y, z, tokenId, metaverse);
        nameCoordinate[name] = coord;
        nameTokenId[name] = tokenId;
        nameMeta[name] = metaverse;
        tokenCNS[metaverse][tokenId] = name;
        metaDataOf[name] = metaData;
        emit NameBinded(metaverse, tokenId);
    }

    function getTokenCNS(address metaverse, uint256 tokenId) public view returns(string memory) {
        return tokenCNS[metaverse][tokenId];
    }

    function getTokenCNSByCoord(Coordinate memory coord) public view returns(string memory) {
        address metaverse = coord.metaverse;
        uint256 tokenId = coord.tokenId;
        return tokenCNS[metaverse][tokenId];
    }

}
