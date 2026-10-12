
import { io } from "socket.io-client";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SOCKET_URL = new URL(API_BASE).origin;

export function createTaskFlowSocket() {
  return io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });
}
