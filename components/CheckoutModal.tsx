import React, { useState, useEffect } from 'react';
import { Tenant, Room, MaintenanceTicket, RentStatus } from '../types';
import { AlertTriangle, CheckCircle, X, Loader2, CreditCard, Wrench, Shield, UserX, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: Tenant;
    room: Room | undefined;
    tickets: MaintenanceTicket[];
    onConfirm: (tenantId: string) => void;
}

type Step = 'CHECK' | 'PROCESSING' | 'DONE';

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, tenant, room, tickets, onConfirm }) => {
    const [step, setStep] = useState<Step>('CHECK');
    const [processStatus, setProcessStatus] = useState({
        faceId: 'PENDING', // PENDING, LOADING, DONE
        lockCode: 'PENDING',
        database: 'PENDING'
    });

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('CHECK');
            setProcessStatus({ faceId: 'PENDING', lockCode: 'PENDING', database: 'PENDING' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- Validation Logic ---
    const pendingTickets = tickets.filter(t => t.room === room?.number && t.status !== 'DONE');
    const hasUnpaidRent = tenant.rentStatus !== RentStatus.PAID;
    const hasUtilityDebt = (room?.utilityBalance || 0) < 0;

    const hasBlockers = hasUnpaidRent || hasUtilityDebt || pendingTickets.length > 0;

    // --- Actions ---
    const handleExecuteCheckout = () => {
        setStep('PROCESSING');
        
        // Simulate IoT Delays
        setTimeout(() => setProcessStatus(p => ({ ...p, faceId: 'LOADING' })), 500);
        setTimeout(() => setProcessStatus(p => ({ ...p, faceId: 'DONE' })), 1500);
        
        setTimeout(() => setProcessStatus(p => ({ ...p, lockCode: 'LOADING' })), 1500);
        setTimeout(() => setProcessStatus(p => ({ ...p, lockCode: 'DONE' })), 2500);

        setTimeout(() => setProcessStatus(p => ({ ...p, database: 'LOADING' })), 2500);
        setTimeout(() => {
            setProcessStatus(p => ({ ...p, database: 'DONE' }));
            setStep('DONE');
        }, 3500);
    };

    const handleFinalClose = () => {
        onConfirm(tenant.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <UserX className="text-red-600" size={20} /> 办理退宿
                    </h3>
                    {step !== 'PROCESSING' && (
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    
                    {/* STEP 1: CHECK & CONFIRM */}
                    {step === 'CHECK' && (
                        <div className="space-y-6">
                            {/* User Info Card */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">👤</div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{tenant.name}</h4>
                                    <p className="text-xs text-slate-500">{tenant.company}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-sm font-medium text-slate-900">{room?.number || '未分配'}室</div>
                                    <div className="text-xs text-slate-500">{tenant.bedId?.split('-')[2]}号床</div>
                                </div>
                            </div>

                            {/* Validation Items */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-700">退宿前校验</h4>
                                
                                {/* Rent Check */}
                                <div className={`flex items-center justify-between p-3 rounded-lg border ${hasUnpaidRent ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={18} className={hasUnpaidRent ? 'text-red-500' : 'text-green-600'} />
                                        <span className="text-sm font-medium">房租缴纳状态</span>
                                    </div>
                                    {hasUnpaidRent ? (
                                        <span className="text-xs font-bold text-red-600 px-2 py-1 bg-white rounded border border-red-100">存在欠费</span>
                                    ) : (
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle size={12} /> 已结清</span>
                                    )}
                                </div>

                                {/* Utility Check */}
                                <div className={`flex items-center justify-between p-3 rounded-lg border ${hasUtilityDebt ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={18} className={hasUtilityDebt ? 'text-red-500' : 'text-green-600'} />
                                        <span className="text-sm font-medium">水电余额校验</span>
                                    </div>
                                    {hasUtilityDebt ? (
                                        <span className="text-xs font-bold text-red-600 px-2 py-1 bg-white rounded border border-red-100">
                                            欠费 ¥{Math.abs(room?.utilityBalance || 0).toFixed(2)}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle size={12} /> 余额正常</span>
                                    )}
                                </div>

                                {/* Ticket Check */}
                                <div className={`flex items-center justify-between p-3 rounded-lg border ${pendingTickets.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <Wrench size={18} className={pendingTickets.length > 0 ? 'text-orange-500' : 'text-green-600'} />
                                        <span className="text-sm font-medium">未完成报修工单</span>
                                    </div>
                                    {pendingTickets.length > 0 ? (
                                        <span className="text-xs font-bold text-orange-600 px-2 py-1 bg-white rounded border border-orange-100">
                                            {pendingTickets.length} 个待处理
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle size={12} /> 无关联工单</span>
                                    )}
                                </div>
                            </div>

                            {hasBlockers && (
                                <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-3 rounded">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <p>存在未结清款项或未完成工单，建议处理后再退宿。强制退宿可能导致财务坏账。</p>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50">
                                    取消
                                </button>
                                <button 
                                    onClick={handleExecuteCheckout}
                                    className={`flex-1 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all ${hasBlockers ? 'bg-red-400 hover:bg-red-500' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {hasBlockers ? '强制退宿' : '确认退宿'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PROCESSING */}
                    {step === 'PROCESSING' && (
                        <div className="space-y-6 py-8">
                            <h4 className="text-center font-bold text-slate-800 text-lg mb-6">正在撤销权限...</h4>
                            
                            <div className="space-y-4">
                                {/* Face ID Item */}
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <Shield size={20} className="text-blue-500" />
                                        <span className="text-sm font-medium text-slate-700">门禁人脸库 (楼栋大门)</span>
                                    </div>
                                    {processStatus.faceId === 'PENDING' && <span className="text-xs text-slate-400">等待中...</span>}
                                    {processStatus.faceId === 'LOADING' && <Loader2 size={18} className="animate-spin text-blue-600" />}
                                    {processStatus.faceId === 'DONE' && <CheckCircle size={18} className="text-green-500" />}
                                </div>

                                {/* Lock Code Item */}
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 flex items-center justify-center border-2 border-slate-400 rounded text-[10px] font-bold text-slate-500">:::</div>
                                        <span className="text-sm font-medium text-slate-700">智能锁密码 (宿舍房门)</span>
                                    </div>
                                    {processStatus.lockCode === 'PENDING' && <span className="text-xs text-slate-400">等待中...</span>}
                                    {processStatus.lockCode === 'LOADING' && <Loader2 size={18} className="animate-spin text-blue-600" />}
                                    {processStatus.lockCode === 'DONE' && <CheckCircle size={18} className="text-green-500" />}
                                </div>

                                {/* DB Item */}
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <UserX size={20} className="text-purple-500" />
                                        <span className="text-sm font-medium text-slate-700">释放床位 & 归档数据</span>
                                    </div>
                                    {processStatus.database === 'PENDING' && <span className="text-xs text-slate-400">等待中...</span>}
                                    {processStatus.database === 'LOADING' && <Loader2 size={18} className="animate-spin text-blue-600" />}
                                    {processStatus.database === 'DONE' && <CheckCircle size={18} className="text-green-500" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DONE */}
                    {step === 'DONE' && (
                        <div className="text-center py-6 space-y-4 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">退宿办理完成</h3>
                            <p className="text-slate-500 text-sm px-6">
                                租户 <strong>{tenant.name}</strong> 的所有通行权限已即时失效，床位已释放为空闲状态。
                            </p>
                            <button 
                                onClick={handleFinalClose}
                                className="w-full mt-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
                            >
                                完成并关闭
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;