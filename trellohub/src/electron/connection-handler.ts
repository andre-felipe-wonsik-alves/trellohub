import axios from "axios";
import cron from "node-cron"
import { observer } from "./utils/http/http-observer.js"

interface ConnectionResult {
    status: number,
    message: string
}


async function verify_connection(): Promise<ConnectionResult> {
    try {
        const res = await axios.get("https://google.com");

        return {
            status: res.status,
            message: "Connection reestablished"
        }
    }
    catch (error: any) {
        let status = 500;
        let message = "Unknown error";

        if (error.response) {
            status = error.response.status;
            message = error.response.statusText;
        }
        else if (error.request) {
            message = "No response from server";
        }

        return {
            status,
            message
        }
    }
}

export async function check_connection(error: any) { // resolvendo a assinatura que fiz no observer
    const connectionResult = new Promise<ConnectionResult>((resolve, reject) => {
        const task = cron.schedule("*/5 * * * * *", async () => {
            try {
                const result = await verify_connection()
                resolve(result);
                if (result.status === 200){
                    task.stop();
                }
            }
            catch (error) {
                reject(`Status: ${error}`);
            }
        })
    })

    return connectionResult;
}
observer.subscribe(check_connection);