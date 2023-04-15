// @ts-ignore
import phin from "phin";
import { SharedConfiguration } from "./types"

export async function loadSharedConfiguration(url: string): Promise<SharedConfiguration> {
    try {
        const response = await phin<SharedConfiguration>({
            url,
            parse: "json",
            followRedirects: true
        });

        console.log("~ loading configuration from URL: " + url)

        if (response.statusCode !== 200) {
            throw new Error(`Failed request: ${response.statusMessage}`);
        }

        return response.body;
    } catch (error) {
        const errMsg = (error as Error).message || "Unknown error";
        throw new Error("Error loading configuration: " + errMsg);
    }
}
