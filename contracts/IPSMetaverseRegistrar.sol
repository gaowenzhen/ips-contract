// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract IPSMetaverseRegistrar is Ownable {

    mapping(address => bool) public controllers;
    mapping(address => mapping(uint256 => address)) public metaBinded;
    mapping(address => mapping(uint256 => address)) public metaCreated;
    mapping(address => bool) public beenBinded;
    mapping(address => bool) public beenCreated;
    constructor(address ips_) {
        beenCreated[ips_] = true;
    }

    modifier onlyController() {
        require(controllers[msg.sender]);
        _;
    }
    
    function ownerBind(address metaverse_, bool b) public onlyOwner {
        beenBinded[metaverse_] = b;
    }

    function registerTokenCreate(
        uint256 tokenId,
        address _metaverse,
        address metaverse_
    ) public onlyController {
        metaCreated[_metaverse][tokenId] = metaverse_;
        beenCreated[metaverse_] = true; 
    }

    function registerTokenBind(
        uint256 tokenId,
        address _metaverse,
        address metaverse_
    ) public onlyController {
        metaBinded[_metaverse][tokenId] = metaverse_;
        beenBinded[metaverse_] = true;
    }

    function getTokenMeta(address _metaverse, uint256 tokenId)
        public
        view
        returns (address)
    {
        return
            metaBinded[_metaverse][tokenId] == address(0)
                ? metaCreated[_metaverse][tokenId]
                : metaBinded[_metaverse][tokenId];
    }

    function isCreated(address metaverse_) public view returns (bool) {
        return beenCreated[metaverse_];
    }

    function isBinded(address metaverse_) public view returns (bool) {
        return beenBinded[metaverse_];
    }

    function setControllers(address user_) external onlyOwner {
        controllers[user_] = true;
    }
}
