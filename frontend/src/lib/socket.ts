import { io, Socket } from "socket.io-client";
import { API_URL } from "./api";

let socket: Socket | null = null;

/** Lazily creates a single shared socket connection (cookie-authenticated). */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
}
