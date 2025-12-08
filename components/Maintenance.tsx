import React from 'react';
import { Clock, CheckCircle, Wrench, Key } from 'lucide-react';
import { MaintenanceTicket } from '../types';

interface MaintenanceProps {
    tickets: MaintenanceTicket[];
    setTickets: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
}

const Maintenance: React.FC<MaintenanceProps> = ({ tickets, setTickets }) => {
    
    const statusMap: Record<string, string> = {
        'OPEN': '待处理',
        'IN_PROGRESS': '处理中',
        'DONE': '已完成'
    };

    const handleGeneratePass = (id: string) => {
        alert(`正在生成临时通行证...\n\n通行码: 892341\n有效期: 2小时\n通行权限: A栋大门 + 302室`);
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'IN_PROGRESS', staff: '已指派' } : t));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Wrench size={20} /> 进行中的报修
                </h3>
                {tickets.length === 0 && <div className="text-slate-400 text-sm">暂无报修工单</div>}
                {tickets.map(ticket => (
                    <div key={ticket.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="font-bold text-slate-900">{ticket.room || '未知房间'}室</span>
                                <p className="text-sm text-slate-600 mt-1">{ticket.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                ticket.status === 'OPEN' ? 'bg-red-50 text-red-600' :
                                ticket.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' :
                                'bg-green-50 text-green-600'
                            }`}>
                                {statusMap[ticket.status]}
                            </span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                             <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock size={14} /> 2023-10-25 09:30
                             </div>
                             {ticket.status === 'OPEN' && (
                                 <button 
                                    onClick={() => handleGeneratePass(ticket.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800 transition-colors">
                                    <Key size={14} /> 授权临时通行
                                 </button>
                             )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">维修自动授权</h4>
                <p className="text-sm text-slate-500 mt-2 max-w-xs">
                    指派工单后，系统将自动为维修人员生成2小时有效期的临时门禁/门锁权限，无需人工开门。
                </p>
            </div>
        </div>
    );
};

export default Maintenance;