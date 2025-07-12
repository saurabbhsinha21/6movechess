
let board = Chessboard('board', {
  draggable: true,
  dropOffBoard: 'trash',
  sparePieces: true
});

let engine = new Worker('stockfish.js');

engine.postMessage('uci');

function resetBoard() {
  board.start();
  document.getElementById('output').textContent = '';
}

function clearBoard() {
  board.clear();
  document.getElementById('output').textContent = '';
}

function analyze() {
  const fen = board.fen();
  document.getElementById('output').textContent = 'Analyzing...';

  engine.postMessage('position fen ' + fen);
  engine.postMessage('go depth 12');
}

let outputElement = document.getElementById('output');

let moveLine = '';
engine.onmessage = function(event) {
  const line = event.data;

  if (line.startsWith('bestmove')) {
    outputElement.textContent += '\nDone.';
  }

  if (line.startsWith('info') && line.includes(' pv ')) {
    const moves = line.split(' pv ')[1].split(' ');
    moveLine = moves.slice(0, 6);  // First 6 moves (3 full moves per side)

    // Estimate points based on captures (naive, no actual board tracking)
    let totalPoints = 0;
    let output = 'Best move line:\n';
    let capturePoints = { 'q': 9, 'r': 5, 'b': 3, 'n': 3, 'p': 1 };

    moveLine.forEach((move, i) => {
      let score = 0;
      if (move.includes('x')) {
        let piece = move[move.length - 1].toLowerCase();
        score = capturePoints[piece] || 0;
        totalPoints += score;
      }
      output += (i + 1) + '. ' + move + (score > 0 ? ' = ' + score + ' pts' : '') + '\n';
    });

    output += '...\nTotal = ' + totalPoints + ' pts';
    outputElement.textContent = output;
  }
};
