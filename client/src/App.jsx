import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import PuzzleList from "./pages/PuzzleList.jsx";
import PuzzleSolver from "./pages/PuzzleSolver.jsx";
import PuzzleCreator from "./pages/PuzzleCreator.jsx";
import HighScores from "./pages/HighScores.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/puzzles" element={<PuzzleList />} />
          <Route path="/puzzles/:id" element={<PuzzleSolver />} />
          <Route path="/create" element={<PuzzleCreator />} />
          <Route path="/highscores" element={<HighScores />} />
          <Route path="/account" element={<AccountSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
