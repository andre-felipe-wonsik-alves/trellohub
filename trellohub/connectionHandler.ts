import { Octokit } from "@octokit/rest";
import cron from "node-cron"

async function getIssues(owner: string, repo: string): Promise<any> {
    const octokit = new Octokit({ 
        auth: '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'
    });

    try {
        const res = await octokit.request("GET /repos/{owner}/{repo}/issues", {
            owner: owner,
            repo: repo
        });

        return res;
    }
    catch(error) {
        throw error;
    }
}

export function cronJobConnectionHandler(name:string, repo: string) {
    const task = cron.schedule("*/5 * * * * *", async () => {
        try {
            const issues = await getIssues(name, repo);

            if (issues.status === 200){
                task.stop();
                return issues.data;
            }
        }
        catch(error) {
            return error.status;
        }
    }, {
        maxExecutions: 5
    });
}