class SnakeLadderGame {
    constructor() {
        this.boardSize = 100;
        this.players = [
            { id: 1, position: 0, element: null },
            { id: 2, position: 0, element: null }
        ];
        this.currentPlayer = 0;
        this.gameOver = false;
        
        // Snakes (head -> tail)
        this.snakes = {
            16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 
            64: 60, 87: 24, 93: 73, 95: 75, 98: 78
        };
        
        // Ladders (bottom -> top)
        this.ladders = {
            1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 
            36: 44, 51: 67, 71: 91, 80: 100
        };
        
        this.initGame();
    }
    
    initGame() {
        this.createBoard();
        this.createPlayers();
        this.updateUI();
        this.addEventListeners();
    }
    
    createBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';
        
        for (let i = 100; i >= 1; i--) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${i}`;
            
            const cellNumber = document.createElement('div');
            cellNumber.textContent = i;
            cell.appendChild(cellNumber);
            
            // Add special styling for snakes and ladders
            if (this.snakes[i]) {
                cell.classList.add('snake-head');
                const snakeIcon = document.createElement('div');
                snakeIcon.textContent = '🐍';
                snakeIcon.style.fontSize = '16px';
                cell.appendChild(snakeIcon);
            } else if (Object.values(this.snakes).includes(i)) {
                cell.classList.add('snake-tail');
            }
            
            if (this.ladders[i]) {
                cell.classList.add('ladder-bottom');
                const ladderIcon = document.createElement('div');
                ladderIcon.textContent = '🪜';
                ladderIcon.style.fontSize = '16px';
                cell.appendChild(ladderIcon);
            } else if (Object.values(this.ladders).includes(i)) {
                cell.classList.add('ladder-top');
            }
            
            if (i === 100) {
                cell.classList.add('finish');
                const finishIcon = document.createElement('div');
                finishIcon.textContent = '🏆';
                finishIcon.style.fontSize = '16px';
                cell.appendChild(finishIcon);
            }
            
            board.appendChild(cell);
        }
    }
    
    createPlayers() {
        this.players.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.className = `player player${player.id}`;
            playerElement.id = `player${player.id}`;
            
            // Position at start (cell 1 but visually at bottom)
            const startCell = document.getElementById('cell-1');
            if (startCell) {
                startCell.appendChild(playerElement);
                // Offset players so they don't overlap
                playerElement.style.left = `${index * 25}px`;
            }
            
            player.element = playerElement;
        });
    }
    
    // Probability-based dice with weighted randomness
    rollDice() {
        // Create a more realistic probability distribution
        // Using multiple random calls to create better distribution
        let result;
        
        // Advanced probability calculation
        const random1 = Math.random();
        const random2 = Math.random();
        const random3 = Math.random();
        
        // Combine multiple random values for better distribution
        const combinedRandom = (random1 + random2 + random3) / 3;
        
        // Apply slight bias towards middle numbers (more realistic)
        const biasedRandom = Math.pow(combinedRandom, 0.9);
        
        result = Math.floor(biasedRandom * 6) + 1;
        
        // Ensure we still have proper bounds
        result = Math.max(1, Math.min(6, result));
        
        return result;
    }
    
    animateDice(finalValue) {
        const dice = document.getElementById('dice');
        const rollBtn = document.getElementById('rollBtn');
        
        dice.classList.add('rolling');
        rollBtn.disabled = true;
        
        // Show random numbers during animation
        let animationCount = 0;
        const animationInterval = setInterval(() => {
            const randomNum = Math.floor(Math.random() * 6) + 1;
            dice.textContent = randomNum;
            animationCount++;
            
            if (animationCount >= 8) {
                clearInterval(animationInterval);
                dice.textContent = finalValue;
                dice.classList.remove('rolling');
                
                setTimeout(() => {
                    this.movePlayer(finalValue);
                    rollBtn.disabled = false;
                }, 300);
            }
        }, 100);
    }
    
    movePlayer(diceValue) {
        const player = this.players[this.currentPlayer];
        const newPosition = Math.min(player.position + diceValue, 100);
        
        this.logMove(`Player ${player.id} rolled ${diceValue}`);
        
        // Animate movement
        this.animatePlayerMovement(player, newPosition);
        
        setTimeout(() => {
            // Check for snakes and ladders
            const finalPosition = this.checkSnakesAndLadders(newPosition);
            player.position = finalPosition;
            
            if (finalPosition !== newPosition) {
                this.animatePlayerMovement(player, finalPosition);
            }
            
            this.updateUI();
            this.checkWinner();
            
            if (!this.gameOver) {
                this.currentPlayer = (this.currentPlayer + 1) % 2;
                this.updateUI();
            }
        }, 500);
    }
    
    animatePlayerMovement(player, targetPosition) {
        if (targetPosition === 0) return;
        
        const targetCell = document.getElementById(`cell-${targetPosition}`);
        if (targetCell) {
            // Remove player from current cell
            if (player.element.parentNode) {
                player.element.parentNode.removeChild(player.element);
            }
            
            // Add to new cell
            targetCell.appendChild(player.element);
            
            // Reset position for multiple players
            const playersInCell = targetCell.querySelectorAll('.player');
            playersInCell.forEach((p, index) => {
                p.style.left = `${index * 25}px`;
            });
        }
    }
    
    checkSnakesAndLadders(position) {
        if (this.snakes[position]) {
            const snakeEnd = this.snakes[position];
            this.logMove(`🐍 Snake bite! Slid down from ${position} to ${snakeEnd}`);
            return snakeEnd;
        }
        
        if (this.ladders[position]) {
            const ladderTop = this.ladders[position];
            this.logMove(`🪜 Climbed ladder from ${position} to ${ladderTop}!`);
            return ladderTop;
        }
        
        return position;
    }
    
    checkWinner() {
        const player = this.players[this.currentPlayer];
        if (player.position >= 100) {
            this.gameOver = true;
            this.showWinner(player.id);
        }
    }
    
    showWinner(playerId) {
        const modal = document.getElementById('winnerModal');
        const winnerText = document.getElementById('winnerText');
        const winnerMessage = document.getElementById('winnerMessage');
        
        winnerText.textContent = `🎉 Player ${playerId} Wins! 🎉`;
        winnerMessage.textContent = `Congratulations! You've reached position 100!`;
        
        modal.style.display = 'flex';
    }
    
    logMove(message) {
        const logContent = document.getElementById('logContent');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        
        logContent.insertBefore(logEntry, logContent.firstChild);
        
        // Keep only last 5 entries
        while (logContent.children.length > 5) {
            logContent.removeChild(logContent.lastChild);
        }
    }
    
    updateUI() {
        // Update player positions
        document.getElementById('player1Pos').textContent = this.players[0].position;
        document.getElementById('player2Pos').textContent = this.players[1].position;
        
        // Update active player
        const player1Status = document.getElementById('player1Status');
        const player2Status = document.getElementById('player2Status');
        
        if (this.currentPlayer === 0) {
            player1Status.className = 'player-status active';
            player2Status.className = 'player-status inactive';
        } else {
            player1Status.className = 'player-status inactive';
            player2Status.className = 'player-status active';
        }
    }
    
    addEventListeners() {
        document.getElementById('rollBtn').addEventListener('click', () => {
            if (!this.gameOver) {
                const diceValue = this.rollDice();
                this.animateDice(diceValue);
            }
        });
        
        document.getElementById('dice').addEventListener('click', () => {
            document.getElementById('rollBtn').click();
        });
    }
}

// Global game instance
let game;

// Initialize game
function initGame() {
    game = new SnakeLadderGame();
}

function restartGame() {
    document.getElementById('winnerModal').style.display = 'none';
    initGame();
}

// Start the game when page loads
window.addEventListener('load', initGame);