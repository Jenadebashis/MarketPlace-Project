const generateRoomId = (id1, id2) => {
  // Sort them so the smaller number always comes first
  const sortedIds = [Number(id1), Number(id2)].sort((a, b) => a - b);
  return `room-${sortedIds[0]}-${sortedIds[1]}`;
};

export default generateRoomId;