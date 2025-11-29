// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HealthFactRegistry
 * @dev WHO Health Fact on-chain verification registry for Health Fact Guardian
 * @notice Deployed on Somnia Testnet (Chain ID: 50312)
 * 
 * This contract stores cryptographic hashes of WHO-verified health facts,
 * enabling decentralized verification of health claims against trusted sources.
 */
contract HealthFactRegistry {
    
    // ============================================
    // ENUMS
    // ============================================
    
    /// @dev Health claim verdict categories
    enum Verdict {
        TRUE,              // 0 - Claim is scientifically accurate
        FALSE,             // 1 - Claim is scientifically false
        MISLEADING,        // 2 - Claim contains misleading information
        UNPROVEN,          // 3 - Insufficient evidence to verify
        PARTIALLY_TRUE     // 4 - Claim has elements of truth but lacks context
    }
    
    /// @dev Public health impact severity levels
    enum Severity {
        LOW,               // 0 - Minimal health impact
        MEDIUM,            // 1 - Moderate health concern
        HIGH,              // 2 - Significant health risk
        CRITICAL           // 3 - Life-threatening misinformation
    }
    
    /// @dev Lifecycle status of a fact record
    enum Status {
        ACTIVE,            // 0 - Current and valid
        SUPERSEDED,        // 1 - Replaced by newer version
        WITHDRAWN          // 2 - No longer valid/retracted
    }
    
    // ============================================
    // STRUCTS
    // ============================================
    
    /// @dev On-chain representation of a WHO health fact
    struct HealthFact {
        bytes32 factHash;      // SHA-256 hash of canonicalized WHO JSON
        string factId;         // WHO fact ID (e.g., "who-2025-0001")
        Verdict verdict;       // Verification verdict
        Severity severity;     // Public health severity
        uint64 issuedAt;       // Unix timestamp when issued
        uint64 lastReviewedAt; // Unix timestamp of last review
        uint16 version;        // Version number (increments on updates)
        Status status;         // Current lifecycle status
        address addedBy;       // WHO authority address that added this fact
        uint64 addedAtBlock;   // Block number when added
    }
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @dev Contract owner (WHO authority)
    address public owner;
    
    /// @dev Mapping from fact hash to fact record
    mapping(bytes32 => HealthFact) public factsByHash;
    
    /// @dev Mapping from fact ID to fact hash
    mapping(string => bytes32) public hashByFactId;
    
    /// @dev Array of all fact hashes (for enumeration)
    bytes32[] public allFactHashes;
    
    /// @dev Total number of facts registered
    uint256 public totalFacts;
    
    // ============================================
    // EVENTS
    // ============================================
    
    /// @dev Emitted when a new fact is added to the registry
    event FactAdded(
        bytes32 indexed factHash,
        string indexed factId,
        Verdict verdict,
        Severity severity,
        address indexed addedBy,
        uint64 issuedAt
    );
    
    /// @dev Emitted when a fact's status is updated
    event FactUpdated(
        bytes32 indexed factHash,
        string indexed factId,
        Status oldStatus,
        Status newStatus,
        address indexed updatedBy,
        uint64 updatedAt
    );
    
    /// @dev Emitted when contract ownership is transferred
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner,
        uint64 transferredAt
    );
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    /// @dev Restricts function access to contract owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "HealthFactRegistry: caller is not the owner");
        _;
    }
    
    /// @dev Validates that a fact hash doesn't already exist
    modifier factNotExists(bytes32 _factHash) {
        require(
            factsByHash[_factHash].factHash == bytes32(0),
            "HealthFactRegistry: fact already exists"
        );
        _;
    }
    
    /// @dev Validates that a fact hash exists
    modifier factExists(bytes32 _factHash) {
        require(
            factsByHash[_factHash].factHash != bytes32(0),
            "HealthFactRegistry: fact does not exist"
        );
        _;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /// @dev Initializes contract with deployer as owner
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender, uint64(block.timestamp));
    }
    
    // ============================================
    // CORE FUNCTIONS
    // ============================================
    
    /**
     * @notice Adds a new WHO health fact to the registry
     * @dev Only callable by contract owner (WHO authority)
     * @param _factHash SHA-256 hash of the canonicalized WHO JSON fact
     * @param _factId Unique WHO fact identifier (e.g., "who-2025-0001")
     * @param _verdict Verification verdict (0-4 enum)
     * @param _severity Public health severity (0-3 enum)
     * @param _issuedAt Unix timestamp when fact was issued
     * @param _lastReviewedAt Unix timestamp of last review
     * @param _version Version number of this fact
     */
    function addFact(
        bytes32 _factHash,
        string memory _factId,
        Verdict _verdict,
        Severity _severity,
        uint64 _issuedAt,
        uint64 _lastReviewedAt,
        uint16 _version
    ) 
        external 
        onlyOwner 
        factNotExists(_factHash) 
    {
        require(_factHash != bytes32(0), "HealthFactRegistry: invalid fact hash");
        require(bytes(_factId).length > 0, "HealthFactRegistry: empty fact ID");
        require(_version > 0, "HealthFactRegistry: version must be >= 1");
        require(_issuedAt <= block.timestamp, "HealthFactRegistry: future issuedAt timestamp");
        require(_lastReviewedAt >= _issuedAt, "HealthFactRegistry: lastReviewedAt before issuedAt");
        
        // Check if fact ID is already used
        require(
            hashByFactId[_factId] == bytes32(0),
            "HealthFactRegistry: fact ID already exists"
        );
        
        // Create new fact record
        HealthFact memory newFact = HealthFact({
            factHash: _factHash,
            factId: _factId,
            verdict: _verdict,
            severity: _severity,
            issuedAt: _issuedAt,
            lastReviewedAt: _lastReviewedAt,
            version: _version,
            status: Status.ACTIVE,  // New facts are always ACTIVE
            addedBy: msg.sender,
            addedAtBlock: uint64(block.number)
        });
        
        // Store in mappings
        factsByHash[_factHash] = newFact;
        hashByFactId[_factId] = _factHash;
        allFactHashes.push(_factHash);
        totalFacts++;
        
        emit FactAdded(
            _factHash,
            _factId,
            _verdict,
            _severity,
            msg.sender,
            _issuedAt
        );
    }
    
    /**
     * @notice Updates the status of an existing fact
     * @dev Only callable by contract owner (WHO authority)
     * @param _factHash Hash of the fact to update
     * @param _newStatus New status value (ACTIVE, SUPERSEDED, or WITHDRAWN)
     */
    function updateFactStatus(bytes32 _factHash, Status _newStatus) 
        external 
        onlyOwner 
        factExists(_factHash) 
    {
        HealthFact storage fact = factsByHash[_factHash];
        Status oldStatus = fact.status;
        
        require(oldStatus != _newStatus, "HealthFactRegistry: status unchanged");
        
        fact.status = _newStatus;
        
        emit FactUpdated(
            _factHash,
            fact.factId,
            oldStatus,
            _newStatus,
            msg.sender,
            uint64(block.timestamp)
        );
    }
    
    /**
     * @notice Retrieves a fact record by its hash
     * @param _factHash Hash of the fact to retrieve
     * @return Complete HealthFact struct
     */
    function getFactByHash(bytes32 _factHash) 
        external 
        view 
        factExists(_factHash) 
        returns (HealthFact memory) 
    {
        return factsByHash[_factHash];
    }
    
    /**
     * @notice Retrieves a fact record by its WHO fact ID
     * @param _factId WHO fact ID (e.g., "who-2025-0001")
     * @return Complete HealthFact struct
     */
    function getFactById(string memory _factId) 
        external 
        view 
        returns (HealthFact memory) 
    {
        bytes32 factHash = hashByFactId[_factId];
        require(factHash != bytes32(0), "HealthFactRegistry: fact ID not found");
        return factsByHash[factHash];
    }
    
    /**
     * @notice Checks if a fact exists for a given hash
     * @param _factHash Hash to check
     * @return exists True if fact exists, false otherwise
     * @return status Status of the fact if it exists
     */
    function checkFactExists(bytes32 _factHash) 
        external 
        view 
        returns (bool exists, Status status) 
    {
        HealthFact memory fact = factsByHash[_factHash];
        exists = (fact.factHash != bytes32(0));
        status = fact.status;
    }
    
    /**
     * @notice Retrieves all fact hashes (for off-chain indexing)
     * @return Array of all fact hashes
     */
    function getAllFactHashes() external view returns (bytes32[] memory) {
        return allFactHashes;
    }
    
    /**
     * @notice Transfers ownership of the contract to a new WHO authority
     * @dev Only callable by current owner
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "HealthFactRegistry: new owner is zero address");
        require(_newOwner != owner, "HealthFactRegistry: new owner is current owner");
        
        address oldOwner = owner;
        owner = _newOwner;
        
        emit OwnershipTransferred(oldOwner, _newOwner, uint64(block.timestamp));
    }
    
    // ============================================
    // VIEW HELPERS
    // ============================================
    
    /**
     * @notice Gets verdict as string for easier off-chain consumption
     * @param _verdict Verdict enum value
     * @return Verdict as string
     */
    function verdictToString(Verdict _verdict) external pure returns (string memory) {
        if (_verdict == Verdict.TRUE) return "true";
        if (_verdict == Verdict.FALSE) return "false";
        if (_verdict == Verdict.MISLEADING) return "misleading";
        if (_verdict == Verdict.UNPROVEN) return "unproven";
        if (_verdict == Verdict.PARTIALLY_TRUE) return "partially_true";
        return "unknown";
    }
    
    /**
     * @notice Gets severity as string for easier off-chain consumption
     * @param _severity Severity enum value
     * @return Severity as string
     */
    function severityToString(Severity _severity) external pure returns (string memory) {
        if (_severity == Severity.LOW) return "low";
        if (_severity == Severity.MEDIUM) return "medium";
        if (_severity == Severity.HIGH) return "high";
        if (_severity == Severity.CRITICAL) return "critical";
        return "unknown";
    }
    
    /**
     * @notice Gets status as string for easier off-chain consumption
     * @param _status Status enum value
     * @return Status as string
     */
    function statusToString(Status _status) external pure returns (string memory) {
        if (_status == Status.ACTIVE) return "active";
        if (_status == Status.SUPERSEDED) return "superseded";
        if (_status == Status.WITHDRAWN) return "withdrawn";
        return "unknown";
    }
}
