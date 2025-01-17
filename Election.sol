// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Election {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        bool exists;
    }
    
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;
    address public admin;
    mapping(address => bool) public voters;
    uint public votingFee = 0.0001 ether;
    string private adminPassword;
    
    event Voted(uint indexed candidateId);
    event CandidateAdded(uint indexed candidateId, string name);
    event CandidateRemoved(uint indexed candidateId);
    
    constructor() {
        admin = msg.sender;
        adminPassword = "admin";
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Hanya admin yang dapat melakukan ini");
        _;
    }
    
    function validateAdminPassword(string memory _password) public view returns(bool) {
        return keccak256(abi.encodePacked(_password)) == keccak256(abi.encodePacked(adminPassword));
    }
    
    function addCandidate(string memory _name, string memory _password) public onlyAdmin {
        require(validateAdminPassword(_password), "Password admin salah");
        require(candidatesCount < 5, "Jumlah maksimum kandidat adalah 5");
        require(candidatesCount >= 1, "Jumlah minimum kandidat adalah 2");
        
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0, true);
        emit CandidateAdded(candidatesCount, _name);
    }
    
    function removeCandidate(uint _candidateId, string memory _password) public onlyAdmin {
        require(validateAdminPassword(_password), "Password admin salah");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Kandidat tidak ditemukan");
        require(candidates[_candidateId].exists, "Kandidat sudah dihapus");
        require(candidatesCount > 2, "Jumlah minimum kandidat adalah 2");
        
        candidates[_candidateId].exists = false;
        emit CandidateRemoved(_candidateId);
    }
    
    function vote(uint _candidateId) public payable {
        require(!voters[msg.sender], "Anda sudah memilih");
        require(msg.value == votingFee, "Biaya voting tidak sesuai");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Kandidat tidak valid");
        require(candidates[_candidateId].exists, "Kandidat sudah dihapus");
        
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit Voted(_candidateId);
    }
}