import type { GoogleAuth } from 'google-auth-library';

export interface FcmOptions {
    serviceAccountFile?: string;
}

export interface FcmCredentials {
    client_email: string;
    private_key: string;
    project_id: string;
    [key: string]: unknown;
}

export interface FcmNotification {
    title?: string;
    body?: string;
    [key: string]: string | undefined;
}

export type FcmData = Record<string, unknown>;

export class Fcm {
    credentials: FcmCredentials | null;
    auth: GoogleAuth | null;

    constructor(options?: FcmOptions);

    accessToken(): Promise<string>;

    send(
        tokens: string[],
        notification?: FcmNotification,
        data?: FcmData
    ): [] | Promise<PromiseSettledResult<any>[]>;
}