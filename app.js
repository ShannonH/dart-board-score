// Game state
const state = {
    gameType: 'x01',
    x01Score: 301,
    playerCount: 2,
    players: [],
    currentPlayerIndex: 0,
    currentDart: 0,
    turnScores: [],
    inputMode: 'dartboard', // 'dartboard' or 'button'
    multiplier: 1,
    history: [],
    autoSwitch: false // Default to manual switching
};

// Dartboard configuration
const DARTBOARD_NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const CRICKET_NUMBERS = [20, 19, 18, 17, 16, 15, 25]; // 25 is bull

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initSetup();
    initGame();
});

// Setup Screen Functions
function initSetup() {
    // Game type selection
    document.querySelectorAll('.game-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.game-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.gameType = btn.dataset.game;
            
            // Show/hide x01 options
            const x01Options = document.getElementById('x01Options');
            if (state.gameType === 'x01') {
                x01Options.classList.remove('hidden');
            } else {
                x01Options.classList.add('hidden');
            }
        });
    });

    // x01 score selection
    document.querySelectorAll('.x01-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.x01-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.x01Score = parseInt(btn.dataset.score);
        });
    });

    // Player count selection
    document.querySelectorAll('.player-count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.player-count-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.playerCount = parseInt(btn.dataset.count);
            updatePlayerNameInputs();
        });
    });

    // Auto-switch selection
    document.querySelectorAll('.auto-switch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.auto-switch-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.autoSwitch = btn.dataset.auto === 'true';
        });
    });

    // Start game button
    document.getElementById('startGameBtn').addEventListener('click', startGame);

    updatePlayerNameInputs();
}

function updatePlayerNameInputs() {
    const container = document.getElementById('playerNames');
    container.innerHTML = '';
    
    for (let i = 0; i < state.playerCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-name-input';
        input.placeholder = `Player ${i + 1}`;
        input.value = `Player ${i + 1}`;
        input.dataset.player = i;
        container.appendChild(input);
    }
}

function startGame() {
    // Collect player names
    state.players = [];
    document.querySelectorAll('.player-name-input').forEach(input => {
        const name = input.value.trim() || `Player ${parseInt(input.dataset.player) + 1}`;
        
        if (state.gameType === 'x01') {
            state.players.push({
                name: name,
                score: state.x01Score,
                history: []
            });
        } else { // cricket
            state.players.push({
                name: name,
                marks: {
                    15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0
                },
                score: 0,
                history: []
            });
        }
    });

    state.currentPlayerIndex = 0;
    state.currentDart = 0;
    state.turnScores = [];
    state.history = [];

    // Switch to game screen
    document.getElementById('setupScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');

    updateGameTitle();
    renderScoreboard();
    renderDartboard();
    renderButtonInput();
    updateTurnInfo();
}

// Game Screen Functions
function initGame() {
    // Back to setup button
    document.getElementById('backToSetup').addEventListener('click', () => {
        if (confirm('Are you sure you want to go back to setup? Current game will be lost.')) {
            document.getElementById('gameScreen').classList.remove('active');
            document.getElementById('setupScreen').classList.add('active');
        }
    });

    // Toggle input mode
    document.getElementById('toggleInputMode').addEventListener('click', () => {
        if (state.inputMode === 'dartboard') {
            state.inputMode = 'button';
            document.getElementById('dartboardInput').classList.remove('active');
            document.getElementById('buttonInput').classList.add('active');
        } else {
            state.inputMode = 'dartboard';
            document.getElementById('buttonInput').classList.remove('active');
            document.getElementById('dartboardInput').classList.add('active');
        }
    });

    // Multiplier selection
    document.querySelectorAll('.multiplier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.multiplier-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.multiplier = parseInt(btn.dataset.mult);
        });
    });

    // Undo buttons (both views)
    document.getElementById('undoBtn').addEventListener('click', undoLastThrow);
    document.getElementById('undoBtnDartboard').addEventListener('click', undoLastThrow);

    // Next player buttons (both views)
    document.getElementById('nextPlayerBtn').addEventListener('click', nextPlayer);
    document.getElementById('nextPlayerBtnDartboard').addEventListener('click', nextPlayer);
}

function updateGameTitle() {
    const title = state.gameType === 'x01' ? `${state.x01Score}` : 'Cricket';
    document.getElementById('gameTitle').textContent = title;
}

function renderScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    
    if (state.gameType === 'x01') {
        renderX01Scoreboard(scoreboard);
    } else {
        renderCricketScoreboard(scoreboard);
    }
}

function renderX01Scoreboard(container) {
    let html = '<table class="score-table"><thead><tr>';
    html += '<th>Player</th><th>Score</th><th>Darts</th>';
    html += '</tr></thead><tbody>';

    state.players.forEach((player, index) => {
        const rowClass = index === state.currentPlayerIndex ? 'active-player' : '';
        const dartCount = player.history.reduce((sum, turn) => sum + turn.length, 0);
        html += `<tr class="${rowClass}">`;
        html += `<td><strong>${player.name}</strong></td>`;
        html += `<td style="font-size: 24px; font-weight: bold;">${player.score}</td>`;
        html += `<td>${dartCount}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderCricketScoreboard(container) {
    let html = '<table class="score-table"><thead><tr>';
    html += '<th>Player</th>';
    CRICKET_NUMBERS.forEach(num => {
        html += `<th>${num === 25 ? 'Bull' : num}</th>`;
    });
    html += '<th>Score</th>';
    html += '</tr></thead><tbody>';

    state.players.forEach((player, index) => {
        const rowClass = index === state.currentPlayerIndex ? 'active-player' : '';
        html += `<tr class="${rowClass}">`;
        html += `<td><strong>${player.name}</strong></td>`;
        
        CRICKET_NUMBERS.forEach(num => {
            const marks = player.marks[num];
            let display = '';
            if (marks >= 3) {
                display = '<span class="cricket-closed">⊗</span>'; // Circled X for closed
                if (marks > 3) {
                    display += ` +${marks - 3}`;
                }
            } else if (marks === 2) {
                display = '⨯'; // Full X (both legs)
            } else if (marks === 1) {
                display = '╱'; // First leg of X
            }
            html += `<td class="cricket-mark">${display}</td>`;
        });
        
        html += `<td style="font-weight: bold;">${player.score}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderDartboard() {
    const svg = document.getElementById('dartboard');
    svg.innerHTML = '';

    // Outer circle (double ring outer)
    const outerCircle = createSVGElement('circle', {
        cx: 0, cy: 0, r: 100,
        fill: '#000',
        stroke: '#fff',
        'stroke-width': 2
    });
    svg.appendChild(outerCircle);

    // Create segments
    const anglePerSegment = 360 / 20;
    DARTBOARD_NUMBERS.forEach((number, index) => {
        const startAngle = (index * anglePerSegment - 9) * Math.PI / 180;
        const endAngle = ((index + 1) * anglePerSegment - 9) * Math.PI / 180;
        
        // Colors alternate - realistic dartboard colors (red/green for scoring, black/white for singles)
        const isRed = (index % 2 === 0);
        const outerColor = isRed ? '#dc143c' : '#00aa00'; // Red or Green for double/triple
        const innerColor = isRed ? '#000' : '#f5f5dc'; // Black or Cream/White for singles

        // Double ring (outer)
        createSegment(svg, startAngle, endAngle, 92, 100, outerColor, number, 2);
        
        // Single ring (outer)
        createSegment(svg, startAngle, endAngle, 62, 92, innerColor, number, 1);
        
        // Triple ring
        createSegment(svg, startAngle, endAngle, 56, 62, outerColor, number, 3);
        
        // Single ring (inner)
        createSegment(svg, startAngle, endAngle, 17, 56, innerColor, number, 1);

        // Number labels
        const labelAngle = (index * anglePerSegment) * Math.PI / 180;
        const labelRadius = 106;
        const x = Math.sin(labelAngle) * labelRadius;
        const y = -Math.cos(labelAngle) * labelRadius;
        
        const text = createSVGElement('text', {
            x: x,
            y: y,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            fill: '#fff',
            'font-size': '12',
            'font-weight': 'bold',
            'pointer-events': 'none'
        });
        text.textContent = number;
        svg.appendChild(text);
    });

    // Bull's eye - outer bull (green) and inner bull (red)
    const bull = createSVGElement('circle', {
        cx: 0, cy: 0, r: 17,
        fill: '#00aa00',
        stroke: '#fff',
        'stroke-width': 1,
        class: 'dart-segment',
        'data-number': 25,
        'data-mult': 2
    });
    bull.addEventListener('click', handleDartboardClick);
    svg.appendChild(bull);

    const innerBull = createSVGElement('circle', {
        cx: 0, cy: 0, r: 7,
        fill: '#dc143c',
        class: 'dart-segment',
        'data-number': 25,
        'data-mult': 2
    });
    innerBull.addEventListener('click', handleDartboardClick);
    svg.appendChild(innerBull);
}

function createSegment(svg, startAngle, endAngle, innerRadius, outerRadius, color, number, mult) {
    const x1 = Math.sin(startAngle) * innerRadius;
    const y1 = -Math.cos(startAngle) * innerRadius;
    const x2 = Math.sin(endAngle) * innerRadius;
    const y2 = -Math.cos(endAngle) * innerRadius;
    const x3 = Math.sin(endAngle) * outerRadius;
    const y3 = -Math.cos(endAngle) * outerRadius;
    const x4 = Math.sin(startAngle) * outerRadius;
    const y4 = -Math.cos(startAngle) * outerRadius;

    const path = createSVGElement('path', {
        d: `M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${outerRadius} ${outerRadius} 0 0 0 ${x4} ${y4} Z`,
        fill: color,
        stroke: '#000',
        'stroke-width': 0.5,
        class: 'dart-segment',
        'data-number': number,
        'data-mult': mult
    });

    path.addEventListener('click', handleDartboardClick);
    svg.appendChild(path);
}

function createSVGElement(type, attrs) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attrs)) {
        element.setAttribute(key, value);
    }
    return element;
}

function handleDartboardClick(e) {
    const number = parseInt(e.target.dataset.number);
    const mult = parseInt(e.target.dataset.mult);
    
    // For dartboard input, use the segment's multiplier, not the selected one
    recordThrow(number, mult);
}

function renderButtonInput() {
    const grid = document.querySelector('.button-grid');
    grid.innerHTML = '';

    const numbers = state.gameType === 'cricket' 
        ? [20, 19, 18, 17, 16, 15, 'Bull', 0, 'Miss']
        : [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5, 25, 0, 'Miss'];

    numbers.forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        
        if (num === 'Bull') {
            btn.textContent = 'Bull';
            btn.dataset.number = 25;
        } else if (num === 'Miss') {
            btn.textContent = 'Miss';
            btn.dataset.number = 0;
        } else {
            btn.textContent = num;
            btn.dataset.number = num;
        }
        
        btn.addEventListener('click', () => {
            const number = parseInt(btn.dataset.number);
            recordThrow(number, state.multiplier);
        });
        
        grid.appendChild(btn);
    });
}

function recordThrow(number, multiplier) {
    const score = number * multiplier;
    
    // Save to history for undo
    state.history.push({
        playerIndex: state.currentPlayerIndex,
        number: number,
        multiplier: multiplier,
        dartIndex: state.currentDart
    });

    state.turnScores.push({ number, multiplier, score });

    if (state.gameType === 'x01') {
        handleX01Throw(score);
    } else {
        handleCricketThrow(number, multiplier);
    }

    state.currentDart++;
    
    if (state.currentDart >= 3 && state.autoSwitch) {
        nextPlayer();
    } else {
        updateTurnInfo();
        renderScoreboard();
    }
}

function handleX01Throw(score) {
    const player = state.players[state.currentPlayerIndex];
    const newScore = player.score - score;
    
    if (newScore < 0 || newScore === 1) {
        // Bust - reset to start of turn
        alert(`Bust! Score would be ${newScore}. Turn over.`);
        state.currentDart = 3; // Force end of turn
    } else if (newScore === 0) {
        // Win!
        player.score = 0;
        alert(`${player.name} wins!`);
        state.currentDart = 3;
    } else {
        player.score = newScore;
    }
}

function isCricketNumber(number) {
    return CRICKET_NUMBERS.includes(number);
}

function handleCricketThrow(number, multiplier) {
    // Only count cricket numbers
    if (!isCricketNumber(number)) {
        return;
    }

    const player = state.players[state.currentPlayerIndex];
    player.marks[number] += multiplier;

    // Check if player gets points
    if (player.marks[number] > 3) {
        // Check if any other player has this number closed
        const allClosed = state.players.every(p => p.marks[number] >= 3);
        
        if (!allClosed) {
            // Add points for extra marks
            const extraMarks = Math.min(multiplier, player.marks[number] - 3);
            player.score += number * extraMarks;
        }
    }

    // Check for winner (all numbers closed and highest score)
    checkCricketWinner();
}

function checkCricketWinner() {
    const allClosed = (player) => {
        return CRICKET_NUMBERS.every(num => player.marks[num] >= 3);
    };

    const currentPlayer = state.players[state.currentPlayerIndex];
    
    if (allClosed(currentPlayer)) {
        const maxScore = Math.max(...state.players.map(p => p.score));
        
        if (currentPlayer.score >= maxScore) {
            // Check if all others also have all closed with lower scores
            const hasWon = state.players.every(p => {
                return p === currentPlayer || p.score < currentPlayer.score;
            });
            
            if (hasWon) {
                alert(`${currentPlayer.name} wins!`);
            }
        }
    }
}

function nextPlayer() {
    // Save turn to player history
    if (state.turnScores.length > 0) {
        state.players[state.currentPlayerIndex].history.push([...state.turnScores]);
    }

    state.turnScores = [];
    state.currentDart = 0;
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    
    renderScoreboard();
    updateTurnInfo();
}

function undoLastThrow() {
    if (state.history.length === 0) {
        return;
    }

    const lastThrow = state.history.pop();
    
    // If we're undoing a throw from a previous player, we need to go back
    if (lastThrow.playerIndex !== state.currentPlayerIndex) {
        // Remove last turn from previous player's history
        const prevPlayer = state.players[lastThrow.playerIndex];
        if (prevPlayer.history.length > 0) {
            const lastTurn = prevPlayer.history.pop();
            state.turnScores = lastTurn.slice(0, -1); // All but the last throw
        }
        state.currentPlayerIndex = lastThrow.playerIndex;
    } else {
        // Remove last score from turn
        state.turnScores.pop();
    }

    state.currentDart = lastThrow.dartIndex;

    // Recalculate scores from scratch
    recalculateScores();
    
    renderScoreboard();
    updateTurnInfo();
}

function recalculateScores() {
    // Reset all player scores
    state.players.forEach(player => {
        if (state.gameType === 'x01') {
            player.score = state.x01Score;
        } else {
            player.marks = {
                15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0
            };
            player.score = 0;
        }
    });

    // Replay all history
    state.players.forEach((player, pIndex) => {
        player.history.forEach(turn => {
            turn.forEach(({ number, multiplier, score }) => {
                if (state.gameType === 'x01') {
                    const newScore = player.score - score;
                    if (newScore >= 0 && newScore !== 1) {
                        player.score = newScore;
                    }
                } else {
                    if (isCricketNumber(number)) {
                        player.marks[number] += multiplier;
                    }
                }
            });
        });
    });

    // Recalculate cricket scores
    if (state.gameType === 'cricket') {
        state.players.forEach(player => {
            player.score = 0;
            CRICKET_NUMBERS.forEach(num => {
                if (player.marks[num] > 3) {
                    const extraMarks = player.marks[num] - 3;
                    player.score += num * extraMarks;
                }
            });
        });
    }

    // Replay current turn
    state.turnScores.forEach(({ number, multiplier, score }) => {
        const player = state.players[state.currentPlayerIndex];
        if (state.gameType === 'x01') {
            const newScore = player.score - score;
            if (newScore >= 0 && newScore !== 1) {
                player.score = newScore;
            }
        } else {
            if (isCricketNumber(number)) {
                player.marks[number] += multiplier;
            }
        }
    });
}

function updateTurnInfo() {
    const currentThrow = document.getElementById('currentThrow');
    const turnScore = document.getElementById('turnScore');
    
    currentThrow.textContent = `${state.players[state.currentPlayerIndex].name} - Dart ${state.currentDart + 1} of 3`;
    
    const total = state.turnScores.reduce((sum, t) => sum + t.score, 0);
    turnScore.textContent = `Turn Score: ${total}`;
}
