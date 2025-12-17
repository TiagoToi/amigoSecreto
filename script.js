// Variáveis globais
let participants = [];
let shuffledList = [];

// Carrega os dados do servidor
async function loadGameData() {
    try {
        const response = await fetch('/api/game-data');
        const data = await response.json();
        participants = data.participants;
        shuffledList = data.shuffledList;
        renderPersonList();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Salva os dados no servidor
async function saveGameData() {
    try {
        await fetch('/api/game-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                participants: participants,
                shuffledList: shuffledList
            })
        });
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

function renderPersonList() {
    const listContainer = document.getElementById('personList');
    listContainer.innerHTML = '';
    
    participants.forEach((person, index) => {
        const button = document.createElement('button');
        button.className = 'person-btn';
        button.textContent = person.name;
        button.id = `person-${index}`;
        
        if (person.hasViewed) {
            button.classList.add('selected');
            button.disabled = true;
            button.textContent = person.name + ' ✓';
        } else {
            button.onclick = () => selectPerson(person, index);
        }
        
        listContainer.appendChild(button);
    });
}

async function selectPerson(person, originalIndex) {
    // Marca como visualizado
    participants[originalIndex].hasViewed = true;
    
    // Salva no servidor
    await saveGameData();
    
    // Encontra quem essa pessoa deve presentear
    const shuffledIndex = shuffledList.indexOf(person.name);
    const nextIndex = (shuffledIndex + 1) % shuffledList.length;
    const giftTo = shuffledList[nextIndex];
    
    // Mostra o resultado
    showResult(giftTo);
}

function showResult(giftToName) {
    document.getElementById('selectionScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    document.getElementById('giftToName').textContent = giftToName;
}

function backToSelection() {
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('selectionScreen').classList.remove('hidden');
    renderPersonList();
}

// Inicializa o jogo quando a página carrega
loadGameData();