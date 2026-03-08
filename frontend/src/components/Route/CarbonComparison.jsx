import { useState } from "react";

const API_BASE = "http://localhost:5000/api";

// Minimal inline styles matching the app's dark theme
const S = {
    wrap: {
        background: "#0d1017",
        border: "1px solid #1e2530",
        borderRadius: 8,
        padding: "20px",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        color: "#e2e8f0",
        marginTop: 16,
    },
    label: {
        fontSize: 10,
        letterSpacing: "0.12em",
        color: "#64748b",
        textTransform: "uppercase",
        marginBottom: 6,
        display: "block",
    },
    input: {
        width: "100%",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid #2d3748",
        color: "#e2e8f0",
        fontSize: 13,
        padding: "6px 0",
        outline: "none",
        fontFamily: "inherit",
        boxSizing: "border-box",
    },
    btn: {
        width: "100%",
        background: "#14b8a6",
        color: "#000",
        border: "none",
        borderRadius: 6,
        padding: "12px",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        cursor: "pointer",
        marginTop: 16,
        letterSpacing: "0.05em",
    },
    card: {
        background: "#111827",
        border: "1px solid #1e2530",
        borderRadius: 6,
        padding: "14px 16px",
    },
    row: { display: "flex", flexDirection: "column", gap: 10, marginTop: 14 },
    modeTitle: { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 },
    stat: { display: "flex", gap: 8, justifyContent: "space-between", marginBottom: 6, fontSize: 12 },
    statLabel: { color: "#64748b" },
    statVal: { color: "#e2e8f0", fontWeight: 600 },
    recBanner: {
        borderRadius: 6,
        padding: "12px 16px",
        marginTop: 14,
        fontSize: 12,
        lineHeight: 1.6,
    },
    divider: { borderTop: "1px solid #1e2530", margin: "14px 0" },
    error: { color: "#f87171", fontSize: 12, marginTop: 10 },
    loading: { color: "#64748b", fontSize: 12, marginTop: 10, textAlign: "center" },
};

function FuelBar({ value, max = 100, color }) {
    return (
        <div style={{ background: "#1e2530", borderRadius: 3, height: 4, marginTop: 4 }}>
            <div style={{
                width: `${Math.min(100, (value / max) * 100)}%`,
                background: color,
                height: "100%",
                borderRadius: 3,
                transition: "width 0.6s ease",
            }} />
        </div>
    );
}

export default function CarbonComparison({ defaultOrigin = "", defaultDestination = "" }) {
    const [origin, setOrigin] = useState(defaultOrigin);
    const [destination, setDestination] = useState(defaultDestination);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function compare() {
        if (!origin.trim() || !destination.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await fetch(`${API_BASE}/routes/compare`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ origin, destination }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    const isCycling = result?.recommendation === "cycling";

    return (
        <div style={S.wrap}>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 2 }}>
                    🌿 CARBON COST NAVIGATOR
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                    True cost comparison — driving vs cycling
                </div>
            </div>

            {/* Inputs */}
            <div style={{ marginBottom: 12 }}>
                <label style={S.label}>Origin</label>
                <input
                    style={S.input}
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    placeholder="e.g. Bloor St Toronto"
                    onKeyDown={e => e.key === "Enter" && compare()}
                />
            </div>
            <div style={{ marginBottom: 12 }}>
                <label style={S.label}>Destination</label>
                <input
                    style={S.input}
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="e.g. Union Station Toronto"
                    onKeyDown={e => e.key === "Enter" && compare()}
                />
            </div>

            <button style={S.btn} onClick={compare} disabled={loading}>
                {loading ? "Analyzing route..." : "Compare →"}
            </button>

            {error && <div style={S.error}>⚠ {error}</div>}
            {loading && <div style={S.loading}>Fetching route + analyzing {result?.cycling?.nearbySegments ?? "..."} bike segments...</div>}

            {/* Results */}
            {result && (
                <>
                    <div style={S.divider} />

                    {/* Recommendation banner */}
                    <div style={{
                        ...S.recBanner,
                        background: isCycling ? "rgba(20,184,166,0.1)" : "rgba(99,102,241,0.1)",
                        border: `1px solid ${isCycling ? "#14b8a6" : "#6366f1"}`,
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: isCycling ? "#14b8a6" : "#818cf8" }}>
                            {isCycling ? "🚴 CYCLE THIS ROUTE" : "🚗 DRIVE THIS ROUTE"}
                        </div>
                        <div style={{ color: "#94a3b8" }}>{result.recommendationReason}</div>
                    </div>

                    {/* Mode cards */}
                    <div style={S.row}>
                        {/* Driving */}
                        <div style={{
                            ...S.card,
                            borderColor: !isCycling ? "#6366f1" : "#1e2530",
                        }}>
                            <div style={{ ...S.modeTitle, color: "#818cf8" }}>🚗 Driving</div>

                            <div style={S.stat}>
                                <span style={S.statLabel}>Distance</span>
                                <span style={S.statVal}>{result.driving.distanceKm} km</span>
                            </div>
                            <div style={S.stat}>
                                <span style={S.statLabel}>Time</span>
                                <span style={S.statVal}>{result.driving.durationMin} min</span>
                            </div>
                            <div style={S.stat}>
                                <span style={S.statLabel}>Fuel cost</span>
                                <span style={S.statVal}>${result.driving.fuelCostCAD}</span>
                            </div>
                            <div style={S.stat}>
                                <span style={S.statLabel}>Carbon tax</span>
                                <span style={S.statVal}>${result.driving.carbonTaxCAD}</span>
                            </div>
                            <div style={S.stat}>
                                <span style={S.statLabel}>CO₂ emitted</span>
                                <span style={{ color: "#f87171", fontWeight: 600 }}>{result.driving.carbonKg} kg</span>
                            </div>
                            <div style={{ ...S.divider, margin: "10px 0" }} />
                            <div style={S.stat}>
                                <span style={S.statLabel}>Total cost</span>
                                <span style={{ color: "#f87171", fontWeight: 700, fontSize: 14 }}>${result.driving.totalCostCAD}</span>
                            </div>
                            <FuelBar value={result.driving.dangerousIntersections} max={20} color="#f87171" />
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
                                {result.driving.dangerousIntersections} danger zones on route
                            </div>
                        </div>

                        {/* Cycling */}
                        <div style={{
                            ...S.card,
                            borderColor: isCycling ? "#14b8a6" : "#1e2530",
                        }}>
                            <div style={{ ...S.modeTitle, color: "#14b8a6" }}>🚴 Cycling</div>

                            <div style={S.stat}>
                                <span style={S.statLabel}>Distance</span>
                                <span style={S.statVal}>{result.cycling.distanceKm} km</span>
                            </div>
                            <div style={S.stat}>
                                <span style={S.statLabel}>Time</span>
                                <span style={S.statVal}>
                                    {result.cycling.durationMin} min
                                    {result.cycling.timeDiffMin < 0 && (
                                        <span style={{ color: "#14b8a6", marginLeft: 4, fontSize: 10 }}>
                                            ▲ {Math.abs(result.cycling.timeDiffMin)}min faster
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div style={S.stat}>
                                <span style={S.statLabel}>Cost</span>
                                <span style={{ color: "#14b8a6", fontWeight: 600 }}>FREE</span>
                            </div>
                            <div style={S.stat}>
                                <span style={S.statLabel}>CO₂ emitted</span>
                                <span style={{ color: "#14b8a6", fontWeight: 600 }}>0 kg</span>
                            </div>
                            <div style={S.stat}>
                                <span style={S.statLabel}>Safety score</span>
                                <span style={{ color: result.cycling.safetyScore >= 60 ? "#14b8a6" : "#fbbf24", fontWeight: 600 }}>
                                    {result.cycling.safetyScore}/100
                                </span>
                            </div>
                            <div style={{ ...S.divider, margin: "10px 0" }} />
                            <div style={S.stat}>
                                <span style={S.statLabel}>Protected lanes</span>
                                <span style={{ color: "#14b8a6", fontWeight: 700, fontSize: 14 }}>{result.cycling.safeLanePercent}%</span>
                            </div>
                            <FuelBar value={result.cycling.safeLanePercent} max={100} color="#14b8a6" />
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
                                {result.cycling.nearbySegments} bike segments analyzed
                            </div>
                        </div>
                    </div>

                    {/* Savings summary */}
                    <div style={{
                        background: "#0a0f17",
                        borderRadius: 6,
                        padding: "12px 16px",
                        marginTop: 10,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                        border: "1px solid #1e2530",
                    }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#14b8a6" }}>${result.comparison.costSavedCAD}</div>
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>SAVED</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#14b8a6" }}>{result.comparison.carbonSavedKg} kg</div>
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>CO₂ AVOIDED</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#14b8a6" }}>{result.cycling.safeLanePercent}%</div>
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>PROTECTED</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: result.cycling.timeDiffMin < 0 ? "#14b8a6" : "#fbbf24" }}>
                                {result.cycling.timeDiffMin < 0 ? `${Math.abs(result.cycling.timeDiffMin)}min` : `+${result.cycling.timeDiffMin}min`}
                            </div>
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                                {result.cycling.timeDiffMin < 0 ? "FASTER" : "SLOWER"}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}