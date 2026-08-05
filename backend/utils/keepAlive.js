import https from "https";
import http from "http";

export const keepAlive = (url, mins = 14) => {
    if (!url) return;

    console.log(`Setting up keep-alive ping for ${url} every ${mins} minutes`);

    setInterval(() => {
        const protocol = url.startsWith("https") ? https : http;

        protocol.get(url, (res) => {
            console.log(`[Keep-Alive] Pinged ${url} - Status: ${res.statusCode}`);
        }).on("error", (err) => {
            console.error(`[Keep-Alive] Ping failed:`, err.message);
        });
    }, mins * 60 * 1000);
};
