// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DevToken.sol";

contract DevTokenTest is Test {
    DevToken token;
    address user = address(0x1);

    function setUp() public {
        token = new DevToken();
    }

    function testInitialSupplyAssigned() public {
        assertEq(token.totalSupply(), 1_000_000e18);
        assertEq(token.balanceOf(address(this)), 1_000_000e18);
    }

    function testTransfer() public {
        token.transfer(user, 100e18);
        assertEq(token.balanceOf(user), 100e18);
    }

    function testApproveAndTransferFrom() public {
        token.approve(user, 50e18);

        vm.prank(user);
        token.transferFrom(address(this), user, 50e18);

        assertEq(token.balanceOf(user), 50e18);
    }

    function testFaucet() public {
        vm.prank(user);
        bool success = token.faucet();
        
        assertTrue(success);
        assertEq(token.balanceOf(user), 100e18);
    }

    function testFaucetCooldown() public {
        vm.prank(user);
        token.faucet();

        // Try to claim again immediately, should fail
        vm.prank(user);
        vm.expectRevert("faucet cooldown active");
        token.faucet();

        // Fast forward 24 hours
        vm.warp(block.timestamp + 24 hours + 1);

        // Should work now
        vm.prank(user);
        bool success = token.faucet();
        assertTrue(success);
        assertEq(token.balanceOf(user), 200e18);
    }
}
