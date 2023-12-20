import type { Server } from "socket.io"
import type { IOMessage } from "../shared"

export const useMessages = (io: Server, messages: IOMessage[]) => {
	const IOSendMessage = function (payload: IOMessage, roomId?: string) {
		if (!messages) return
		messages.push(payload)
		if (!roomId) {
			io.emit("messages:update", messages)
		} else {
			io.to(roomId).emit("messages:update", messages)
		}
	}
	return {
		IOSendMessage,
	}
}
