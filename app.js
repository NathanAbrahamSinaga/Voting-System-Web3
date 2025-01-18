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
            initApp();
        } catch (error) {
            console.error("Akses ke akun ditolak");
        }
    } else {
        console.error("Metamask tidak terdeteksi");
    }
});

async function initApp() {
    accounts = await web3.eth.getAccounts();
    electionContract = new web3.eth.Contract(contractABI, contractAddress);
    renderCandidates();
}

async function renderCandidates() {
    const candidatesDiv = document.getElementById("candidates");
    candidatesDiv.innerHTML = '';
    const candidatesCount = await electionContract.methods.candidatesCount().call();
    
    for (let i = 1; i <= candidatesCount; i++) {
        const candidate = await electionContract.methods.candidates(i).call();
        candidatesDiv.innerHTML += `
            <div class="p-4 bg-white rounded shadow mb-4">
                <h3 class="text-xl">${candidate.name}</h3>
                <p>Vote Count: ${candidate.voteCount}</p>
                <button onclick="vote(${candidate.id})" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Vote</button>
            </div>
        `;
    }
}

async function vote(candidateId) {
    try {
        await electionContract.methods.vote(candidateId).send({
            from: accounts[0],
            value: web3.utils.toWei("0.0001", "ether"),
        });
        alert("Vote berhasil!");
        renderCandidates();
    } catch (error) {
        alert(error.message);
    }
}