
import React, { useState } from 'react';
import { MOCK_SECURITY_EVENTS } from '../constants';
import { SecurityEvent, SecurityEventType } from '../types';
import { ShieldAlert, Settings, AlertTriangle, Eye, CheckCircle, Clock, Zap, MapPin, UserX, Camera, Moon } from 'lucide-react';

const SecurityAlerts: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'RECORDS' | 'CONFIG'>('RECORDS');
    const [events, setEvents] = useState<SecurityEvent[]>(MOCK_SECURITY_EVENTS);
    const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

    // Configuration States
    const [strangerConfig, setStrangerConfig] = useState({
        days: 3,
        startTime: '22:00',
        endTime: '06:00'
    });
    const [absenceConfig, setAbsenceConfig] = useState({
        hours: 72,
        checkPower: true
    });
    const [notReturnedConfig, setNotReturnedConfig] = useState({
        curfewTime: '23:00',
        triggerTime: '23:30',
        excludeLeave: true
    });

    const handleProcessEvent = (id: string, note: string) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'PROCESSED', processNote: note } : e));
        setSelectedEvent(null);
    };

    const renderDetailModal = () => {
        if (!selectedEvent) return null;

        return (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            {selectedEvent.type === SecurityEventType.STRANGER ? (
                                <><ShieldAlert className="text-red-500" /> 疑似非法留宿预警</>
                            ) : (
                                <><AlertTriangle className="text-orange-500" /> 异常失联预警 (生命安全)</>
                            )}
                        </h3>
                        <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">×</button>
                    </div>

                    <div className="p-6">
                        {/* Common Info */}
                        <div className="flex gap-6 mb-6">
                            <div className="w-1/2 space-y-3">
                                <div className="text-sm text-slate-500">关联房间</div>
                                <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    <MapPin size={18} className="text-blue-500" />
                                    {selectedEvent.roomId}
                                </div>
                            </div>
                            <div className="w-1/2 space-y-3">
                                <div className="text-sm text-slate-500">预警时间</div>
                                <div className="font-medium text-slate-900">
                                    {new Date(selectedEvent.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Scenario Specifics */}
                        {selectedEvent.type === SecurityEventType.STRANGER && (
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                                    <h4 className="font-bold text-red-800 mb-2 text-sm">触发规则: 连续3天深夜出现未注册人脸</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-slate-500">陌生人ID:</span> <span className="font-mono font-bold">{selectedEvent.strangerId}</span></div>
                                        <div><span className="text-slate-500">出现频次:</span> <span className="font-bold">{selectedEvent.appearCount} 次</span></div>
                                        <div><span className="text-slate-500">首次抓拍:</span> {selectedEvent.firstSeen ? new Date(selectedEvent.firstSeen).toLocaleString() : '-'}</div>
                                        <div><span className="text-slate-500">最近抓拍:</span> {selectedEvent.lastSeen ? new Date(selectedEvent.lastSeen).toLocaleString() : '-'}</div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-2 text-sm flex items-center gap-2"><Camera size={16}/> 抓拍证据</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="aspect-square bg-slate-200 rounded-lg overflow-hidden relative group">
                                                <img src={`https://picsum.photos/200/200?random=${i}`} alt="Capture" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">* 仅展示最近3次关键抓拍</p>
                                </div>
                            </div>
                        )}

                        {selectedEvent.type === SecurityEventType.ABSENCE && (
                            <div className="space-y-4">
                                <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                                    <h4 className="font-bold text-orange-800 mb-2 text-sm">触发规则: 连续72小时无通行记录</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-slate-500">租户姓名:</span> <span className="font-bold">{selectedEvent.tenantName}</span></div>
                                        <div><span className="text-slate-500">租户ID:</span> <span className="font-mono">{selectedEvent.tenantId}</span></div>
                                        <div className="col-span-2"><span className="text-slate-500">未归时长:</span> <span className="font-bold text-red-600 text-lg">{selectedEvent.absenceDuration}</span></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                                    <div className={`p-3 rounded-full ${selectedEvent.powerUsageStatus === 'NO_USAGE' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        <Zap size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-slate-800">智能电表辅助研判</h5>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {selectedEvent.powerUsageStatus === 'NO_USAGE' 
                                                ? '近3天该房间电量无明显波动 (判定无人)' 
                                                : '近3天有正常用电记录 (可能人在房间未出)'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Process Actions */}
                        {selectedEvent.status === 'PENDING' ? (
                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button 
                                    onClick={() => setSelectedEvent(null)}
                                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                                >
                                    暂不处理
                                </button>
                                <button 
                                    onClick={() => handleProcessEvent(selectedEvent.id, '已上门核实，情况属实')}
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md"
                                >
                                    标记为已处理
                                </button>
                            </div>
                        ) : (
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <div className="bg-green-50 p-3 rounded text-green-800 text-sm font-medium flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    该工单已处理。处理说明: {selectedEvent.processNote}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
                    <button
                        onClick={() => setActiveTab('RECORDS')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                            activeTab === 'RECORDS' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <ShieldAlert size={16} /> 预警记录
                    </button>
                    <button
                        onClick={() => setActiveTab('CONFIG')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                            activeTab === 'CONFIG' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Settings size={16} /> 规则配置
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'RECORDS' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">预警ID</th>
                                <th className="px-6 py-4">房间号</th>
                                <th className="px-6 py-4">事件类型</th>
                                <th className="px-6 py-4">发送时间</th>
                                <th className="px-6 py-4">状态</th>
                                <th className="px-6 py-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {events.map(event => (
                                <tr key={event.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500">{event.id}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{event.roomId}</td>
                                    <td className="px-6 py-4">
                                        {event.type === SecurityEventType.STRANGER ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                <UserX size={12} /> 疑似转租/非法留宿
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                                <Clock size={12} /> 长期不动/失联
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            event.status === 'PENDING' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {event.status === 'PENDING' ? '待处理' : '已处理'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedEvent(event)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end gap-1 ml-auto"
                                        >
                                            <Eye size={14} /> 查看详情
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'CONFIG' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Stranger Config */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                <UserX size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">疑似转租/留宿预警</h3>
                                <p className="text-xs text-slate-500">检测未注册人脸的频繁出入</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">连续出现天数阈值</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={strangerConfig.days}
                                        onChange={(e) => setStrangerConfig({...strangerConfig, days: parseInt(e.target.value)})}
                                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    />
                                    <span className="text-sm text-slate-500">天</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">夜间监测时段</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="time" 
                                        value={strangerConfig.startTime}
                                        onChange={(e) => setStrangerConfig({...strangerConfig, startTime: e.target.value})}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input 
                                        type="time" 
                                        value={strangerConfig.endTime}
                                        onChange={(e) => setStrangerConfig({...strangerConfig, endTime: e.target.value})}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 w-full">保存配置</button>
                            </div>
                        </div>
                    </div>

                    {/* Absence Config */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">长期不动/失联预警</h3>
                                <p className="text-xs text-slate-500">检测租户长时间无通行记录</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">无通行记录时长阈值</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={absenceConfig.hours}
                                        onChange={(e) => setAbsenceConfig({...absenceConfig, hours: parseInt(e.target.value)})}
                                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    />
                                    <span className="text-sm text-slate-500">小时 ({(absenceConfig.hours / 24).toFixed(1)}天)</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <Zap size={18} className="text-yellow-500" />
                                    <span className="text-sm font-medium text-slate-700">联动智能电表判断</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={absenceConfig.checkPower}
                                    onChange={(e) => setAbsenceConfig({...absenceConfig, checkPower: e.target.checked})}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                            </div>
                            <p className="text-xs text-slate-400">开启后，若无通行记录但有明显用电，将不触发预警 (判定为宅家)</p>

                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 w-full">保存配置</button>
                            </div>
                        </div>
                    </div>

                    {/* Not Returned Config */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Moon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">未归寝预警</h3>
                                <p className="text-xs text-slate-500">识别晚归或彻夜未归人员</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">门禁考勤截止时间 (晚归)</label>
                                <input 
                                    type="time" 
                                    value={notReturnedConfig.curfewTime}
                                    onChange={(e) => setNotReturnedConfig({...notReturnedConfig, curfewTime: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">预警生成/推送时间</label>
                                <input 
                                    type="time" 
                                    value={notReturnedConfig.triggerTime}
                                    onChange={(e) => setNotReturnedConfig({...notReturnedConfig, triggerTime: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700">排除请假人员</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={notReturnedConfig.excludeLeave}
                                    onChange={(e) => setNotReturnedConfig({...notReturnedConfig, excludeLeave: e.target.checked})}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 w-full">保存配置</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {renderDetailModal()}
        </div>
    );
};

export default SecurityAlerts;
