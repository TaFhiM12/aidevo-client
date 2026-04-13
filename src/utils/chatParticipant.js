export const getOtherParticipant = (conversation, currentUserObjectId) => {
  if (!conversation?.participants || !currentUserObjectId) return null;

  return (
    conversation.participants.find(
      (participant) => String(participant.userId) !== String(currentUserObjectId)
    ) || null
  );
};

export const getMyParticipant = (conversation, currentUserObjectId) => {
  if (!conversation?.participants || !currentUserObjectId) return null;

  return (
    conversation.participants.find(
      (participant) => String(participant.userId) === String(currentUserObjectId)
    ) || null
  );
};