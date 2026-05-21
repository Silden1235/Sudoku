document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const checkBtn = document.getElementById('check-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    
    let puzzleBank = []; 
    let currentSolution = [];
    let currentStartBoard = [];

    // 1. Fetch data safely
    fetch('puzzles.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load puzzles.json');
            return response.json();
        })
        .then(data => {
            puzzleBank = data;
            loadPuzzle(); 
        })
        .catch(error => console.error('Error:', error));

    // 2. Load puzzle and explicitly bind its MATCHING solution key
    function loadPuzzle() {
        if (puzzleBank.length === 0) return;

        checkBtn.textContent = "Check Game";
        cells.forEach(cell => {
            cell.classList.remove('correct', 'incorrect', 'duplicate-error');
            cell.value = '';
            cell.disabled = false;
            cell.classList.remove('given');
        });

        const randomIndex = Math.floor(Math.random() * puzzleBank.length);
        const selectedPuzzle = puzzleBank[randomIndex];
        
        // CRITICAL FIX: Explicitly locks the matching answer key down
        currentStartBoard = selectedPuzzle.start;
        currentSolution = selectedPuzzle.solution;

        cells.forEach((cell, index) => {
            const value = currentStartBoard[index];
            if (value !== 0) {
                cell.value = value;
                cell.disabled = true;
                cell.classList.add('given');
            }
        });
    }

    newGameBtn.addEventListener('click', loadPuzzle);

    // 3. Live Duplicate Blocker (Checks row, column, and 3x3 box as you type)
    function validateRealTimeMoves() {
        // Clear old visual duplicate highlights before checking
        cells.forEach(c => c.classList.remove('duplicate-error'));

        cells.forEach((cell, index) => {
            if (cell.value === '') return;
            
            const val = cell.value;
            const row = Math.floor(index / 9);
            const col = index % 9;
            const boxRow = Math.floor(row / 3);
            const boxCol = Math.floor(col / 3);

            cells.forEach((otherCell, otherIndex) => {
                if (index === otherIndex || otherCell.value === '') return;

                const oRow = Math.floor(otherIndex / 9);
                const oCol = otherIndex % 9;
                const oBoxRow = Math.floor(oRow / 3);
                const oBoxCol = Math.floor(oCol / 3);

                // If a duplicate shares a row, column, or 3x3 box, flag it immediately
                if (otherCell.value === val && (oRow === row || oCol === col || (oBoxRow === boxRow && oBoxCol === boxCol))) {
                    cell.classList.add('duplicate-error');
                    otherCell.classList.add('duplicate-error');
                }
            });
        });
    }

    // 4. Input handling and validation triggers
    cells.forEach(cell => {
        cell.addEventListener('keypress', (e) => {
            if (!/^[1-9]$/.test(String.fromCharCode(e.which || e.keyCode))) e.preventDefault();
        });
        
        cell.addEventListener('input', (e) => {
            if (!/^[1-9]$/.test(e.target.value)) e.target.value = '';
            e.target.classList.remove('correct', 'incorrect');
            validateRealTimeMoves(); // Run real-time duplicate check
        });
    });

    // 5. Final Solution Validation Button
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

    // 6. Hover Highlight Layer
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
