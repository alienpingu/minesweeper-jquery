var numRows = 10;
var numCols = 10;
var numMines = 10;
var squares = [];
let numFlags = 0;
let numRightFlags = 0;
function createGrid() {
  var $minesweeper = $("#minesweeper");
  $minesweeper.css("grid-template-rows", `repeat(${numRows}, auto)`);
  $minesweeper.css("grid-template-columns", `repeat(${numCols}, auto)`);
  for (var i = 0; i < numRows; i++) {
    var row = [];
    for (var j = 0; j < numCols; j++) {
      var $square = $("<div>", {
        class: "square hidden",
        "data-row": i,
        "data-col": j
      });
      $square.appendTo($minesweeper);
      row.push({
        $element: $square,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        numAdjacentMines: 0
      });
    }
    squares.push(row);
  }
}

function plantMines() {
  var numPlantedMines = 0;
  while (numPlantedMines < numMines) {
    var row = Math.floor(Math.random() * numRows);
    var col = Math.floor(Math.random() * numCols);
    if (!squares[row][col].isMine) {
      squares[row][col].isMine = true;
      numPlantedMines++;
    }
  }
}

function revealSquare(row, col) {
  var square = squares[row][col];
  if (square.isFlagged || square.isRevealed) {
    return;
  }
  square.isRevealed = true;
  square.$element.removeClass("hidden");
  if (square.isMine) {
    square.$element.text("💣");
    square.$element.addClass("mine");
    setTimeout(() => changeRoute("lose"), 250);
  } else if (square.numAdjacentMines > 0) {
    square.$element.text(square.numAdjacentMines);
  } else {
    for (var i = row - 1; i <= row + 1; i++) {
      for (var j = col - 1; j <= col + 1; j++) {
        if (i >= 0 && i < numRows && j >= 0 && j < numCols) {
          revealSquare(i, j);
        }
      }
    }
  }
}

function countAdjacentMines(row, col) {
  var count = 0;
  for (var i = row - 1; i <= row + 1; i++) {
    for (var j = col - 1; j <= col + 1; j++) {
      if (
        i >= 0 &&
        i < numRows &&
        j >= 0 &&
        j < numCols &&
        squares[i][j].isMine
      ) {
        count++;
      }
    }
  }
  return count;
}

function updateAdjacentMines() {
  for (var i = 0; i < numRows; i++) {
    for (var j = 0; j < numCols; j++) {
      var square = squares[i][j];
      if (!square.isMine) {
        square.numAdjacentMines = countAdjacentMines(i, j);
      }
    }
  }
}

function flagSquare(event) {
  event.preventDefault();
  var $square = $(this);
  var row = $square.data("row");
  var col = $square.data("col");
  var square = squares[row][col];
  if (!square.isRevealed) {
    square.isFlagged = !square.isFlagged;
    if (square.isFlagged) {
      $square.addClass("flagged");
      $square.text("🚩");
      countFlags(square.isFlagged, square.isMine);
    } else if (!square.isFlagged) {
      $square.removeClass("flagged");
      $square.empty();
      countFlags(square.isFlagged, square.isMine);
    }
  }
}

function setupGame(difficulty) {
  $("#minesweeper").html("");
  squares = [];
  numRows = Number(difficulty);
  numCols = Number(difficulty);
  numFlags = 0;
  numRightFlags = 0;
  document.documentElement.style.setProperty("--side", numCols);
  difficulty >= 20
    ? (numMines = Number(difficulty * 3))
    : (numMines = Number(difficulty));
  $("#flg-cnt").text(numFlags);
  $("#flg-tot").text(numMines);
  createGrid();
  plantMines();
  updateAdjacentMines();
  $("body").on("contextmenu", function (e) {
    e.preventDefault();
    return false;
  });

  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    var pressTime; // store the press time

    $(".square")
      .on("touchstart", function (event) {
        var holdTime = 500; //  2 seconds for long press
        var $square = $(this);
        var row = $square.data("row");
        var col = $square.data("col");
        if (new Date().getTime() >= pressTime + holdTime) {
          flagSquare.call(this, event);
          console.log("long press");
        } else {
          revealSquare(row, col);
          console.log("short");
        }
      })
      .on("touchend", function () {
        // When Button Release
        pressTime = new Date().getTime();
        pressTime = 0;
      });

    $(".square").on("touchstart", () => console.log("tap"));
    $(".square").on("taphold", () => console.log("taphold"));
  } else {
    $(".square").mousedown(function (event) {
      var $square = $(this);
      var row = $square.data("row");
      var col = $square.data("col");
      if (event.which === 1) {
        revealSquare(row, col);
      } else if (event.which === 3) {
        flagSquare.call(this, event);
      }
    });
  }
}

function changeRoute(route) {
  $("section").hide();
  $(`section#${route}`).show();
}

function countFlags(isFlagged, isMine) {
  if (isFlagged) {
    numFlags++;
    if (isMine) {
      numRightFlags++;
    }
  } else {
    numFlags--;
    if (isMine) {
      numRightFlags--;
    }
  }
  $("#flg-cnt").text(numFlags);
  if (numRightFlags === numMines) {
    changeRoute("success");
  }
}

// Main
$("button.link-game").click((e) => {
  let diff = e.target.getAttribute("diff");
  changeRoute("game");
  setupGame(diff * 6);
});

$("button.link-home").click((e) => {
  changeRoute("landing");
});

$(".navbar-brand").click(() => changeRoute("landing"));

changeRoute("landing");
