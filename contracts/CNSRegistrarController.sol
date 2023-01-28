// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract CNSRegistrarController is ERC721Enumerable, Ownable {
    using SafeMath for uint256;

    // A map of expiry times
    mapping(uint256 => uint256) public expiries;
    mapping(uint256 => string) public tokenName;
    uint256 public GRACE_PERIOD = 90 days;
    uint256 public MIN_REGISTRATION_DURATION = 30 days;
    uint256 public MIN_PRICE = 0.001 ether;

    event NameRegistered(
        uint256 indexed id,
        address indexed owner,
        uint256 expires
    );
    event NameRenewed(uint256 indexed id, uint256 expires);

    constructor()
        ERC721("coordinate name service", "CNS")
    {}

    /**
     * @dev Gets the owner of the specified token ID. Names become unowned
     *      when their registration expires.
     * @param tokenId uint256 ID of the token to query the owner of
     * @return address currently marked as the owner of the given token ID
     */
    function ownerOf(uint256 tokenId) public view override returns (address) {
        require(expiries[tokenId] > block.timestamp);
        return super.ownerOf(tokenId);
    }

    function ownerOf(string memory name) public view returns (address) {
        bytes32 label = keccak256(bytes(name));
        uint256 tokenId = uint256(label);
        return ownerOf(tokenId);
    }

    function nameExpires(string memory name) public view returns (uint256) {
        bytes32 label = keccak256(bytes(name));
        uint256 tokenId = uint256(label);
        return expiries[tokenId];
    }

    function valid(string memory name) public pure returns (bool) {
        return strlen(name) >= 3;
    }

    // Returns true iff the specified name is available for registration.
    function available(uint256 id) public view returns (bool) {
        // Not available if it's registered here or in its grace period.
        return expiries[id] + GRACE_PERIOD < block.timestamp;
    }

    function available(string memory name) public view returns (bool) {
        bytes32 label = keccak256(bytes(name));
        return valid(name) && available(uint256(label));
    }

    function registerWithConfig(
        string memory name,
        uint256 duration
    ) public payable {
        uint256 cost = _consumeCommitment(name, duration);
        require(msg.value >= cost, "Need to send more ETH.");
        bytes32 label = keccak256(bytes(name));
        uint256 tokenId = uint256(label);
        tokenName[tokenId] = name;
        uint256 expires;
        expires = _register(tokenId, msg.sender, duration);
        // Refund any extra payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }

    function _register(
        uint256 id,
        address owner,
        uint256 duration
    ) internal returns (uint256) {
        require(available(id));
        expiries[id] =
            block.timestamp +
            duration.mul(MIN_REGISTRATION_DURATION);
        if (_exists(id)) {
            // Name was previously owned, and expired
            _burn(id);
        }
        _mint(owner, id);
        emit NameRegistered(id, owner, block.timestamp + duration);

        return block.timestamp + duration.mul(MIN_REGISTRATION_DURATION);
    }

    function renew(string memory name, uint256 duration) public payable returns (uint256) {
        
        uint256 cost = price(name, duration);
        require(msg.value >= cost, "Need to send more ETH.");
        bytes32 label = keccak256(bytes(name));
        uint256 tokenId = uint256(label);
        require(expiries[tokenId] > 0, "not registed");
        expiries[tokenId] += duration.mul(MIN_REGISTRATION_DURATION);

        // Refund any extra payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        emit NameRenewed(tokenId, expiries[tokenId]);
        return expiries[tokenId];
    }

    function strlen(string memory s) internal pure returns (uint256) {
        uint256 len;
        uint256 i = 0;
        uint256 bytelength = bytes(s).length;
        for (len = 0; i < bytelength; len++) {
            bytes1 b = bytes(s)[i];
            if (b < 0x80) {
                i += 1;
            } else if (b < 0xE0) {
                i += 2;
            } else if (b < 0xF0) {
                i += 3;
            } else if (b < 0xF8) {
                i += 4;
            } else if (b < 0xFC) {
                i += 5;
            } else {
                i += 6;
            }
        }
        return len;
    }

    function _consumeCommitment(string memory name, uint256 duration)
        internal
        returns (uint256)
    {
        require(available(name));
        uint256 cost = price(name, duration);
        require(duration >= 1);
        require(msg.value >= cost);
        return cost;
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
    //价格计算 MIN_PRICE = 0.001ETH
    function price(string memory name, uint256 duration)
        public
        view
        returns (uint256)
    {
        uint256 len = strlen(name);
        if (len == 3) {
            return duration.mul(16).mul(MIN_PRICE); //3个字符 每个月16 * MIN_PRICE
        } else if (len == 4) {
            return duration.mul(4).mul(MIN_PRICE); //4个字符 每个月4 *MIN_PRICE
        } else {
            return duration.mul(MIN_PRICE); //大于4个字符 每个月MIN_PRICE
        }
    }
}
