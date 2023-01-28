// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IPS.sol";
import "./IPSMetaverseRegistrar.sol";
import "./IPSCoordinateVerify.sol";

contract IPSNFTFactory is Ownable {
    // address public immutable IPSNFT;
    address public immutable IpsRegistrar;
    address public ipsCoordinateVerifyAddr;

    // constructor(address ips_, address registrar_) {
    //     IPSNFT = ips_;
    //     IpsRegistrar = registrar_;
    // }

    constructor(address registrar_, address _ipsCoordinateVerify) {
        IpsRegistrar = registrar_;
        ipsCoordinateVerifyAddr = _ipsCoordinateVerify;
    }

    event Created(address indexed user, uint256 tokenId, address nft);
    event Binded(address indexed user, uint256 tokenId, address nft);

    struct CreateConfig {
        string name;
        string symbol;
        uint256 amountForAuction;
        uint256 maxBatchSize;
        uint256 ballLevel;
        uint256 tokenId;
        address metaverse;
    }

    function createMetaverse(CreateConfig memory config)
        external
        NotUsed(config.metaverse, config.tokenId)
    {
        require(
            IERC721(config.metaverse).ownerOf(config.tokenId) == msg.sender,
            "not nft owner"
        );
        require(
            IPSMetaverseRegistrar(IpsRegistrar).isCreated(config.metaverse),
            "not created"
        );

        (
            ,
            ,
            uint256 totalSupplyMax,
            string memory baseURl
        ) = IPSCoordinateVerify(ipsCoordinateVerifyAddr).levelDetailOf(
                config.ballLevel
            );

        bytes memory bytecode = abi.encodePacked(
            type(IPS).creationCode,
            abi.encode(
                config.ballLevel,
                baseURl,
                config.maxBatchSize,
                totalSupplyMax,
                config.amountForAuction,
                config.name,
                config.symbol
            )
        );
        bytes32 salt = keccak256(
            abi.encodePacked(msg.sender, config.name, config.symbol)
        );
        address nft = Create2.deploy(0, salt, bytecode);
        IPSMetaverseRegistrar(IpsRegistrar).registerTokenCreate(
            config.tokenId,
            config.metaverse,
            nft
        );
        IPS(nft).transferOwnership(msg.sender);
        emit Created(msg.sender, config.tokenId, nft);
    }

    function bind(
        uint256 tokenId,
        address _metaverse,
        address metaverse_
    ) external NotUsed(_metaverse, tokenId) {
        require(
            IERC721(_metaverse).ownerOf(tokenId) == msg.sender,
            "not nft owner"
        );
        require(
            IPSMetaverseRegistrar(IpsRegistrar).isCreated(_metaverse),
            "not created"
        );
        require(
            !IPSMetaverseRegistrar(IpsRegistrar).isCreated(metaverse_),
            "is created"
        );
        require(
            !IPSMetaverseRegistrar(IpsRegistrar).beenBinded(metaverse_),
            "been binded"
        );
        IPSMetaverseRegistrar(IpsRegistrar).registerTokenBind(
            tokenId,
            _metaverse,
            metaverse_
        );
        emit Binded(msg.sender, tokenId, metaverse_);
    }

    modifier NotUsed(address _metaverse, uint256 tokenId) {
        require(
            IPSMetaverseRegistrar(IpsRegistrar).getTokenMeta(
                _metaverse,
                tokenId
            ) == address(0),
            "ALREADY USED"
        );
        _;
    }
}
