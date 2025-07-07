import type { Card, BoardState } from "../types";

export function mapIssuesToBoard(issues: any[]): BoardState {
  const columns: BoardState["columns"] = [
    { id: "col1", title: "A Fazer", cards: [] as Card[] },
    { id: "col2", title: "Em Progresso", cards: [] as Card[] },
    { id: "col3", title: "Concluído", cards: [] as Card[] },
  ];

  for (const issue of issues) {
    const labels = (issue.labels || []).map((l: any) => l.name);

    let status: "todo" | "in-progress" | "done" = "todo";
    if (issue.state === "closed") {
      status = "done";
    } else if (labels.includes("in-progress")) {
      status = "in-progress";
    }

    const card = {
      id: issue.number.toString(),
      title: issue.title,
      description: issue.body || "",
      status,
    };

    const columnIndex =
      status === "todo" ? 0 : status === "in-progress" ? 1 : 2;

    columns[columnIndex].cards.push(card);
  }

  return { columns };
}
