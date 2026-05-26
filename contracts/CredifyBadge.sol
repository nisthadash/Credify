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
 *         Supports multiple events using uint256 representation of event IDs.
 */
contract CredifyBadge is ERC721URIStorage, Ownable {
    
    // Incremental counter for unique token IDs
    uint256 private _tokenIdCounter;

    // Tiers mapping: user address => eventId => tier level (0: Pass, 1: Participant, 2: Finalist, 3: Winner, 4: Mentor)
    mapping(address => mapping(uint256 => uint8)) public userTier;

    // Whitelist eligibility mapping: user address => eventId => is whitelisted
    mapping(address => mapping(uint256 => bool)) public isEligible;

    // Token ID mapping: user address => eventId => token ID owned
    mapping(address => mapping(uint256 => uint256)) public userTokenId;

    // Claimed tracking mapping: user address => eventId => has claimed credential
    mapping(address => mapping(uint256 => bool)) public hasClaimed;

    // Revocation mapping: user address => eventId => is revoked
    mapping(address => mapping(uint256 => bool)) public isRevoked;

    // Events emitted during major status transitions
    event CredentialClaimed(uint256 indexed tokenId, address indexed recipient, uint256 indexed eventId, string tokenURI);
    event CredentialUpgraded(uint256 indexed tokenId, address indexed recipient, uint256 indexed eventId, uint8 oldTier, uint8 newTier, string tokenURI);
    event WhitelistUpdated(address indexed user, uint256 indexed eventId, bool eligible);
    event CredentialRevoked(uint256 indexed tokenId, address indexed user, uint256 indexed eventId);

    /**
     * @notice Constructor initializes the ERC-721 token details
     * @param initialOwner Address of the organizer deployment account who owns admin rights
     */
    constructor(address initialOwner) ERC721("CredifyBadge", "CRED") Ownable(initialOwner) {}

    /**
     * @notice Whitelists a user wallet address to claim their initial credential pass for a specific event.
     *         Only the organizer (contract owner) can call this.
     * @param user The wallet address of the participant to whitelist
     * @param eventId The uint256 representation of the event ID
     */
    function addEligible(address user, uint256 eventId) external onlyOwner {
        isEligible[user][eventId] = true;
        emit WhitelistUpdated(user, eventId, true);
    }

    /**
     * @notice Whitelists multiple user wallet addresses in a single bulk transaction for a specific event.
     * @param users Array of wallet addresses to whitelist
     * @param eventId The uint256 representation of the event ID
     */
    function addEligibleBulk(address[] calldata users, uint256 eventId) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            isEligible[users[i]][eventId] = true;
            emit WhitelistUpdated(users[i], eventId, true);
        }
    }

    /**
     * @notice Removes a user wallet address from the whitelist eligibility for a specific event.
     * @param user The wallet address to remove
     * @param eventId The uint256 representation of the event ID
     */
    function removeEligible(address user, uint256 eventId) external onlyOwner {
        isEligible[user][eventId] = false;
        emit WhitelistUpdated(user, eventId, false);
    }

    /**
     * @notice Claims the initial event pass (Tier 0).
     *         The calling wallet must be whitelisted and not already have claimed for this event.
     * @param eventId The uint256 representation of the event ID
     * @param tokenURI The metadata URL hosted by the Credify backend
     */
    function claimPass(uint256 eventId, string memory tokenURI) external {
        require(isEligible[msg.sender][eventId], "Credify: Wallet address is not whitelisted for this event");
        require(!hasClaimed[msg.sender][eventId], "Credify: Wallet has already claimed a credential for this event");

        uint256 id = _tokenIdCounter;
        _tokenIdCounter++;

        // Mint the ERC-721 token
        _mint(msg.sender, id);
        _setTokenURI(id, tokenURI);

        // Record locally
        userTokenId[msg.sender][eventId] = id;
        userTier[msg.sender][eventId] = 0; // Tier 0: Event Pass
        hasClaimed[msg.sender][eventId] = true;

        emit CredentialClaimed(id, msg.sender, eventId, tokenURI);
    }

    /**
     * @notice Upgrades the credential tier of a user for a specific event.
     *         Only the organizer (contract owner) can call this.
     * @param user The wallet address of the credential holder
     * @param eventId The uint256 representation of the event ID
     * @param tier The new tier level (0 to 4)
     * @param uri The new updated metadata URL hosted by the Credify backend
     */
    function upgradeTier(address user, uint256 eventId, uint8 tier, string memory uri) external onlyOwner {
        require(hasClaimed[user][eventId], "Credify: Recipient has not claimed an initial credential for this event yet");
        require(!isRevoked[user][eventId], "Credify: Cannot upgrade a revoked credential");
        require(tier > userTier[user][eventId], "Credify: Can only upgrade to a higher tier");
        require(tier <= 4, "Credify: Invalid tier level. Max tier is 4");

        uint8 oldTier = userTier[user][eventId];
        uint256 tokenId = userTokenId[user][eventId];

        // Update URI and tier record
        _setTokenURI(tokenId, uri);
        userTier[user][eventId] = tier;

        emit CredentialUpgraded(tokenId, user, eventId, oldTier, tier, uri);
    }

    /**
     * @notice Revokes a user's credential.
     *         Only the organizer (contract owner) can call this.
     * @param user The wallet address of the credential holder
     * @param eventId The uint256 representation of the event ID
     */
    function revokeCredential(address user, uint256 eventId) external onlyOwner {
        require(hasClaimed[user][eventId], "Credify: Recipient has no credential to revoke");
        require(!isRevoked[user][eventId], "Credify: Credential already revoked");
        
        isRevoked[user][eventId] = true;
        uint256 tokenId = userTokenId[user][eventId];
        
        emit CredentialRevoked(tokenId, user, eventId);
    }

    /**
     * @notice Public read helper to fetch the complete credential state of a wallet for a specific event
     * @param user The wallet address to query
     * @param eventId The uint256 representation of the event ID
     * @return tokenId The token ID owned (if claimed)
     * @return tier The current progression tier level
     * @return claimed True if the wallet has successfully claimed a pass
     * @return revoked True if the credential was revoked
     */
    function getCredential(address user, uint256 eventId) external view returns (uint256 tokenId, uint8 tier, bool claimed, bool revoked) {
        return (userTokenId[user][eventId], userTier[user][eventId], hasClaimed[user][eventId], isRevoked[user][eventId]);
    }
}
