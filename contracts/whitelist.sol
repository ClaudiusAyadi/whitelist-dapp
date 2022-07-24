// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Whitelist {
    // maxWhitelistedAddresses: total number of addresses allowed to be whitelisted
    // numAddressesWhitelisted: current number of whitelisted addresses
    uint8 public maxWhitelistedAddresses;
    uint8 public numAddressesWhitelisted;

    constructor(uint8 _maxWhitelistedAddresses) {
        // allows setting the maxWhitelistedAddresses variable during deployment
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    mapping(address => bool) public whitelistedAddresses;

    function addAddressToWhitelist() public {
        require(
            !whitelistedAddresses[msg.sender],
            "Hurray! You are already in!"
        );
        require(
            numAddressesWhitelisted < maxWhitelistedAddresses,
            "Ooopsss... You came late, whitelisting is over."
        );
        whitelistedAddresses[msg.sender] = true;
        numAddressesWhitelisted += 1;
    }
}
