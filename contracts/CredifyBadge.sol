// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CredifyBadge
 * @author Numaan Bin Husain
 * @notice An ERC-721 credential token designed for event tracking and progression.
 *         Allows whitelisted users to claim an event pass gaslessly, and allows 
 *         the event organizer to upgrade the pass through tiers.
 */
contract CredifyBadge is ERC721URIStorage, Ownable {
    
    // Incremental counter for unique token IDs
    uint256 private _tokenIdCounter;

    // Tiers mapping: user address => tier level (0: Pass, 1: Participant, 2: Finalist, 3: Winner, 4: Mentor)
    mapping(address => uint8) public userTier;

    // Whitelist eligibility mapping: user address => is whitelisted
    mapping(address => bool) public isEligible;

    // Token ID mapping: user address => token ID owned
    mapping(address => uint256) public userTokenId;

    // Claimed tracking mapping: user address => has claimed credential
    mapping(address => bool) public hasClaimed;

    // Events emitted during major lifecycle status transitions
    event CredentialClaimed(uint256 indexed tokenId, address indexed recipient, string tokenURI);
    event CredentialUpgraded(uint256 indexed tokenId, address indexed recipient, uint8 oldTier, uint8 newTier, string tokenURI);
    event WhitelistUpdated(address indexed user, bool eligible);

    /**
     * @notice Constructor initializes the ERC-721 token details
     * @param initialOwner Address of the organizer deployment account who owns admin rights
     */
    constructor(address initialOwner) ERC721("CredifyBadge", "CRED") Ownable(initialOwner) {}

    /**
     * @notice Whitelists a user wallet address to claim their initial credential pass.
     *         Only the organizer (contract owner) can call this.
     * @param user The wallet address of the participant to whitelist
     */
    function addEligible(address user) external onlyOwner {
        isEligible[user] = true;
        emit WhitelistUpdated(user, true);
    }

    /**
     * @notice Whitelists multiple user wallet addresses in a single bulk transaction.
     * @param users Array of wallet addresses to whitelist
     */
    function addEligibleBulk(address[] calldata users) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            isEligible[users[i]] = true;
            emit WhitelistUpdated(users[i], true);
        }
    }

    /**
     * @notice Removes a user wallet address from the whitelist eligibility.
     * @param user The wallet address to remove
     */
    function removeEligible(address user) external onlyOwner {
        isEligible[user] = false;
        emit WhitelistUpdated(user, false);
    }

    /**
     * @notice Claims the initial event pass (Tier 0).
     *         The calling wallet must be whitelisted and not already have claimed.
     * @param tokenURI The metadata URL hosted by the Credify backend
     */
    function claimPass(string memory tokenURI) external {
        require(isEligible[msg.sender], "Credify: Wallet address is not whitelisted");
        require(!hasClaimed[msg.sender], "Credify: Wallet has already claimed a credential");

        uint256 id = _tokenIdCounter;
        _tokenIdCounter++;

        // Mint the ERC-721 token
        _mint(msg.sender, id);
        _setTokenURI(id, tokenURI);

        // Record locally
        userTokenId[msg.sender] = id;
        userTier[msg.sender] = 0; // Tier 0: Event Pass
        hasClaimed[msg.sender] = true;

        emit CredentialClaimed(id, msg.sender, tokenURI);
    }

    /**
     * @notice Upgrades the credential tier of a user.
     *         Only the organizer (contract owner) can call this.
     * @param user The wallet address of the credential holder
     * @param tier The new tier level (0 to 4)
     * @param uri The new updated metadata URL hosted by the Credify backend
     */
    function upgradeTier(address user, uint8 tier, string memory uri) external onlyOwner {
        require(hasClaimed[user], "Credify: Recipient has not claimed an initial credential yet");
        require(tier > userTier[user], "Credify: Can only upgrade to a higher tier");
        require(tier <= 4, "Credify: Invalid tier level. Max tier is 4");

        uint8 oldTier = userTier[user];
        uint256 tokenId = userTokenId[user];

        // Update URI and tier record
        _setTokenURI(tokenId, uri);
        userTier[user] = tier;

        emit CredentialUpgraded(tokenId, user, oldTier, tier, uri);
    }

    /**
     * @notice Public read helper to fetch the complete credential state of a wallet
     * @param user The wallet address to query
     * @return tokenId The token ID owned (if claimed)
     * @return tier The current progression tier level
     * @return claimed True if the wallet has successfully claimed a pass
     */
    function getCredential(address user) external view returns (uint256 tokenId, uint8 tier, bool claimed) {
        return (userTokenId[user], userTier[user], hasClaimed[user]);
    }
}
