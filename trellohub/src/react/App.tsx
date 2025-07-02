import React, {useEffect, useState} from "react";
import Board from "./components/Board";

const App: React.FC = () => {
  const [result, setResult] = useState("");
  
  const getMock = async () => {
    try {
      if (!window.electronAPI) {
        console.error('ElectronAPI não está disponível');
        return;
      }

      const response = await window.electronAPI.getMock("teste");

      setResult(response);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getMock();
  }, []);

  return (
    <div className="min-h-screen">
      <Board />
    </div>
  );
};

export default App;
