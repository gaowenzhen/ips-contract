// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// import "hardhat/console.sol";

//verify Coordinate by merkle tree
contract IPSCoordinateVerify is Ownable {
    struct CoordinateLevelDetail {
        uint256 ballLevel;
        bytes32 merkleRootHash;
        uint256 totalSupplyMax;
        string baseURl;
    }

    using EnumerableSet for EnumerableSet.UintSet;
    EnumerableSet.UintSet private levelSet; //Coordinate ballLevel
    mapping(uint256 => CoordinateLevelDetail) public levelDetailOf;

    /**
     * @notice add ballLevel config
     * @param _ballLevel current ballLevel
     * @param _merkleRootHash The root hash of the Merkle tree for all coordinates
     */
    function setBallLevel(
        uint256 _ballLevel,
        bytes32 _merkleRootHash,
        uint256 _totalSupplyMax,
        string memory _baseUrl
    ) external onlyOwner {
        require(_ballLevel > 0, "ballLevel not supported");
        require(_merkleRootHash.length > 0, "check merkleRootHash");
        require(bytes(_baseUrl).length > 0, "check baseUrl");
        require(_totalSupplyMax > 0, "check totalSupplyMax");
        require(!levelSet.contains(_ballLevel), "ballLevel already set");
        levelSet.add(_ballLevel);
        levelDetailOf[_ballLevel] = CoordinateLevelDetail(
            _ballLevel,
            _merkleRootHash,
            _totalSupplyMax,
            _baseUrl
        );
    }

    /**
     * @notice get config of all ballLevel
     * @return resultSize_ total count
     * @return levelList_ list of all ballLevel
     */
    function allBallLevel()
        external
        view
        returns (uint256 resultSize_, CoordinateLevelDetail[] memory levelList_)
    {
        resultSize_ = levelSet.length();
        levelList_ = new CoordinateLevelDetail[](resultSize_);
        if (resultSize_ == 0) return (resultSize_, levelList_);

        for (uint256 i = 0; i < resultSize_; i++) {
            uint256 ballLevel = levelSet.at(i);
            levelList_[i] = levelDetailOf[ballLevel];
        }
    }

    /**
     * @notice get ballLevel detail by ballLevel
     * @param _ballLevel ballLevel
     * @return _detail ballLevel detail
     */
    function getCoordinateLevelDetailByLevel(uint256 _ballLevel)
        external
        view
        returns (CoordinateLevelDetail memory _detail)
    {
        return levelDetailOf[_ballLevel];
    }

    /**
     * @notice Check the validity of coordinates according to Merkel tree
     * @param _ballLevel ballLevel
     * @param _tokenId nft token id
     * @param _x coordinates:(x,y,z)
     * @param _y coordinates:(x,y,z)
     * @param _z coordinates:(x,y,z)
     * @return pass_ true: verify success  false: verify fail
     */
    function verifyCoordinateProof(
        uint256 _ballLevel,
        uint256 _tokenId,
        uint256 _x,
        uint256 _y,
        uint256 _z,
        bytes32[] memory proof
    ) public view returns (bool pass_) {
        require(levelSet.contains(_ballLevel), "invalid ballLevel");
        bytes32 leaf = keccak256(
            abi.encodePacked(_ballLevel, "_", _tokenId, "_", _x, "_", _y, "_", _z)
        );
        return
            MerkleProof.verify(
                proof,
                levelDetailOf[_ballLevel].merkleRootHash,
                leaf
            );
    }
}
