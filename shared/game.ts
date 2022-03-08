import { Colors } from "./colors";
import Player from "./player";

export default class Game {
  private host: Player | undefined;
  private players: Player[] = [];

  private rows = 6;
  private cols = 7;

  /**
   * 2D array is column major indexed, uses (c, r) indexing.
   *
   * The 0th index of a column is the bottom row of the board.
   *
   * This is for easier placement of pieces into the board.
   */
  private grid: (Colors | null)[][] = [];

  constructor(host?: Player) {
    this.host = host;
  }

  addPlayer(player: Player) {
    if (!this.host) this.host = player;

    // color is taken
    if (this.findPlayerByColor(player.color)) return;

    this.players.push(player);
  }

  removePlayer(player: Player) {
    const i = this.players.findIndex((p) => p === player);
    if (i === -1) return;

    this.players.splice(i, 1);

    // replace host
    if (player === this.host) {
      this.host = this.players[Math.floor(Math.random() * this.players.length)];
    }
  }

  findPlayerByColor(color: Colors) {
    return this.players.find((p) => p.color === color);
  }

  getPlayerCount() {
    return this.players.length;
  }

  getHost() {
    return this.host;
  }

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

  setGridSize(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;

    this.createGrid();
  }
}
