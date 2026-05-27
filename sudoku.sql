-- Skills Battle 2026 - Killer Sudoku schema
-- Database: sudoku

CREATE DATABASE IF NOT EXISTS sudoku;
USE sudoku;

-- Drop tables in dependency order
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS cage_cells;
DROP TABLE IF EXISTS cages;
DROP TABLE IF EXISTS puzzles;
DROP TABLE IF EXISTS users;

-- Users table: accounts and authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);

-- Puzzles table: killer sudoku puzzles metadata
CREATE TABLE puzzles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  difficulty TINYINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_solvable BOOLEAN NOT NULL DEFAULT FALSE,
  avg_rating DECIMAL(3,2) NULL,
  CONSTRAINT fk_puzzles_creator
    FOREIGN KEY (creator_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

-- Cages table: sums per cage for a puzzle
CREATE TABLE cages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  puzzle_id INT NOT NULL,
  target_sum INT NOT NULL,
  CONSTRAINT fk_cages_puzzle
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Cage cells table: cell coordinates per cage
CREATE TABLE cage_cells (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cage_id INT NOT NULL,
  `row` TINYINT NOT NULL,
  `col` TINYINT NOT NULL,
  CONSTRAINT fk_cage_cells_cage
    FOREIGN KEY (cage_id) REFERENCES cages(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Results table: solves and scores per user/puzzle
CREATE TABLE results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  puzzle_id INT NOT NULL,
  time_seconds INT NOT NULL,
  hints_used INT NOT NULL,
  score INT NOT NULL,
  solved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_results_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_results_puzzle
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Ratings table: user ratings for puzzles
CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  puzzle_id INT NOT NULL,
  rating TINYINT NOT NULL,
  rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_ratings_user_puzzle UNIQUE (user_id, puzzle_id),
  CONSTRAINT fk_ratings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_ratings_puzzle
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
