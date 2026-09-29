export function RichText({ text }: { text: string }) {
    const lines = text
        .replace(/\r/g, '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

    type Block = { type: 'p'; text: string } | { type: 'ul'; items: string[] }
    const blocks: Block[] = []
    let ul: string[] | null = null
    for (const line of lines) {
        if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
            const item = line.replace(/^[-•*]\s*/, '')
            if (!item) continue
            if (!ul) {
                ul = []
                blocks.push({ type: 'ul', items: ul })
            }
            ul.push(item)
        } else {
            ul = null
            blocks.push({ type: 'p', text: line })
        }
    }

    if (blocks.length === 1 && blocks[0].type === 'p') {
        return <>{blocks[0].text}</>
    }

    return (
        <div className="space-y-1.5">
            {blocks.map((b, i) =>
                b.type === 'ul' ? (
                    <ul key={i} className="list-disc space-y-0.5 pl-4">
                        {b.items.map((it, j) => (
                            <li key={j}>{it}</li>
                        ))}
                    </ul>
                ) : (
                    <p key={i}>{b.text}</p>
                )
            )}
        </div>
    )
}
