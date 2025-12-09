
import React, { useState, useEffect } from 'react';
import { Tenant, Room, BedStatus, RentStatus, MaintenanceTicket } from '../types';
import { CheckCircle, AlertTriangle, ArrowRight, Bed, Loader2, X, ArrowLeftRight, Bell, Square, CheckSquare } from 'lucide-react';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: Tenant;
    rooms: Room[];
    tickets: MaintenanceTicket[];
    onConfirm: (tenantId: string, newRoomId: string, newBedId: string) => void;
}

type Step = 'CHECK' | 'SELECT' | 'PROCESSING' | 'DONE';

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, tenant, rooms, tickets, onConfirm }) => {
    const [step, setStep] = useState<Step>('CHECK');
    const [selectedTargetBed, setSelectedTargetBed] = useState<{ roomId: string, bedId: string, label: string } | null>(null);
    const [processStatus, setProcessStatus] = useState({
        revoke: 'PENDING',
        grant: 'PENDING',
        notify: 'PENDING'
    });

    // Manual Verification States
    const [rentVerified, setRentVerified] = useState(false);
    const [utilityVerified, setUtilityVerified] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('CHECK');
            setSelectedTargetBed(null);
            setProcessStatus({ revoke: 'PENDING', grant: 'PENDING', notify: 'PENDING' });
            setRentVerified(false);
            setUtilityVerified(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- Validation ---
    const currentRoom = rooms.find(r => r.id === tenant.roomId);
    
    // Proceed logic: Only allow if manual checks are done
    const canProceed = rentVerified && utilityVerified;

    // --- Available Beds (Same Gender) ---
    const availableRooms = rooms
        .filter(r => r.gender === (currentRoom?.gender || 'MALE') && r.id !== currentRoom?.id) // Same gender, different room
        .filter(r => r.beds.some(b => b.status === BedStatus.EMPTY));

    const handleExecuteTransfer = () => {
        if (!selectedTargetBed) return;
        setStep('PROCESSING');

        // Simulate IoT Delays
        setTimeout(() => setProcessStatus(p => ({ ...p, revoke: 'LOADING' })), 500);
        setTimeout(() => setProcessStatus(p => ({ ...p, revoke: 'DONE' })), 1500);

        setTimeout(() => setProcessStatus(p => ({ ...p, grant: 'LOADING' })), 1500);
        setTimeout(() => setProcessStatus(p => ({ ...p, grant: 'DONE' })), 2500);

        setTimeout(() => setProcessStatus(p => ({ ...p, notify: 'LOADING' })), 2500);
        setTimeout(() => {
            setProcessStatus(p => ({ ...p, notify: 'DONE' }));
            setStep('DONE');
        }, 3500);
    };

    const handleFinalConfirm = () => {
        if (selectedTargetBed) {
            onConfirm(tenant.id, selectedTargetBed.roomId, selectedTargetBed.bedId);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <ArrowLeftRight className="text-blue-600" size={20} /> 调换宿舍
                    </h3>
                    {step !== 'PROCESSING' && (
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    
                    {/* STEP 1: CHECK */}
                    {step === 'CHECK' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">👤</div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{tenant.name}</h4>
                                    <p className="text-xs text-slate-500">当前: {currentRoom?.building} {currentRoom?.number}室</p>
                                </div>
                                <div className="ml-auto">
                                    <ArrowRight className="text-slate-300" />
                                </div>
                                <div className="text-right text-sm text-slate-500 font-medium">
                                    计划调入新房间...
                                </div>
                            </div>

                            <div className="space-y-4 border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <CheckSquare size={16} /> 费用人工核验
                                </h4>
                                <p className="text-xs text-slate-500 mb-2">请管理员线下核实相关费用情况，确认无误后勾选放行。</p>
                                
                                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors select-none">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rentVerified ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                        {rentVerified && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={rentVerified} onChange={(e) => setRentVerified(e.target.checked)} />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-700">确认房租无欠费</div>
                                        <div className="text-xs text-slate-400">系统显示状态: {tenant.rentStatus === RentStatus.PAID ? '正常' : '欠费'}</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors select-none">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${utilityVerified ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                        {utilityVerified && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={utilityVerified} onChange={(e) => setUtilityVerified(e.target.checked)} />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-700">确认水电已结算</div>
                                        <div className="text-xs text-slate-400">请核实智能电表余额是否结清</div>
                                    </div>
                                </label>
                            </div>

                            <button 
                                onClick={() => setStep('SELECT')}
                                disabled={!canProceed}
                                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                                    canProceed 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                下一步：选择新床位 <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: SELECT BED */}
                    {step === 'SELECT' && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-700 mb-2">选择目标床位 ({availableRooms.length} 个房间可用)</h4>
                            
                            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                                {availableRooms.map(room => (
                                    <div key={room.id} className="p-3 hover:bg-slate-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-slate-800">{room.building} {room.number}室</span>
                                            <span className="text-xs text-slate-500">{room.type}</span>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {room.beds.filter(b => b.status === BedStatus.EMPTY).map(bed => (
                                                <button
                                                    key={bed.id}
                                                    onClick={() => setSelectedTargetBed({ 
                                                        roomId: room.id, 
                                                        bedId: bed.id, 
                                                        label: `${room.building} ${room.number}室 ${bed.number}号床` 
                                                    })}
                                                    className={`px-3 py-1.5 rounded text-xs border transition-all flex items-center gap-1 ${
                                                        selectedTargetBed?.bedId === bed.id 
                                                        ? 'bg-blue-600 text-white border-blue-600' 
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <Bed size={14} /> {bed.number}号床
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {availableRooms.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 text-sm">暂无符合条件的空闲床位</div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <span className="text-sm font-medium text-slate-700">
                                    已选: <span className="text-blue-600 font-bold">{selectedTargetBed ? selectedTargetBed.label : '未选择'}</span>
                                </span>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep('CHECK')} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm">上一步</button>
                                    <button 
                                        onClick={handleExecuteTransfer}
                                        disabled={!selectedTargetBed}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${selectedTargetBed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'}`}
                                    >
                                        确认调宿
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PROCESSING */}
                    {step === 'PROCESSING' && (
                        <div className="space-y-6 py-4">
                            <h4 className="text-center font-bold text-slate-800 text-lg mb-6">正在执行调宿操作...</h4>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <X size={20} className="text-red-500" />
                                        <span className="text-sm font-medium text-slate-700">注销原房间权限</span>
                                    </div>
                                    {processStatus.revoke === 'LOADING' && <Loader2 size={18} className="animate-spin text-blue-600" />}
                                    {processStatus.revoke === 'DONE' && <CheckCircle size={18} className="text-green-500" />}
                                    {processStatus.revoke === 'PENDING' && <span className="text-xs text-slate-400">等待中</span>}
                                </div>
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle size={20} className="text-blue-500" />
                                        <span className="text-sm font-medium text-slate-700">下发新房间权限 (人脸/密码)</span>
                                    </div>
                                    {processStatus.grant === 'LOADING' && <Loader2 size={18} className="animate-spin text-blue-600" />}
                                    {processStatus.grant === 'DONE' && <CheckCircle size={18} className="text-green-500" />}
                                    {processStatus.grant === 'PENDING' && <span className="text-xs text-slate-400">等待中</span>}
                                </div>
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <Bell size={20} className="text-orange-500" />
                                        <span className="text-sm font-medium text-slate-700">发送变更通知 (短信/钉钉)</span>
                                    </div>
                                    {processStatus.notify === 'LOADING' && <Loader2 size={18} className="animate-spin text-blue-600" />}
                                    {processStatus.notify === 'DONE' && <CheckCircle size={18} className="text-green-500" />}
                                    {processStatus.notify === 'PENDING' && <span className="text-xs text-slate-400">等待中</span>}
                                </div>
                            </div>
                        </div>
                    )}

                     {/* STEP 4: DONE */}
                     {step === 'DONE' && (
                        <div className="text-center py-6 space-y-4 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">调宿成功！</h3>
                            <p className="text-slate-500 text-sm px-6">
                                租户 <strong>{tenant.name}</strong> 已成功迁移至 <strong>{selectedTargetBed?.label}</strong>。
                                <br/>旧房间权限已失效，新房间密码已通过短信发送。
                            </p>
                            <button 
                                onClick={handleFinalConfirm}
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

export default TransferModal;
