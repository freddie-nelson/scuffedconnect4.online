import { Colors, hex } from "./colors";
import Player from "./player";

export interface Slot {
  color: Colors | null;
  win: boolean;
  row: number;
  col: number;
}

export default class Game {
  protected host: Player | undefined;
  readonly players: Player[] = [];

  protected playing: Player | undefined;

  protected winner: Player | undefined;
  protected winningSlots: Slot[] = [];

  protected rows = 6;
  protected cols = 7;

  protected started = false;

  isOnline = false;

  /**
   * 2D array is column major indexed, uses (c, r) indexing.
   *
   * The 0th index of a column is the bottom row of the board.
   *
   * This is for easier placement of pieces into the board.
   */
  protected grid: (Colors | null)[][] = [];

  constructor(host?: Player) {
    this.host = host;
  }

  // player methods
  addPlayer(player: Player) {
    if (!this.host) this.host = player;

    // color is taken
    if (
      this.findPlayerByColor(player.color) ||
      this.findIndexOfPlayer(player) !== -1 ||
      this.getPlayerCount() >= 8
    )
      return false;

    this.players.push(player);
    return true;
  }

  removePlayer(player: Player) {
    const i = this.findIndexOfPlayer(player);
    if (i === -1) return false;

    // replace playing
    if (player.id === this.playing?.id) {
      this.nextTurn();
    }

    // replace host
    if (player.id === this.host?.id) {
      this.host = this.players[Math.floor(Math.random() * this.players.length)];
    }

    this.players.splice(i, 1);

    return true;
  }

  findIndexOfPlayer(player: Player) {
    return this.players.findIndex((p) => p.id === player.id);
  }

  findPlayerById(player: Player) {
    return this.players.find((p) => p.id === player.id);
  }

  findPlayerByColor(color: Colors) {
    return this.players.find((p) => p.color === color);
  }

  /**
   * Gets the player after the given player.
   *
   * @param player The player before the desired player
   */
  getNextPlayer(player: Player) {
    const i = this.findIndexOfPlayer(player);
    if (i === -1) return;

    const nextI = i + 1 >= this.getPlayerCount() ? 0 : i + 1;
    return this.players[nextI];
  }

  getHost() {
    return this.host;
  }

  getPlaying() {
    return this.playing;
  }

  getWinner() {
    return this.winner;
  }

  getPlayerCount() {
    return this.players.length;
  }

  // grid methods
  createGrid() {
    this.grid = [];

    for (let c = 0; c < this.cols; c++) {
      const col = [];

      for (let r = 0; r < this.rows; r++) {
        col.push(null);
      }

      this.grid.push(col);
    }
  }

  /**
   * Gets the grid as a flat array of objects.
   *
   * Reverses the rows before flattening, i.e. bottom row becomes top.
   *
   * The original row and column are stored as properties on the objects.
   */
  getSlots() {
    const slots: Slot[] = [];

    for (let c = 0; c < this.cols; c++) {
      for (let r = this.rows - 1; r >= 0; r--) {
        slots.push({
          color: this.grid[c][r],
          win: this.winningSlots.findIndex((s) => s.row === r && s.col === c) !== -1,
          col: c,
          row: r,
        });
      }
    }

    return slots;
  }

  setGridSize(rows: number, cols: number) {
    if (rows > 0 && cols > 0 && rows <= 10 && cols <= 10) {
      this.rows = rows;
      this.cols = cols;

      this.createGrid();
      return true;
    }

    return false;
  }

  getRows() {
    return this.rows;
  }

  getCols() {
    return this.cols;
  }

  // game methods
  start(playing?: Player) {
    if (this.started) return false;

    this.started = true;
    this.createGrid();

    // pick random player to start
    this.playing = playing
      ? this.players[this.findIndexOfPlayer(playing)]
      : this.players[Math.floor(Math.random() * this.getPlayerCount())];

    return true;
  }

  hasStarted() {
    return this.started;
  }

  restart(playing?: Player) {
    if (!this.started && !this.winner) return false;

    this.started = false;
    this.winner = undefined;
    this.winningSlots = [];

    return this.start(playing);
  }

  nextTurn() {
    if (!this.playing) return;

    const win = this.checkForWin();
    if (win) {
      this.playing = undefined;
      return;
    }

    if (this.isBoardFull()) {
      this.winner = {
        id: "BoardFullDraw" + Date.now(),
        username: "Draw",
        color: Colors.RED,
      };
      this.playing = undefined;
      return;
    }

    // move turn to next player
    this.playing = this.getNextPlayer(this.playing);
  }

  isBoardFull() {
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const slot = this.grid[c][r];
        if (slot === null) return false;
      }
    }

    return true;
  }

  checkForWin(): boolean {
    for (const p of this.players) {
      const win = this.areFourConnected(p.color);
      if (win) {
        this.winner = p;
        return true;
      }
    }

    return false;
  }

  dropPiece(player: Player, col: number) {
    if (col < 0 || col >= this.cols || !this.findPlayerById(player) || player.id !== this.playing?.id)
      return false;

    const column = this.grid[col];
    const i = column.findIndex((r) => r === null);
    if (i === -1) return false;

    column[i] = player.color;

    this.nextTurn();
    return true;
  }

  protected areFourConnected(c: Colors): boolean {
    const rows = this.getRows();
    const cols = this.getCols();

    // horizontal check
    for (let j = 0; j < rows - 3; j++) {
      for (let i = 0; i < cols; i++) {
        if (
          this.grid[i][j] == c &&
          this.grid[i][j + 1] == c &&
          this.grid[i][j + 2] == c &&
          this.grid[i][j + 3] == c
        ) {
          this.winningSlots = [];
          for (let k = 0; k <= 3; k++) {
            this.winningSlots.push({
              color: c,
              win: true,
              row: j + k,
              col: i,
            });
          }

          return true;
        }
      }
    }
    // vertical check
    for (let i = 0; i < cols - 3; i++) {
      for (let j = 0; j < rows; j++) {
        if (
          this.grid[i][j] == c &&
          this.grid[i + 1][j] == c &&
          this.grid[i + 2][j] == c &&
          this.grid[i + 3][j] == c
        ) {
          this.winningSlots = [];
          for (let k = 0; k <= 3; k++) {
            this.winningSlots.push({
              color: c,
              win: true,
              row: j,
              col: i + k,
            });
          }

          return true;
        }
      }
    }
    // ascending diagonal check
    for (let i = 3; i < cols; i++) {
      for (let j = 0; j < rows - 3; j++) {
        if (
          this.grid[i][j] == c &&
          this.grid[i - 1][j + 1] == c &&
          this.grid[i - 2][j + 2] == c &&
          this.grid[i - 3][j + 3] == c
        ) {
          this.winningSlots = [];
          for (let k = 0; k <= 3; k++) {
            this.winningSlots.push({
              color: c,
              win: true,
              row: j + k,
              col: i - k,
            });
          }

          return true;
        }
      }
    }
    // descending diagonal check
    for (let i = 3; i < cols; i++) {
      for (let j = 3; j < rows; j++) {
        if (
          this.grid[i][j] == c &&
          this.grid[i - 1][j - 1] == c &&
          this.grid[i - 2][j - 2] == c &&
          this.grid[i - 3][j - 3] == c
        ) {
          this.winningSlots = [];
          for (let k = 0; k <= 3; k++) {
            this.winningSlots.push({
              color: c,
              win: true,
              row: j - k,
              col: i - k,
            });
          }

          return true;
        }
      }
    }

    return false;
  }
}
