import { createAuthClient } from 'better-auth/react';
import { deviceAuthorizationClient } from "better-auth/client/plugins";
// import { deviceAuthorizationClient } from "better-auth/plugins";

// Point the client directly at the Better Auth API base on the server
export const authClient = createAuthClient({
    baseURL:"http://localhost:3005",
    plugins:[
        deviceAuthorizationClient()
    ]
});