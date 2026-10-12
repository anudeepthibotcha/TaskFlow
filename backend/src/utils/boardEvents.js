
export function emitBoardEvent(
  req,
  eventName,
  boardId,
  details = {}
) {
  const io = req.app.get("io");

  if (!io || !boardId) return;

  // Send the event only to clients viewing this board.
  io.to(`board:${String(boardId)}`).emit(eventName, {
    ...details,
    boardId: String(boardId),
    timestamp: new Date().toISOString(),
  });
}
