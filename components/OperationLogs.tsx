import React from 'react';
import { OperationLog } from '../types';

interface OperationLogsProps {
    logs: OperationLog[];
}

const OperationLogs: React.FC<OperationLogsProps> = ({ logs }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">系统操作日志</h3>
                    <p className="text-sm text-slate-500">查看床位分配、人员导入及退宿的操作记录</p>
               </div>
               <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">时间</th>
                                <th className="px-6 py-4">操作人</th>
                                <th className="px-6 py-4">动作类型</th>
                                <th className="px-6 py-4">详情</th>
                                <th className="px-6 py-4 text-right">状态</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">{log.operator}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{log.action}</td>
                                    <td className="px-6 py-4 text-slate-600 max-w-md truncate" title={log.details}>{log.details}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            log.status === 'SUCCESS' ? 'bg-green-50 text-green-600' :
                                            log.status === 'WARNING' ? 'bg-yellow-50 text-yellow-600' :
                                            'bg-red-50 text-red-600'
                                        }`}>
                                            {log.status === 'SUCCESS' ? '成功' : log.status === 'WARNING' ? '警告' : '失败'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
               </div>
          </div>
    );
};

export default OperationLogs;