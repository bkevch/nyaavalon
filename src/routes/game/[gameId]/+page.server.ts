export const load = async ({ params }) => {
  const { gameId } = params;
  // // Fetch initial game data from your server using the gameId
  // const gameData = await fetchGameData(gameId);
  // load the users, host;
  return { gameId: gameId };
};