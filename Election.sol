// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Election {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;
    mapping(address => bool) public voters;
    uint public votingFee = 0.0001 ether;
    
    event Voted(uint indexed candidateId);
    
    constructor() {
        addCandidate("Yusron");
        addCandidate("Rois");
        addCandidate("Cakra");
    }
    
    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }
    
    function vote(uint _candidateId) public payable {
        require(!voters[msg.sender], "Anda sudah memilih");
        require(msg.value == votingFee, "Biaya voting tidak sesuai");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Kandidat tidak valid");
        
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit Voted(_candidateId);
    }
}