import { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { routeApi } from "../../api";

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
        marginBottom: 4,
        display: "block",
    },
    divider: { borderTop: "1px solid #1e2530", margin: "14px 0" },
    stat: { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 },
    statLabel: { color: "#64748b" },
    statVal: { color: "#e2e8f0", fontWeight: 600 },
    eventCard: {
        background: "#111827",
        border: "1px solid #1e2530",
        borderRadius: 6,
        padding: "10px 12px",
        marginBottom: 8,
    },
    severityDot: (severity) => ({
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        marginRight: 6,
        background: severity === "high" ? "#f87171" : severity === "medium" ? "#fbbf24" : "#14b8a6",
        verticalAlign: "middle",
        marginBottom: 1,
    }),
};

function MiniChart({ data }) {
    if (!data || data.length === 0) return null;
    const prices = data.map(d => d.avgPrice).filter(Boolean);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const w = 100 / data.length;

    return (
        <div style={{ marginTop: 12 }}>
            <div style={{ ...S.label }}>Seasonal avg price by month (¢/L)</div>
            <div style={{ display: "flex", alignItems: "flex-end", height: 48, gap: 2, marginTop: 6 }}>
                {data.map((d, i) => {
                    const height = d.avgPrice ? ((d.avgPrice - min) / range) * 38 + 10 : 10;
                    const isCurrentMonth = new Date().toLocaleString("en", { month: "short" }) === d.month;
                    return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                                width: "100%",
                                height,
                                background: isCurrentMonth ? "#14b8a6" : "#1e2530",
                                borderRadius: "2px 2px 0 0",
                                transition: "height 0.5s ease",
                            }} />
                            <div style={{ fontSize: 8, color: isCurrentMonth ? "#14b8a6" : "#374151", marginTop: 2, letterSpacing: 0 }}>
                                {d.month.slice(0, 1)}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#374151", marginTop: 2 }}>
                <span>{min.toFixed(0)}¢</span>
                <span>{max.toFixed(0)}¢</span>
            </div>
        </div>
    );
}

export default function MarketIntelligence({ autoLoad = false }) {
    const { isAuthenticated, loginWithRedirect: login } = useAuth0();
    const [intel, setIntel] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const [intelRes, forecastRes] = await Promise.all([
                routeApi.marketIntelligence({ city: "Ontario" }),
                routeApi.priceForecast({ city: "toronto" }),
            ]);
            const intelData = intelRes.data;
            const forecastData = forecastRes.data;
            if (intelData.error && !intelData.fallback) throw new Error(intelData.error);
            setIntel(intelData);
            setForecast(forecastData);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { if (autoLoad && isAuthenticated) load(); }, [autoLoad, isAuthenticated]);

    const recColor = intel?.recommendation === "fill_now" ? "#f87171"
        : intel?.recommendation === "wait" ? "#14b8a6" : "#fbbf24";

    const outlookArrow = intel?.priceOutlook === "rising" ? "↑"
        : intel?.priceOutlook === "falling" ? "↓" : "→";

    const outlookColor = intel?.priceOutlook === "rising" ? "#f87171"
        : intel?.priceOutlook === "falling" ? "#14b8a6" : "#fbbf24";

    return (
        <div style={S.wrap}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 2 }}>
                        ⚡ FUEL MARKET INTELLIGENCE
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                        AI analysis + statistical forecast
                    </div>
                </div>
                {!loading && (
                    <button onClick={load} disabled={!isAuthenticated} style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#e2e8f0",
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontSize: 11,
                        cursor: isAuthenticated ? "pointer" : "not-allowed",
                        opacity: isAuthenticated ? 1 : 0.4,
                        fontFamily: "inherit",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                         if(isAuthenticated) e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                         if(isAuthenticated) e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    }}>
                        {intel ? "REFRESH" : "LOAD DATA"}
                    </button>
                )}
            </div>

            {!isAuthenticated && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                    borderRadius: 8,
                    border: "1px solid rgba(20, 184, 166, 0.2)",
                    background: "rgba(20, 184, 166, 0.05)",
                    padding: "12px 18px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 18 }}>🔒</span>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", margin: "0 0 2px 0", letterSpacing: "0.02em" }}>
                                Sign in required
                            </p>
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                                Access AI-driven fuel intelligence and forecasts
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => login()}
                        style={{
                            background: "#14b8a6",
                            color: "#ffffff",
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "8px 18px",
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            transition: "background-color 0.2s ease, transform 0.1s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}
                        onMouseEnter={(e) => { e.target.style.background = "#0d9488"; e.target.style.transform = "scale(1.02)"; }}
                        onMouseLeave={(e) => { e.target.style.background = "#14b8a6"; e.target.style.transform = "scale(1)"; }}
                        onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
                        onMouseUp={(e) => e.target.style.transform = "scale(1.02)"}
                    >
                        Log in
                    </button>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: 12 }}>
                    <div style={{ marginBottom: 6 }}>Searching live news + analyzing 8 years of price data...</div>
                    <div style={{ fontSize: 10, color: "#374151" }}>This takes ~20 seconds</div>
                </div>
            )}

            {error && (
                <div style={{ color: "#f87171", fontSize: 12, padding: "10px 0" }}>⚠ {error}</div>
            )}

            {intel && !loading && (
                <>
                    {/* Price + recommendation row */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                        <div style={{ background: "#111827", border: "1px solid #1e2530", borderRadius: 6, padding: "12px 16px", flex: 1 }}>
                            <div style={S.label}>Current price</div>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>{intel.currentPriceCents}¢</div>
                            <div style={{ fontSize: 11, color: outlookColor, marginTop: 2 }}>
                                {outlookArrow} {intel.priceOutlook}
                            </div>
                        </div>
                        <div style={{ background: "#111827", border: "1px solid #1e2530", borderRadius: 6, padding: "12px 16px", flex: 1 }}>
                            <div style={S.label}>4-week forecast</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: outlookColor }}>
                                {intel.predictedRangeLow}–{intel.predictedRangeHigh}¢
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                                confidence: {intel.confidence}
                            </div>
                        </div>
                    </div>

                    {/* Recommendation banner */}
                    <div style={{
                        background: `${recColor}15`,
                        border: `1px solid ${recColor}`,
                        borderRadius: 6,
                        padding: "10px 14px",
                        marginBottom: 14,
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: recColor, marginBottom: 4 }}>
                            {intel.recommendation === "fill_now" ? "⛽ FILL UP NOW"
                                : intel.recommendation === "wait" ? "⏳ WAIT TO FILL"
                                    : "〜 NEUTRAL"}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
                            {intel.recommendationReason}
                        </div>
                    </div>

                    {/* Geopolitical events */}
                    {intel.geopoliticalEvents?.length > 0 && (
                        <>
                            <div style={S.label}>Geopolitical factors</div>
                            {intel.geopoliticalEvents.map((ev, i) => (
                                <div key={i} style={S.eventCard}>
                                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                                        <span style={S.severityDot(ev.severity)} />
                                        {ev.event}
                                        <span style={{
                                            float: "right",
                                            fontSize: 9,
                                            background: ev.severity === "high" ? "#f8717120" : ev.severity === "medium" ? "#fbbf2420" : "#14b8a620",
                                            color: ev.severity === "high" ? "#f87171" : ev.severity === "medium" ? "#fbbf24" : "#14b8a6",
                                            padding: "1px 6px",
                                            borderRadius: 3,
                                            letterSpacing: "0.08em",
                                        }}>
                                            {ev.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "#64748b" }}>{ev.impact}</div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Oil market summary */}
                    {intel.oilMarketSummary && (
                        <>
                            <div style={S.divider} />
                            <div style={S.label}>Market summary</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
                                {intel.oilMarketSummary}
                            </div>
                        </>
                    )}

                    {/* Statistical forecast from CSV */}
                    {forecast && (
                        <>
                            <div style={S.divider} />
                            <div style={S.label}>Statistical forecast ({forecast.dataPointsUsed} data points, {forecast.dataFrom?.slice(0, 4)}–{forecast.dataTo?.slice(0, 4)})</div>
                            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={S.stat}>
                                        <span style={S.statLabel}>Seasonal delta</span>
                                        <span style={{ color: forecast.forecast.seasonalDeltaCents > 0 ? "#f87171" : "#14b8a6", fontWeight: 600 }}>
                                            {forecast.forecast.seasonalDeltaCents > 0 ? "+" : ""}{forecast.forecast.seasonalDeltaCents}¢
                                        </span>
                                    </div>
                                    <div style={S.stat}>
                                        <span style={S.statLabel}>Trend (regression)</span>
                                        <span style={{ color: forecast.forecast.regressionDeltaCents > 0 ? "#f87171" : "#14b8a6", fontWeight: 600 }}>
                                            {forecast.forecast.regressionDeltaCents > 0 ? "+" : ""}{forecast.forecast.regressionDeltaCents}¢
                                        </span>
                                    </div>
                                    <div style={S.stat}>
                                        <span style={S.statLabel}>Volatility</span>
                                        <span style={{ color: forecast.volatility.level === "high" ? "#f87171" : "#fbbf24", fontWeight: 600 }}>
                                            {forecast.volatility.level.toUpperCase()} (±{forecast.volatility.stdDevCents}¢)
                                        </span>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={S.stat}>
                                        <span style={S.statLabel}>Cheapest month</span>
                                        <span style={{ color: "#14b8a6", fontWeight: 600 }}>{forecast.seasonal.cheapestMonth} ({forecast.seasonal.cheapestMonthAvg}¢)</span>
                                    </div>
                                    <div style={S.stat}>
                                        <span style={S.statLabel}>Most expensive</span>
                                        <span style={{ color: "#f87171", fontWeight: 600 }}>{forecast.seasonal.mostExpensiveMonth} ({forecast.seasonal.mostExpensiveMonthAvg}¢)</span>
                                    </div>
                                    <div style={S.stat}>
                                        <span style={S.statLabel}>Stat. range</span>
                                        <span style={S.statVal}>{forecast.forecast.projectedRangeLow}–{forecast.forecast.projectedRangeHigh}¢</span>
                                    </div>
                                </div>
                            </div>
                            <MiniChart data={forecast.seasonal.table} />
                        </>
                    )}

                    <div style={{ fontSize: 10, color: "#374151", marginTop: 12, textAlign: "right" }}>
                        Updated {intel.lastUpdated}
                    </div>
                </>
            )}
        </div>
    );
}