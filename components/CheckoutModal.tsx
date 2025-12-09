
import React, { useState, useEffect } from 'react';
import { Tenant, Room, MaintenanceTicket, RentStatus } from '../types';
import { AlertTriangle, CheckCircle, X, Loader2, CreditCard, Wrench, Shield, UserX, AlertCircle, CheckSquare } from 'lucide-react';

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

    // Manual Verification States
    const [rentVerified, setRentVerified] = useState(false);
    const [utilityVerified, setUtilityVerified] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('CHECK');
            setProcessStatus({ faceId: 'PENDING', lockCode: 'PENDING', database: 'PENDING' });
            setRentVerified(false);
            setUtilityVerified(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- Validation Logic (For Display Only) ---
    const pendingTickets = tickets.filter(t => t.room === room?.number && t.status !== 'DONE');
    const hasUnpaidRent = tenant.rentStatus !== RentStatus.PAID;
    const hasUtilityDebt = (room?.utilityBalance || 0) < 0;

    // Can only checkout if verified
    const canCheckout = rentVerified && utilityVerified;

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

                            {/* Manual Verification Section */}
                            <div className="space-y-4 border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <CheckSquare size={16} /> 退宿前人工核验
                                </h4>
                                <p className="text-xs text-slate-500 mb-2">请管理员核实费用情况，确认无误后勾选放行。未勾选无法办理退宿。</p>
                                
                                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-red-400 transition-colors select-none">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rentVerified ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'}`}>
                                        {rentVerified && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={rentVerified} onChange={(e) => setRentVerified(e.target.checked)} />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-700">确认房租已结清</div>
                                        <div className="text-xs text-slate-400">系统显示状态: {hasUnpaidRent ? '欠费' : '正常'}</div>
                                    </div>
                                    {hasUnpaidRent && <AlertTriangle size={16} className="text-red-500" />}
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-red-400 transition-colors select-none">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${utilityVerified ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'}`}>
                                        {utilityVerified && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={utilityVerified} onChange={(e) => setUtilityVerified(e.target.checked)} />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-700">确认水电已结算</div>
                                        <div className="text-xs text-slate-400">请核实智能电表余额是否结清</div>
                                    </div>
                                    {hasUtilityDebt && <AlertTriangle size={16} className="text-red-500" />}
                                </label>
                            </div>

                            {/* Pending Tickets Info (Informational Only) */}
                            {pendingTickets.length > 0 && (
                                <div className="flex items-start gap-2 text-orange-600 text-xs bg-orange-50 p-3 rounded">
                                    <Wrench size={16} className="shrink-0 mt-0.5" />
                                    <p>提示：该房间仍有 {pendingTickets.length} 个未完成的报修工单，请注意。</p>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50">
                                    取消
                                </button>
                                <button 
                                    onClick={handleExecuteCheckout}
                                    disabled={!canCheckout}
                                    className={`flex-1 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all flex items-center justify-center gap-2 ${canCheckout ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-300 cursor-not-allowed'}`}
                                >
                                    <UserX size={18} /> 确认退宿
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
