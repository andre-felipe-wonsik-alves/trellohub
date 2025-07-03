import React, { useState } from "react";
import Board from "./components/Board";

const App: React.FC = () => {
  const [connectStatus, setConnectStatus] = useState('Disconnected');
  return (
    <div className="min-h-screen">
      <Board />
    </div>
  );
};

export default App;
