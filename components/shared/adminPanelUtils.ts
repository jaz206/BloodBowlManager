export const transformGitHubUrl = (url: string | undefined | null): string => {
    if (!url || typeof url !== 'string') return url || '';

    if (url.includes('github.com') && url.includes('/blob/')) {
        return url
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob/', '/');
    }

    if (url.includes('raw.githubusercontent.com') && url.includes('/blob/')) {
        return url.replace('/blob/', '/');
    }

    return url;
};

export const escapeCSV = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = Array.isArray(val) ? val.join(' | ') : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
};

export const downloadCSV = (filename: string, rows: unknown[][]) => {
    const csv = '\uFEFF' + rows.map(r => r.map(escapeCSV).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

export const parseCSV = (text: string): { headers: string[]; rows: Record<string, string>[] } => {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
    const splitLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQ = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') {
                if (inQ && line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQ = !inQ;
                }
            } else if (c === ',' && !inQ) {
                result.push(cur.trim());
                cur = '';
            } else {
                cur += c;
            }
        }
        result.push(cur.trim());
        return result;
    };

    const headers = splitLine(lines[0].replace(/^\uFEFF/, ''));
    const rows = lines.slice(1).map(l => {
        const vals = splitLine(l);
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
    });
    return { headers, rows };
};
