(function (root) {
  "use strict";
  var directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

  function SnakeGame(size, random) {
    this.size = Math.max(4, size || 20);
    this.random = random || Math.random;
    this.reset();
  }
  SnakeGame.prototype.reset = function () {
    var x = Math.max(2, Math.floor(this.size / 2) - 1);
    var y = Math.floor(this.size / 2);
    this.snake = [{ x: x, y: y }, { x: x - 1, y: y }, { x: x - 2, y: y }];
    this.direction = directions.right;
    this.queued = null;
    this.food = { x: Math.min(this.size - 1, x + 3), y: y };
    this.score = 0;
    this.over = false;
    this.won = false;
  };
  SnakeGame.prototype.turn = function (name) {
    var next = directions[name];
    if (!next || this.queued || this.over || (next.x === -this.direction.x && next.y === -this.direction.y)) return false;
    this.queued = next;
    return true;
  };
  SnakeGame.prototype.placeFood = function () {
    var occupied = new Set(this.snake.map(function (cell) { return cell.x + "," + cell.y; }));
    var free = [];
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        if (!occupied.has(x + "," + y)) free.push({ x: x, y: y });
      }
    }
    if (!free.length) {
      this.food = null;
      this.won = this.over = true;
    } else this.food = free[Math.floor(this.random() * free.length)];
  };
  SnakeGame.prototype.step = function () {
    if (this.over) return;
    if (this.queued) this.direction = this.queued;
    this.queued = null;
    var head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
    var grows = this.food && head.x === this.food.x && head.y === this.food.y;
    var body = grows ? this.snake : this.snake.slice(0, -1);
    if (head.x < 0 || head.y < 0 || head.x >= this.size || head.y >= this.size || body.some(function (cell) { return cell.x === head.x && cell.y === head.y; })) {
      this.over = true;
      return;
    }
    this.snake.unshift(head);
    if (grows) { this.score += 10; this.placeFood(); }
    else this.snake.pop();
  };
  if (typeof module !== "undefined" && module.exports) module.exports = SnakeGame;
  else root.ZaiyeSnake = SnakeGame;
})(typeof window !== "undefined" ? window : globalThis);
