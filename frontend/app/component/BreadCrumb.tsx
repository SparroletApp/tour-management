import Link from "next/link";

export interface Crumb {
    label: string;
    href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
    return (
        <nav aria-label="breadcrumb" style={{ marginBottom: 12, fontSize: 14 }}>
            {items.map((crumb, i) => {
                const isLast = i === items.length - 1;
                return (
                    <span key={`${crumb.label}-${i}`}>
                        {i > 0 && <span style={{ margin: "0 6px", color: "#888" }}>/</span>}
                        {crumb.href && !isLast ? (
                            <Link href={crumb.href} style={{ color: "#0b5ed7", textDecoration: "none" }}>
                                {crumb.label}
                            </Link>
                        ) : (
                            <span style={{ fontWeight: isLast ? 600 : 400 }}>{crumb.label}</span>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
