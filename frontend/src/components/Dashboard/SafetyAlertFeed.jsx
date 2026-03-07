import { formatDistanceToNow } from 'axios'; // Actually I'll just use a simple formatter to avoid dependency issues if axios isn't meant for that

const TYPE_LABELS = {
    near_miss: 'Near Miss',
    cyclist_conflict: 'Cyclist Conflict',
    pedestrian_conflict: 'Pedestrian Conflict',
    aggressive_driver: 'Aggressive Driving',
};

const SEVERITY_COLORS = {
    5: 'bg-rose-100 text-rose-700 border-rose-200',
    4: 'bg-orange-100 text-orange-700 border-orange-200',
    3: 'bg-amber-100 text-amber-700 border-amber-200',
    2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function SafetyAlertFeed({ reports = [] }) {
    return (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 flex flex-col h-full shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] transition-all duration-700 group">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Intelligence Feed</h3>
                <div className="px-3 py-1 rounded-full bg-blue-50 text-[9px] font-black text-blue-600 uppercase tracking-widest animate-pulse">
                    Live
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {reports.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 mb-4 animate-spin-slow"></div>
                        <span className="text-[10px] uppercase font-black tracking-widest">Scanning Grid...</span>
                    </div>
                ) : (
                    reports.map((report, idx) => (
                        <div
                            key={report._id || idx}
                            className="p-4 rounded-3xl bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:shadow-lg hover:shadow-gray-200/20 transition-all duration-500 group/item animate-in fade-in slide-in-from-right-4"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${SEVERITY_COLORS[Math.round(report.severity)] || SEVERITY_COLORS[3]}`}>
                                    Lvl {Math.round(report.severity)}
                                </span>
                                <span className="text-[9px] font-bold text-gray-300">
                                    {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="text-[11px] font-black text-gray-800 mb-1 leading-tight">
                                {TYPE_LABELS[report.reportType] || 'Incident Reported'}
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed line-clamp-2">
                                {report.description || 'No description provided by operative.'}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:tracking-[0.2em] transition-all">
                    View All Metrics →
                </button>
            </div>
        </div>
    );
}
