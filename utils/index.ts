import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { GitHubContext, LinearContext } from "../typings";
import { GITHUB } from "./constants";

export const isDev = (): boolean => {
    return process.env.NODE_ENV === "development";
};

export const getWebhookURL = (): string => {
    if (window.location.hostname === "localhost") return "https://example.com";
    return `${window.location.origin}/api`;
};

export const copyToClipboard = (text: string) => {
    if (!window?.navigator) alert("Cannot copy to clipboard");

    navigator?.clipboard?.writeText(text);
};

export const formatJSON = (body: Object): string => {
    return JSON.stringify(body, null, 4);
};

export const clearURLParams = () => {
    const baseURL = window.location.href.split("?")[0];
    window.history.replaceState({}, document.title, baseURL);
};

export const encrypt = (text: string): { hash: string; initVector: string } => {
    const algorithm = "aes-256-ctr";
    const secret = process.env.ENCRYPTION_KEY;

    const initVector = randomBytes(16);
    const cipher = createCipheriv(algorithm, secret, initVector);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        hash: encrypted.toString("hex"),
        initVector: initVector.toString("hex")
    };
};

export const decrypt = (content: string, initVector: string): string => {
    const algorithm = "aes-256-ctr";
    const secret = process.env.ENCRYPTION_KEY;

    const decipher = createDecipheriv(
        algorithm,
        secret,
        Buffer.from(initVector, "hex")
    );
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(content, "hex")),
        decipher.final()
    ]);

    return decrypted.toString();
};

export const getSyncFooter = (): string => {
    return `\n\n> From [SyncLinear.com](https://synclinear.com)`;
};

export const legacySyncFooter = `From [Linear-GitHub Sync](https://synclinear.com)`;

export const saveSync = async (
    linearContext: LinearContext,
    githubContext: GitHubContext
) => {
    const data = {
        github: { ...githubContext },
        linear: { ...linearContext }
    };

    const response = await fetch("/api/save", {
        method: "POST",
        body: JSON.stringify(data)
    });

    return await response.json();
};

export const getAttachmentQuery = (
    issueId: string,
    issueNumber: number,
    repoFullName: string
): string => {
    return `mutation {
        attachmentCreate(input: {
            issueId: "${issueId}"
            title: "GitHub Issue #${issueNumber}"
            subtitle: "Synchronized"
            url: "https://github.com/${repoFullName}/issues/${issueNumber}"
            iconUrl: "${GITHUB.ICON_URL}"
        }) {
            success
        }
    }`;
};

export const skipReason = (
    event: "issue" | "edit" | "comment" | "state change" | "label" | "assignee",
    issueNumber: number | string,
    causedBySync: boolean = false
): string => {
    return `Skipping over ${event} for issue #${issueNumber} as it is ${
        causedBySync ? "caused by sync" : "not synced"
    }.`;
};

