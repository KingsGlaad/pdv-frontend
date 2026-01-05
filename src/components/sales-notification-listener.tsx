"use strict";
"use client";

import { useEffect } from "react";
import { useSocket } from "@/providers/socket-provider";
import { toast } from "sonner";

export function SalesNotificationListener() {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleSaleCreated = (data: {
      finalAmount?: number;
      total?: number;
    }) => {
      // data might be { saleId, total, finalAmount, etc. }
      const amount = Number(data.finalAmount || data.total || 0).toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL",
        }
      );

      toast.success(`Nova venda realizada!`, {
        description: `Valor: ${amount}`,
        duration: 5000,
      });
    };

    socket.on("sale.created", handleSaleCreated);

    return () => {
      socket.off("sale.created", handleSaleCreated);
    };
  }, [socket]);

  return null;
}
