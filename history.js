const contractAddress = "0x1e85e51A4681C9224814186f5EF3853AFf8A2220";
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
            await loadABI();
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
                TX: ${event.transactionHash}
            </p>
        </div>
    `).join('');
}

async function loadEventLogs() {
    const logsDiv = document.getElementById("eventLogs");
    
    const voteEvents = await electionContract.getPastEvents('Voted', {
        fromBlock: 0,
        toBlock: 'latest'
    });
    
    const allEvents = voteEvents.sort((a, b) => b.blockNumber - a.blockNumber);
    
    logsDiv.innerHTML = allEvents.map(event => {
        const eventDescription = `Pemilih ${event.transactionHash.slice(0, 15)}... memilih kandidat ${event.returnValues.candidateId}`;
        
        return `
            <div class="border-l-4 border-green-500 pl-2 mb-2">
                <p class="font-semibold">${event.event}</p>
                <p class="text-sm text-gray-600">${eventDescription}</p>
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