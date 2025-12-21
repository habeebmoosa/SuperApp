"use client";

import { cn } from "@/lib/utils";

interface Column {
    key: string;
    header: string;
    render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: Record<string, unknown>[];
    className?: string;
    emptyMessage?: string;
}

export function DataTable({ columns, data, className, emptyMessage = "No data" }: DataTableProps) {
    if (data.length === 0) {
        return (
            <div className="p-8 text-center text-[var(--text-tertiary)] font-mono text-sm">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={cn("overflow-x-auto rounded-xl border border-[var(--border-primary)]", className)}>
            <table className="w-full border-collapse font-mono text-sm">
                <thead>
                    <tr className="bg-[var(--bg-tertiary)]">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="text-left py-3 px-4 font-medium text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-t border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="py-3 px-4 text-[var(--text-primary)]">
                                    {col.render
                                        ? col.render(row[col.key], row)
                                        : formatValue(row[col.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function formatValue(value: unknown): React.ReactNode {
    if (value === null || value === undefined) {
        return <span className="text-[var(--text-tertiary)]">—</span>;
    }

    if (typeof value === "number") {
        return <span className="bracket">{value.toLocaleString()}</span>;
    }

    if (typeof value === "boolean") {
        return (
            <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] uppercase font-medium",
                value
                    ? "bg-[var(--accent-success)]/15 text-[var(--accent-success)]"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
            )}>
                {value ? "Yes" : "No"}
            </span>
        );
    }

    if (typeof value === "object") {
        return <span className="text-[var(--text-secondary)]">{JSON.stringify(value)}</span>;
    }

    return String(value);
}

// Simple card-style output for objects
export function DataCard({ data, className }: { data: Record<string, unknown>; className?: string }) {
    return (
        <div className={cn("space-y-3 p-4 rounded-xl bg-[var(--bg-secondary)]", className)}>
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                    <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                        {formatValue(value)}
                    </span>
                </div>
            ))}
        </div>
    );
}
