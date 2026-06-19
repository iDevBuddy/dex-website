// Nothing-style dot-matrix number — only the lit dots (no background dots).
// Inherits color via currentColor so it adapts on hover.
const DIGITS = {
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    '%': ['11001', '11010', '00100', '00100', '01000', '10011', '00011'],
}

export default function DotNum({ value, cell = 4, className = '' }) {
    const r = cell * 0.34
    return (
        <span className={`inline-flex items-start gap-[3px] leading-none ${className}`} aria-label={String(value)}>
            {String(value).split('').map((ch, i) => {
                const rows = DIGITS[ch]
                if (!rows) return <span key={i} className="font-mono">{ch}</span>
                return (
                    <svg key={i} width={5 * cell} height={7 * cell} viewBox={`0 0 ${5 * cell} ${7 * cell}`} className="block" aria-hidden="true">
                        {rows.map((row, y) =>
                            row.split('').map((c, x) =>
                                c === '1' ? <circle key={`${y}-${x}`} cx={x * cell + cell / 2} cy={y * cell + cell / 2} r={r} fill="currentColor" /> : null
                            )
                        )}
                    </svg>
                )
            })}
        </span>
    )
}
