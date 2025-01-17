const contractAddress = "BUTUH SEPOLIA ETH BUAT DEPLOY TESTNET WAKKK";
const contractABI = "./abi.json";
let electionContract;
let accounts;

window.addEventListener("load", async () => {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();
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
    
    const admin = await electionContract.methods.admin().call();
    if (accounts[0].toLowerCase() === admin.toLowerCase()) {
        document.getElementById('adminPanel').classList.remove('hidden');
    }
}

async function renderCandidates() {
    const candidatesDiv = document.getElementById("candidates");
    candidatesDiv.innerHTML = '';
    const candidatesCount = await electionContract.methods.candidatesCount().call();
    
    for (let i = 1; i <= candidatesCount; i++) {
        const candidate = await electionContract.methods.candidates(i).call();
        if (candidate.exists) {
            candidatesDiv.innerHTML += `
                <div class="p-4 bg-white rounded shadow mb-4">
                    <h3 class="text-xl">${candidate.name}</h3>
                    <p>Vote Count: ${candidate.voteCount}</p>
                    <button onclick="vote(${candidate.id})" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Vote</button>
                </div>
            `;
        }
    }
}

async function addCandidate() {
    const name = document.getElementById('candidateName').value;
    const password = document.getElementById('adminPassword').value;
    
    if (password !== "admin") {
        alert("Password admin salah!");
        return;
    }
    
    try {
        await electionContract.methods.addCandidate(name, password).send({
            from: accounts[0]
        });
        alert("Kandidat berhasil ditambahkan!");
        renderCandidates();
        document.getElementById('candidateName').value = '';
        document.getElementById('adminPassword').value = '';
    } catch (error) {
        alert(error.message);
    }
}

async function removeCandidate() {
    const candidateId = document.getElementById('candidateId').value;
    const password = document.getElementById('adminPasswordRemove').value;
    
    if (password !== "admin") {
        alert("Password admin salah!");
        return;
    }
    
    try {
        await electionContract.methods.removeCandidate(candidateId, password).send({
            from: accounts[0]
        });
        alert("Kandidat berhasil dihapus!");
        renderCandidates();
        document.getElementById('candidateId').value = '';
        document.getElementById('adminPasswordRemove').value = '';
    } catch (error) {
        alert(error.message);
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
