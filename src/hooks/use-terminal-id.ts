import { useState, useEffect } from "react";

export function useTerminalId() {
  const [terminalId, setTerminalId] = useState<string>("");

  useEffect(() => {
    let tid = localStorage.getItem("pdv_terminal_id");
    if (!tid) {
      tid = crypto.randomUUID();
      localStorage.setItem("pdv_terminal_id", tid);
    }
    setTerminalId(tid);
  }, []);

  return terminalId;
}
