# Projeto-Algoritmo-de-Grafos-com-Dijkstra
Pathfinder Solutions - Otimização de Rotas
Este projeto é uma aplicação gráfica interativa desenvolvida em Python, que utiliza algoritmos de caminho mínimo para encontrar a melhor rota entre bairros das regiões de Maricá e Niterói , no Rio de Janeiro. O algoritmo utilizado é o Dijkstra , e o aplicativo permite visualizar os resultados em um gráfico usando o matplotlibe networkx.

🧠 Funcionalidades
Seleção de origem e destino entre 8 bairros.
Escolha do horário (normal ou horário de pico “rush”).
Cálculo do caminho mais curto com base nos tempos de deslocamento.
Visualização gráfica do grafo com destaque para a rota mais eficiente.
Interface gráfica simples e intuitiva de utilização tkinter.


📌 Estrutura do Grafo
Nós: representam bairros como "Maricá (Centro)", "Itaipuaçu", "Charitas", etc.

Arestas: representam conexões entre os bairros com tempo estimado de deslocamento.

Dois modos de tráfego:

normal: tempo em minutos padrão.

rush: tempo em minutos durante horários de pico.

💡 Exemplo de uso
Selecione Maricá (Centro) como origem.

Escolha Niterói (Centro) como destino.

Marque o horário: Normal ou Rush.

Clique em Calcular Rota.

Veja a rota mais curta destacada em vermelho no grafo e o tempo total estimado.
