import { useState } from "react";

export function useTerminalId() {
  const [terminalId] = useState<string>(() => {
    if (typeof window === "undefined") return "";

    let tid = localStorage.getItem("pdv_terminal_id");
    if (!tid) {
      tid = crypto.randomUUID();
      localStorage.setItem("pdv_terminal_id", tid);
    }
    return tid;
  });

  return terminalId;
}
