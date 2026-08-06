// client/socket.ts
import { io } from "socket.io-client";

export const socket = io();

// optional: log connection once
socket.on("connect", () => console.log("Socket connected:", socket.id));
