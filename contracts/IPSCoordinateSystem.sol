// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IPSCoordinateVerify.sol";
import "./IPS.sol";

// import "hardhat/console.sol";

contract IPSCoordinateSystem is Ownable {
    using Address for address;
    address public ipsCoordinateVerifyAddr;
    // address public immutable Ips;
    struct Coordinate {
        uint256 x;
        uint256 y;
        uint256 z;
        uint256 tokenId;
        address metaverse;
    }
    mapping(address => mapping(uint256 => Coordinate)) public tokenCoordinate;
    //metaverse owner can set signer to verify token coordinate
    mapping(address => address) metaSigner;

    event CoordCreated(
        address indexed user,
        uint256 indexed tokenId,
        address indexed metaverse
    );

    constructor(address _ipsCoordinateVerifyAddr) {
        ipsCoordinateVerifyAddr = _ipsCoordinateVerifyAddr;
    }

    function createCoordinate(
        Coordinate memory coord,
        uint256 tokenId,
        bytes32[] memory proof
    ) public {
        require(
            IERC721(coord.metaverse).ownerOf(tokenId) == msg.sender,
            "not nft owner"
        );

        uint256 level = IPS(coord.metaverse).ballLevel();

        bool verifySuccess = IPSCoordinateVerify(ipsCoordinateVerifyAddr)
            .verifyCoordinateProof(
                level,
                tokenId,
                coord.x,
                coord.y,
                coord.z,
                proof
            );
        require(verifySuccess, "coordinate not match");

        tokenCoordinate[coord.metaverse][tokenId] = coord;
        emit CoordCreated(msg.sender, tokenId, coord.metaverse);
    }

    function getCoordinate(address meta_, uint256 tokenId)
        public
        view
        returns (Coordinate memory)
    {
        return tokenCoordinate[meta_][tokenId];
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
            );
    }

    function setIpsCoordinateVerify(address _ipsCoordinateVerifyAddr)
        public
        onlyOwner
    {
        ipsCoordinateVerifyAddr = _ipsCoordinateVerifyAddr;
    }
}
