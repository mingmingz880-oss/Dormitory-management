
import React, { useState } from 'react';
import { MaintenanceTicket, TransferRequest, CheckoutRequest } from '../types';
import { Wrench, ArrowLeftRight, LogOut, Clock, CheckCircle, Key, FileText, ChevronRight } from 'lucide-react';

interface ApprovalCenterProps {
    tickets: MaintenanceTicket[];
    setTickets: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
    transferRequests: TransferRequest[];
    checkoutRequests: CheckoutRequest[];
    onApproveTransfer: (requestId: string, tenantId: string) => void;
    onApproveCheckout: (requestId: string, tenantId: string) => void;
}

const ApprovalCenter: React.FC<ApprovalCenterProps> = ({ 
    tickets, setTickets, transferRequests, checkoutRequests, onApproveTransfer, onApproveCheckout 
}) => {
    const [activeTab, setActiveTab] = useState<'REPAIR' | 'TRANSFER' | 'CHECKOUT'>('REPAIR');

    const statusMap: Record<string, string> = {
        'OPEN': '待处理',
        'IN_PROGRESS': '处理中',
        'DONE': '已完成',
        'PENDING': '待审批',
        'APPROVED': '已批准',
        'PROCESSED': '已办理',
        'REJECTED': '已驳回'
    };

    const handleGeneratePass = (id: string) => {
        alert(`正在生成临时通行证...\n\n通行码: 892341\n有效期: 2小时\n通行权限: A栋大门 + 目标房间`);
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'IN_PROGRESS', staff: '已指派' } : t));
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
                <button
                    onClick={() => setActiveTab('REPAIR')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                        activeTab === 'REPAIR' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Wrench size={16} /> 故障报修
                    {tickets.filter(t => t.status === 'OPEN').length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                            {tickets.filter(t => t.status === 'OPEN').length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('TRANSFER')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                        activeTab === 'TRANSFER' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <ArrowLeftRight size={16} /> 换宿申请
                    {transferRequests.filter(t => t.status === 'PENDING').length > 0 && (
                         <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                            {transferRequests.filter(t => t.status === 'PENDING').length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('CHECKOUT')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                        activeTab === 'CHECKOUT' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <LogOut size={16} /> 退宿申请
                    {checkoutRequests.filter(t => t.status === 'PENDING').length > 0 && (
                         <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                            {checkoutRequests.filter(t => t.status === 'PENDING').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-6">
                
                {/* REPAIR TAB */}
                {activeTab === 'REPAIR' && (
                    <div className="space-y-4">
                        {tickets.length === 0 && <div className="p-8 text-center text-slate-400 bg-white rounded-xl">暂无工单</div>}
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                                        <Wrench size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-900 text-lg">{ticket.room || '未知房间'}室</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                ticket.status === 'OPEN' ? 'bg-red-50 text-red-600' :
                                                ticket.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' :
                                                'bg-green-50 text-green-600'
                                            }`}>
                                                {statusMap[ticket.status]}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 mt-1">{ticket.description}</p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                            <Clock size={12} /> 提交于 2023-10-25 09:30
                                        </div>
                                    </div>
                                </div>

                                {ticket.status === 'OPEN' && (
                                    <button 
                                        onClick={() => handleGeneratePass(ticket.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                                    >
                                        <Key size={16} /> 授权临时通行
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* TRANSFER TAB */}
                {activeTab === 'TRANSFER' && (
                    <div className="space-y-4">
                         {transferRequests.length === 0 && <div className="p-8 text-center text-slate-400 bg-white rounded-xl">暂无换宿申请</div>}
                         {transferRequests.map(req => (
                             <div key={req.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                        <ArrowLeftRight size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-slate-900 text-lg">{req.tenantName}</h4>
                                            <span className="text-sm text-slate-500">当前: {req.currentRoom}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                req.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                                                req.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                                {statusMap[req.status]}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                                            申请理由: {req.reason}
                                        </div>
                                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                                            <Clock size={12} /> {new Date(req.requestDate).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {req.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50">驳回</button>
                                        <button 
                                            onClick={() => onApproveTransfer(req.id, req.tenantId)}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2"
                                        >
                                            <CheckCircle size={16} /> 批准并办理
                                        </button>
                                    </div>
                                )}
                             </div>
                         ))}
                    </div>
                )}

                {/* CHECKOUT TAB */}
                {activeTab === 'CHECKOUT' && (
                     <div className="space-y-4">
                         {checkoutRequests.length === 0 && <div className="p-8 text-center text-slate-400 bg-white rounded-xl">暂无退宿申请</div>}
                         {checkoutRequests.map(req => (
                             <div key={req.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                        <LogOut size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-slate-900 text-lg">{req.tenantName}</h4>
                                            <span className="text-sm text-slate-500">房间: {req.currentRoom}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                req.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                                                req.status === 'PROCESSED' ? 'bg-green-50 text-green-600' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                                {statusMap[req.status]}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                                            退宿原因: {req.reason}
                                        </div>
                                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                                            <Clock size={12} /> {new Date(req.requestDate).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {req.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                         <button className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50">驳回</button>
                                        <button 
                                            onClick={() => onApproveCheckout(req.id, req.tenantId)}
                                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 shadow-sm flex items-center gap-2"
                                        >
                                            <FileText size={16} /> 办理结算
                                        </button>
                                    </div>
                                )}
                             </div>
                         ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovalCenter;
