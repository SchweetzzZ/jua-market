import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000", // URL do seu backend
});

// Exporte o hook useSession diretamente do authClient
export const { useSession } = authClient;
