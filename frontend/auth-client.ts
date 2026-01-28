import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [
        adminClient()
    ]
});

// Exporte o hook useSession diretamente do authClient
export const { useSession } = authClient;
