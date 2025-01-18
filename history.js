const contractAddress = "0xd59586c1330CaCDeAbFc131BF8803684ACffC8de";
let contractABI;
let electionContract;
let accounts;

async function loadABI() {
    const response = await fetch('./abi.json');
    contractABI = await response.json();
}

window.addEventListener("load", async () => {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();
            initHistory();
        } catch (error) {
            console.error("Akses ke akun ditolak");
        }
    } else {
        console.error("Metamask tidak terdeteksi");
    }
});

async function initHistory() {
    accounts = await web3.eth.getAccounts();
    electionContract = new web3.eth.Contract(contractABI, contractAddress);
    
    await Promise.all([
        loadTransactionHistory(),
        loadVotingStatistics(),
        loadEventLogs()
    ]);
}

async function loadTransactionHistory() {
    const transactionDiv = document.getElementById("transactionHistory");
    const latestBlock = await web3.eth.getBlockNumber();
    const events = await electionContract.getPastEvents('allEvents', {
        fromBlock: latestBlock - 1000,
        toBlock: 'latest'
    });
    
    events.sort((a, b) => b.blockNumber - a.blockNumber);
    
    transactionDiv.innerHTML = events.map(event => `
        <div class="border-l-4 border-blue-500 pl-2">
            <p class="font-semibold">${event.event}</p>
            <p class="text-sm text-gray-600">
                Block: ${event.blockNumber}<br>
                TX: ${event.transactionHash.slice(0, 10)}...
            </p>
        </div>
    `).join('');
}

async function loadVotingStatistics() {
    const statsDiv = document.getElementById("votingStats");
    const resultsDiv = document.getElementById("candidateResults");
    const totalVotersElement = document.getElementById("totalVoters");
    
    const candidatesCount = await electionContract.methods.candidatesCount().call();
    
    let totalVotes = 0;
    let candidateResults = [];
    
    for (let i = 1; i <= candidatesCount; i++) {
        const candidate = await electionContract.methods.candidates(i).call();
        if (candidate.exists) {
            totalVotes += parseInt(candidate.voteCount);
            candidateResults.push({
                name: candidate.name,
                votes: candidate.voteCount
            });
        }
    }
    
    resultsDiv.innerHTML = candidateResults.map(candidate => `
        <div class="mb-2">
            <p class="font-medium">${candidate.name}</p>
            <div class="w-full bg-gray-200 rounded">
                <div class="bg-blue-500 text-white text-xs leading-none py-1 text-center rounded" 
                     style="width: ${(candidate.votes / totalVotes * 100).toFixed(2)}%">
                    ${candidate.votes} votes (${(candidate.votes / totalVotes * 100).toFixed(2)}%)
                </div>
            </div>
        </div>
    `).join('');
    
    totalVotersElement.textContent = totalVotes;
}

async function loadEventLogs() {
    const logsDiv = document.getElementById("eventLogs");
    
    const voteEvents = await electionContract.getPastEvents('Voted', {
        fromBlock: 0,
        toBlock: 'latest'
    });
    
    const addEvents = await electionContract.getPastEvents('CandidateAdded', {
        fromBlock: 0,
        toBlock: 'latest'
    });
    
    const removeEvents = await electionContract.getPastEvents('CandidateRemoved', {
        fromBlock: 0,
        toBlock: 'latest'
    });
    
    const allEvents = [...voteEvents, ...addEvents, ...removeEvents]
        .sort((a, b) => b.blockNumber - a.blockNumber);
    
    logsDiv.innerHTML = allEvents.map(event => {
        let eventDescription = '';
        switch(event.event) {
            case 'Voted':
                eventDescription = `Vote cast for Candidate #${event.returnValues.candidateId}`;
                break;
            case 'CandidateAdded':
                eventDescription = `Candidate "${event.returnValues.name}" added with ID #${event.returnValues.candidateId}`;
                break;
            case 'CandidateRemoved':
                eventDescription = `Candidate #${event.returnValues.candidateId} removed`;
                break;
        }
        
        return `
            <div class="border-l-4 ${event.event === 'Voted' ? 'border-green-500' : 
                                   event.event === 'CandidateAdded' ? 'border-blue-500' : 
                                   'border-red-500'} pl-2 mb-2">
                <p class="font-semibold">${event.event}</p>
                <p>${eventDescription}</p>
                <p class="text-sm text-gray-600">
                    Block: ${event.blockNumber}<br>
                    Transaction: ${event.transactionHash.slice(0, 10)}...
                </p>
            </div>
        `;
    }).join('');
}

setInterval(async () => {
    await Promise.all([
        loadTransactionHistory(),
        loadVotingStatistics(),
        loadEventLogs()
    ]);
}, 30000);