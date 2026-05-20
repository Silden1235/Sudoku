document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const checkBtn = document.getElementById('check-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    
    let puzzleBank = []; // Holds puzzles loaded from the JSON file
    let currentSolution = [];

    // 1. Fetch the puzzles from your external file
    fetch('puzzles.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load puzzles.json');
            return response.json();
        })
        .then(data => {
            puzzleBank = data;
            loadPuzzle(); // Load the first random game once data is ready
        })
        .catch(error => {
            console.error('Error loading the puzzle file:', error);
            alert('Could not load the puzzles file. Make sure puzzles.json is in the correct folder.');
        });

    // 2. Reusable function to load a random puzzle
    function loadPuzzle() {
        if (puzzleBank.length === 0) return;

        // Reset button states and clear validation classes
        checkBtn.textContent = "Check Game";
        cells.forEach(cell => {
            cell.classList.remove('correct', 'incorrect');
            cell.value = '';
            cell.disabled = false;
            cell.classList.remove('given');
        });

        // Pick a random layout from the loaded bank
        const randomIndex = Math.floor(Math.random() * puzzleBank.length);
        const selectedPuzzle = puzzleBank[randomIndex];
        currentSolution = selectedPuzzle.solution;

        // Inject values
        cells.forEach((cell, index) => {
            const value = selectedPuzzle.start[index];
            if (value !== 0) {
                cell.value = value;
                cell.disabled = true;
                cell.classList.add('given');
            }
        });
    }

    // 3. Event Listener for the New Game Button
    newGameBtn.addEventListener('click', loadPuzzle);

    // 4. "Check Game" Validation Event
    checkBtn.addEventListener('click', () => {
        if (checkBtn.textContent === "Clear Checks") {
            cells.forEach(cell => cell.classList.remove('correct', 'incorrect'));
            checkBtn.textContent = "Check Game";
            return;
        }

        let totalEmpty = 0;
        let totalWrong = 0;

        cells.forEach((cell, index) => {
            if (cell.classList.contains('given')) return;

            const userValue = cell.value.trim() === '' ? 0 : Number(cell.value);
            const correctValue = currentSolution[index];

            if (userValue === 0) {
                totalEmpty++;
            } else if (userValue === correctValue) {
                cell.classList.add('correct');
            } else {
                cell.classList.add('incorrect');
                totalWrong++;
            }
        });

        if (totalEmpty === 0 && totalWrong === 0) {
            alert("Congratulations! Bald Moose Sudoku Conquered!");
        } else {
            checkBtn.textContent = "Clear Checks";
        }
    });

    // 5. Input restriction controls
    cells.forEach(cell => {
        cell.addEventListener('keypress', (e) => {
            if (!/^[1-9]$/.test(String.fromCharCode(e.which || e.keyCode))) e.preventDefault();
        });
        
        cell.addEventListener('input', (e) => {
            if (!/^[1-9]$/.test(e.target.value)) e.target.value = '';
            e.target.classList.remove('correct', 'incorrect');
        });
    });

    // 6. Hover row & column highlights
    const allCells = Array.from(cells);
    allCells.forEach((cell, index) => {
        const rowIndex = Math.floor(index / 9);
        const colIndex = index % 9;
        cell.addEventListener('mouseenter', () => {
            allCells.forEach((otherCell, otherIndex) => {
                if (Math.floor(otherIndex / 9) === rowIndex || otherIndex % 9 === colIndex) {
                    otherCell.classList.add('highlighted');
                }
            });
            cell.classList.add('hovered-cell');
        });
        cell.addEventListener('mouseleave', () => {
            allCells.forEach(otherCell => otherCell.classList.remove('highlighted'));
            cell.classList.remove('hovered-cell');
        });
    });
});
