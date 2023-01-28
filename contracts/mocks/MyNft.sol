// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../ERC721A.sol";

//only for test
contract MyNFT is Ownable, ERC721A {
    constructor(uint256 maxBatchSize_, uint256 collectionSize_)
        ERC721A("MyNFT", "MyNft", maxBatchSize_, collectionSize_)
    {}

    function mint(uint256 quantity) external {
        _safeMint(msg.sender, quantity);
    }

    // metadata URI
    string private _baseTokenURI;

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
}
