// Dados do dicionário
let dictionaryData = []

// Elementos do DOM
const searchInput = document.getElementById('search-input');
const wordList = document.getElementById('word-list');
const wordDetail = document.getElementById('word-detail');
const homeButton = document.getElementById('home-button');

// Função para renderizar a página inicial
function renderHomePage() {
    wordDetail.innerHTML = `
        <div class="definition-home">
                <div class="welcome-message">
                    <h2>Bem-vindo ao Dicionário Visual de Palavras Polissêmicas</h2>
                    <div class="info-box">
                        <i class="fas fa-info-circle"></i>
                        <p>Este site é um dicionário especializado em palavras polissêmicas (com múltiplos significados) desenvolvido para:</p>
                        <ul>
                            <li><i class="fas fa-hand-paper"></i> Comunidade surda</li>
                            <li><i class="fas fa-language"></i> Aprendizes de português como segunda língua</li>
                        </ul>
                    </div>
                </div>
                
                <div class="features">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-book-open"></i>
                        </div>
                        <h3>Palavras Polissêmicas</h3>
                        <p>Explore palavras com múltiplos significados e seus usos em diferentes contextos.</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-video"></i>
                        </div>
                        <h3>Vídeos em LIBRAS</h3>
                        <p>Cada significado acompanhado de vídeo demonstrando o sinal correspondente em LIBRAS.</p>
                    </div>

                </div>
                
                <div class="how-to-use">
                    <h3><i class="fas fa-question-circle"></i> Como usar este dicionário:</h3>
                    <ol>
                        <li>Selecione uma palavra na barra lateral</li>
                        <li>Veja todos os significados da palavra</li>
                        <li>Assista aos vídeos em LIBRAS para cada significado</li>
                    </ol>
                </div>
            </div>
    `;
}

// Função para renderizar a lista de palavras
function renderWordList(words) {
    wordList.innerHTML = '';

    if (words.length === 0) {
        wordList.innerHTML = '<div class="word-item">Nenhuma palavra encontrada</div>';
        return;
    }

    words.forEach(item => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        // Adiciona todos os ícones dos meanings ao lado do título

        wordItem.innerHTML = `
            <span>${item.word}</span>
        `;

        wordItem.addEventListener('click', () => {
            // Remover classe ativa de todos os itens
            document.querySelectorAll('.word-item').forEach(el => {
                el.classList.remove('active');
            });

            // Adicionar classe ativa ao item clicado
            wordItem.classList.add('active');

            // Renderizar os detalhes da palavra
            renderWordDetail(item);
        });

        wordList.appendChild(wordItem);
    });

    // Selecionar a primeira palavra por padrão
    if (words.length > 0) {
        wordList.querySelector('.word-item').classList.add('active');
        renderWordDetail(words[0]);
    }
}

// Função para renderizar os detalhes da palavra
function renderWordDetail(word) {
    const meaningsHtml = word.meanings.map(meaning => `
        <div class="meaning-item">
            <div class="meaning-icon">
                <i class="${meaning.icon}"></i>
            </div>
            <div class="meaning-text">Significado: <br> ${meaning.definition}</div>
            <div class="example">Exemplo: ${meaning.example}</div>
        </div>
    `).join('');
    wordDetail.innerHTML = `
        <div class="word-header">
            <h2 class="word-title">${word.word}</h2>
        </div>
        <div class="meaning-video">
            <video controls width="100%">
                <source src="${word.video}" type="video/mp4">
                Seu navegador não suporta o elemento de vídeo.
            </video>
        </div>
        <div class="meanings-container">
            ${meaningsHtml}
        </div>
    `;
}

// Função para filtrar palavras
function filterWords() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredWords = dictionaryData.filter(item =>
        item.word.toLowerCase().includes(searchTerm)
    );
    renderWordList(filteredWords);
}

// Carregar dados do JSON
fetch('dicionario.json')
    .then(response => {
        if (!response.ok) throw new Error('Erro ao carregar o JSON');
        return response.json();
    })
    .then(data => {
        dictionaryData = data;
        renderWordList(dictionaryData);
        renderHomePage(); // Mostrar página inicial ao carregar
    })
    .catch(error => {
        console.error('Erro ao carregar dados do dicionário:', error);
        wordList.innerHTML = '<div class="word-item">Erro ao carregar dados.</div>';
    });

// Event listeners
searchInput.addEventListener('input', filterWords);

homeButton.addEventListener('click', () => {
    // Limpar seleção atual na lista de palavras
    document.querySelectorAll('.word-item').forEach(el => {
        el.classList.remove('active');
    });

    // Renderizar página inicial
    renderHomePage();
});

// Renderizar a lista de palavras inicialmente
renderWordList(dictionaryData);