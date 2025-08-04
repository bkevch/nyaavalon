// src/routes/game/[gameId]/+page.server.ts

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad  = async ({ params }) => {
  // This function runs on the server. Its only job here is to
  // get the gameId from the URL and pass it to the page component.
  const { gameId } = params;
  return { gameId: gameId };
};
