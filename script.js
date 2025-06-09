document.addEventListener('DOMContentLoaded', () => {
    const startNodeSelect = document.getElementById('startNode');
    const endNodeSelect = document.getElementById('endNode');
    const calculateRouteBtn = document.getElementById('calculateRoute');
    const shortestDistanceSpan = document.getElementById('shortestDistance');
    const shortestPathSpan = document.getElementById('shortestPath');
    const calcTimeSpan = document.getElementById('calcTime');
    const networkContainer = document.getElementById('network');

    let nodes = [];
    let edges = [];
    let network = null; // A instância do Vis.js network

    // --- 1. Definição do Grafo (Maricá e Niterói) ---
    // Estrutura para o Vis.js: nodes com id e label, edges com from, to, label (weight)
    function createGraphData() {
        // Define os nós com suas IDs e labels (nomes)
        const rawNodes = [
            "Maricá (Centro)", "Itaipuaçu", "Barra de Maricá", "Niterói (Centro)",
            "Icaraí", "Ingá", "São Francisco", "Charitas"
        ];

        nodes = rawNodes.map((name, index) => ({ id: name, label: name }));

        // Define as arestas com 'from', 'to' e 'weight' (que será o 'label' na visualização)
        const rawEdges = [
            { from: "Maricá (Centro)", to: "Itaipuaçu", weight: 30 },
            { from: "Maricá (Centro)", to: "Barra de Maricá", weight: 20 },
            { from: "Itaipuaçu", to: "Niterói (Centro)", weight: 60 },
            { from: "Barra de Maricá", to: "São Francisco", weight: 40 },
            { from: "São Francisco", to: "Niterói (Centro)", weight: 30 },
            { from: "Niterói (Centro)", to: "Icaraí", weight: 15 },
            { from: "Niterói (Centro)", to: "Ingá", weight: 20 },
            { from: "Icaraí", "to": "Charitas", weight: 10 },
            { from: "Ingá", "to": "Charitas", weight: 15 },
            { from: "Charitas", "to": "São Francisco", weight: 25 }
        ];

        // Mapeia as arestas para o formato do Vis.js
        edges = rawEdges.map(edge => ({
            from: edge.from,
            to: edge.to,
            label: String(edge.weight) + ' min', // Label para exibir o peso
            weight: edge.weight, // Propriedade 'weight' para o Dijkstra
            arrows: 'to', // Opcional: para mostrar a direção, se fosse um grafo direcionado
            color: { color: '#848484' } // Cor padrão das arestas
        }));

        // Popular os dropdowns (selects)
        nodes.forEach(node => {
            const optionStart = document.createElement('option');
            optionStart.value = node.id;
            optionStart.textContent = node.label;
            startNodeSelect.appendChild(optionStart);

            const optionEnd = document.createElement('option');
            optionEnd.value = node.id;
            optionEnd.textContent = node.label;
            endNodeSelect.appendChild(optionEnd);
        });

        // Configurações iniciais dos dropdowns
        if (nodes.length > 0) {
            startNodeSelect.value = "Maricá (Centro)";
            endNodeSelect.value = "Niterói (Centro)";
        }
    }

    // --- 2. Implementação do Algoritmo de Dijkstra em JavaScript ---
    function dijkstra(nodesData, edgesData, startNodeId, endNodeId) {
        const distances = {}; // Distâncias dos nós
        const predecessors = {}; // Predecessores para reconstruir o caminho
        const priorityQueue = []; // Fila de prioridade (usando array para simular)
        const graph = {}; // Representação do grafo para o algoritmo

        // Inicializa o grafo para Dijkstra
        nodesData.forEach(node => {
            graph[node.id] = {};
            distances[node.id] = Infinity;
            predecessors[node.id] = null;
        });

        edgesData.forEach(edge => {
            // Garante que arestas são bidirecionais (para Graph)
            graph[edge.from][edge.to] = edge.weight;
            graph[edge.to][edge.from] = edge.weight; // Para grafo não direcionado
        });

        distances[startNodeId] = 0;
        priorityQueue.push({ node: startNodeId, distance: 0 });

        // Ordena a fila de prioridade (simulando heapq)
        priorityQueue.sort((a, b) => a.distance - b.distance);

        while (priorityQueue.length > 0) {
            const { node: currentNodeId, distance: currentDistance } = priorityQueue.shift(); // Pega o menor

            if (currentDistance > distances[currentNodeId]) {
                continue;
            }

            for (const neighborId in graph[currentNodeId]) {
                const weight = graph[currentNodeId][neighborId];
                const distance = currentDistance + weight;

                if (distance < distances[neighborId]) {
                    distances[neighborId] = distance;
                    predecessors[neighborId] = currentNodeId;
                    priorityQueue.push({ node: neighborId, distance: distance });
                    priorityQueue.sort((a, b) => a.distance - b.distance); // Reordena
                }
            }
        }

        // Reconstrói o caminho
        const path = [];
        let currentNode = endNodeId;
        while (currentNode !== null) {
            path.unshift(currentNode); // Adiciona no início
            currentNode = predecessors[currentNode];
            if (currentNode === startNodeId && path[0] === startNodeId) { // Evita loop infinito se predecessor não levar ao início
                break;
            }
            if (path.length > nodesData.length) { // Prevenção de loop infinito em grafos desconectados
                return { distance: Infinity, path: [] };
            }
        }

        if (distances[endNodeId] === Infinity) {
            return { distance: Infinity, path: [] };
        }

        return { distance: distances[endNodeId], path: path };
    }

    // --- 3. Função para Visualizar o Grafo com Vis.js ---
    function drawGraph(pathNodes = [], pathEdges = []) {
        const data = {
            nodes: new vis.DataSet(nodes.map(n => {
                if (n.id === startNodeSelect.value) {
                    return { ...n, color: { background: 'lightgreen', border: 'darkgreen' } };
                }
                if (n.id === endNodeSelect.value) {
                    return { ...n, color: { background: 'lightblue', border: 'darkblue' } };
                }
                return { ...n, color: { background: '#97C2E0', border: '#2B7CE9' } }; // Cor padrão dos nós
            })),
            edges: new vis.DataSet(edges.map(e => {
                // Clona a aresta para não modificar o original
                const edgeCopy = { ...e, color: { color: '#848484' } }; // Reseta a cor padrão
                // Verifica se a aresta faz parte do caminho
                if (pathEdges.some(pe => (pe.from === e.from && pe.to === e.to) || (pe.from === e.to && pe.to === e.from))) {
                    edgeCopy.color = { color: 'red', highlight: 'red' };
                    edgeCopy.width = 3;
                }
                return edgeCopy;
            }))
        };

        const options = {
            nodes: {
                shape: 'dot',
                size: 20,
                font: {
                    size: 14,
                    color: '#333',
                    face: 'Arial'
                },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                width: 1,
                shadow: true,
                font: {
                    align: 'middle',
                    size: 12,
                    color: '#333',
                    background: 'white' // Fundo branco para o label do peso
                },
                arrows: {
                    to: { enabled: false } // Desativa setas para grafo não direcionado
                }
            },
            physics: {
                enabled: true, // Habilita a física para um layout dinâmico
                stabilization: { iterations: 1000 } // Ajuda a estabilizar o layout
            },
            interaction: {
                navigationButtons: true, // Botões de zoom e pan
                keyboard: true, // Zoom com teclado
                zoomView: true, // Zoom com scroll do mouse
                dragNodes: true, // Arrastar nós
                dragView: true // Arrastar a tela
            }
        };

        if (network) {
            network.destroy(); // Destrói a instância anterior para recriar
        }
        network = new vis.Network(networkContainer, data, options);
    }

    // --- 4. Event Listener para o Botão de Calcular ---
    calculateRouteBtn.addEventListener('click', () => {
        const startNodeId = startNodeSelect.value;
        const endNodeId = endNodeSelect.value;

        if (!startNodeId || !endNodeId) {
            alert("Por favor, selecione os pontos de partida e destino.");
            return;
        }

        if (startNodeId === endNodeId) {
            shortestDistanceSpan.textContent = '0 minutos';
            shortestPathSpan.textContent = startNodeId;
            calcTimeSpan.textContent = '0 segundos';
            drawGraph([startNodeId]); // Desenha só o nó de início/fim
            return;
        }

        const startTime = performance.now(); // Tempo de alta precisão
        const { distance, path } = dijkstra(nodes, edges, startNodeId, endNodeId);
        const endTime = performance.now();
        const calculationTime = (endTime - startTime) / 1000; // Converte para segundos

        if (path.length > 0) {
            shortestDistanceSpan.textContent = `${distance} minutos`;
            shortestPathSpan.textContent = path.join(' -> ');

            // Prepara as arestas do caminho para destaque
            const pathEdges = [];
            for (let i = 0; i < path.length - 1; i++) {
                pathEdges.push({ from: path[i], to: path[i+1] });
            }
            drawGraph(path, pathEdges);

        } else {
            shortestDistanceSpan.textContent = 'Não encontrado';
            shortestPathSpan.textContent = 'Não há caminho entre os pontos selecionados.';
            drawGraph(); // Desenha o grafo sem caminho destacado
        }
        calcTimeSpan.textContent = `${calculationTime.toFixed(4)} segundos`;
    });

    // --- Inicialização ---
    createGraphData(); // Cria os dados do grafo e popula os selects
    drawGraph(); // Desenha o grafo inicial sem nenhum caminho destacado
});