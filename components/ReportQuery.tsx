
import React, { useState, useMemo } from 'react';
import { MOCK_CHECKIN_RECORDS, MOCK_CHECKOUT_RECORDS, MOCK_ACCESS_RECORDS, MOCK_DORM_RETURN_RECORDS } from '../constants';
import { Download, Search, Calendar, X, Moon, Clock } from 'lucide-react';

const ReportQuery: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'CHECKIN' | 'CHECKOUT' | 'ACCESS' | 'DORM_RETURN'>('CHECKIN');
    const [searchName, setSearchName] = useState('');
    const [searchDate, setSearchDate] = useState('');

    const handleTabChange = (tab: 'CHECKIN' | 'CHECKOUT' | 'ACCESS' | 'DORM_RETURN') => {
        setActiveTab(tab);
        setSearchName('');
        setSearchDate('');
    };

    // Filter Logic
    const filteredData = useMemo(() => {
        if (activeTab === 'CHECKIN') {
            return MOCK_CHECKIN_RECORDS.filter(r => {
                const matchName = r.tenantName.includes(searchName) || r.phone.includes(searchName);
                const matchDate = searchDate ? r.checkInDate.startsWith(searchDate) : true;
                return matchName && matchDate;
            });
        } else if (activeTab === 'CHECKOUT') {
            return MOCK_CHECKOUT_RECORDS.filter(r => {
                const matchName = r.tenantName.includes(searchName) || r.phone.includes(searchName);
                const matchDate = searchDate ? r.checkOutDate.startsWith(searchDate) : true;
                return matchName && matchDate;
            });
        } else if (activeTab === 'ACCESS') {
            return MOCK_ACCESS_RECORDS.filter(r => {
                const matchName = r.personName.includes(searchName);
                const matchDate = searchDate ? r.timestamp.startsWith(searchDate) : true;
                return matchName && matchDate;
            });
        } else {
             return MOCK_DORM_RETURN_RECORDS.filter(r => {
                const matchName = r.tenantName.includes(searchName);
                const matchDate = searchDate ? r.date.startsWith(searchDate) : true;
                return matchName && matchDate;
            });
        }
    }, [activeTab, searchName, searchDate]);

    // Generic Export Function based on Filtered Data
    const handleExport = () => {
        let headers: string[] = [];
        let rows: string[][] = [];
        let filename = '';

        if (activeTab === 'CHECKIN') {
            headers = ['记录ID', '姓名', '手机号', '公司', '房间号', '床位号', '入住时间', '操作人'];
            rows = (filteredData as typeof MOCK_CHECKIN_RECORDS).map(r => [
                r.id, r.tenantName, r.phone, r.company, r.roomNumber, r.bedNumber, new Date(r.checkInDate).toLocaleString(), r.operator
            ]);
            filename = `入住记录报表_${new Date().toISOString().split('T')[0]}.csv`;
        } else if (activeTab === 'CHECKOUT') {
            headers = ['记录ID', '姓名', '手机号', '公司', '原房间', '退宿时间', '原因', '操作人'];
            rows = (filteredData as typeof MOCK_CHECKOUT_RECORDS).map(r => [
                r.id, r.tenantName, r.phone, r.company, r.roomNumber, new Date(r.checkOutDate).toLocaleString(), r.reason, r.operator
            ]);
            filename = `退宿记录报表_${new Date().toISOString().split('T')[0]}.csv`;
        } else if (activeTab === 'ACCESS') {
             headers = ['记录ID', '姓名', '人员类型', '位置', '方向', '通行方式', '结果', '时间'];
             rows = (filteredData as typeof MOCK_ACCESS_RECORDS).map(r => [
                r.id, r.personName, r.personType, r.location, r.direction, r.method, r.result, new Date(r.timestamp).toLocaleString()
             ]);
             filename = `通行记录报表_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
             headers = ['记录ID', '姓名', '房间号', '日期', '最晚归寝时间', '配置考勤时间', '状态'];
             rows = (filteredData as typeof MOCK_DORM_RETURN_RECORDS).map(r => [
                r.id, r.tenantName, r.roomNumber, r.date, r.returnTime || '未归', r.curfewTime, r.status === 'NORMAL' ? '正常' : r.status === 'LATE' ? '晚归' : '未归'
             ]);
             filename = `归寝记录报表_${new Date().toISOString().split('T')[0]}.csv`;
        }

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
                    {(['CHECKIN', 'CHECKOUT', 'ACCESS', 'DORM_RETURN'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === tab 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {tab === 'CHECKIN' ? '入住记录' : tab === 'CHECKOUT' ? '退宿记录' : tab === 'ACCESS' ? '通行记录' : '归寝记录'}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
                >
                    <Download size={16} />
                    导出Excel
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Search size={18} className="text-slate-400" />
                    查询条件:
                </div>
                
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder={activeTab === 'ACCESS' ? "搜索人员姓名..." : "搜索姓名/手机号..."}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64"
                    />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    {searchName && (
                        <button 
                            onClick={() => setSearchName('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="relative">
                    <input 
                        type="date" 
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {(searchName || searchDate) && (
                    <button 
                        onClick={() => { setSearchName(''); setSearchDate(''); }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2"
                    >
                        重置筛选
                    </button>
                )}
                
                <div className="ml-auto text-xs text-slate-500">
                    共找到 {filteredData.length} 条记录
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            {activeTab === 'CHECKIN' && (
                                <tr>
                                    <th className="px-6 py-4">姓名</th>
                                    <th className="px-6 py-4">手机号</th>
                                    <th className="px-6 py-4">所属公司</th>
                                    <th className="px-6 py-4">分配床位</th>
                                    <th className="px-6 py-4">入住时间</th>
                                    <th className="px-6 py-4">操作人</th>
                                </tr>
                            )}
                            {activeTab === 'CHECKOUT' && (
                                <tr>
                                    <th className="px-6 py-4">姓名</th>
                                    <th className="px-6 py-4">手机号</th>
                                    <th className="px-6 py-4">所属公司</th>
                                    <th className="px-6 py-4">原房间</th>
                                    <th className="px-6 py-4">退宿时间</th>
                                    <th className="px-6 py-4">退宿原因</th>
                                </tr>
                            )}
                            {activeTab === 'ACCESS' && (
                                <tr>
                                    <th className="px-6 py-4">时间</th>
                                    <th className="px-6 py-4">人员姓名</th>
                                    <th className="px-6 py-4">类型</th>
                                    <th className="px-6 py-4">位置</th>
                                    <th className="px-6 py-4">方式</th>
                                    <th className="px-6 py-4">结果</th>
                                </tr>
                            )}
                             {activeTab === 'DORM_RETURN' && (
                                <tr>
                                    <th className="px-6 py-4">日期</th>
                                    <th className="px-6 py-4">姓名</th>
                                    <th className="px-6 py-4">房间号</th>
                                    <th className="px-6 py-4">最晚归寝时间</th>
                                    <th className="px-6 py-4">配置考勤时间</th>
                                    <th className="px-6 py-4">状态</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        未找到匹配的记录
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((r: any) => (
                                    <tr key={r.id} className="hover:bg-slate-50">
                                        {activeTab === 'CHECKIN' && (
                                            <>
                                                <td className="px-6 py-4 font-medium text-slate-900">{r.tenantName}</td>
                                                <td className="px-6 py-4 text-slate-500">{r.phone}</td>
                                                <td className="px-6 py-4 text-slate-500">{r.company}</td>
                                                <td className="px-6 py-4 text-slate-900">{r.roomNumber} - {r.bedNumber}</td>
                                                <td className="px-6 py-4 text-slate-500">{new Date(r.checkInDate).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-slate-500">{r.operator}</td>
                                            </>
                                        )}
                                        {activeTab === 'CHECKOUT' && (
                                            <>
                                                <td className="px-6 py-4 font-medium text-slate-900">{r.tenantName}</td>
                                                <td className="px-6 py-4 text-slate-500">{r.phone}</td>
                                                <td className="px-6 py-4 text-slate-500">{r.company}</td>
                                                <td className="px-6 py-4 text-slate-500">{r.roomNumber}</td>
                                                <td className="px-6 py-4 text-slate-500">{new Date(r.checkOutDate).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${r.reason === '离职' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {r.reason}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'ACCESS' && (
                                            <>
                                                <td className="px-6 py-4 text-slate-500 text-xs font-mono">{new Date(r.timestamp).toLocaleString()}</td>
                                                <td className="px-6 py-4 font-medium text-slate-900">{r.personName}</td>
                                                <td className="px-6 py-4 text-slate-500">{r.personType}</td>
                                                <td className="px-6 py-4 text-slate-900">{r.location} <span className="text-xs text-slate-400">({r.direction})</span></td>
                                                <td className="px-6 py-4 text-slate-500">{r.method}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${r.result === '放行' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                        {r.result}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'DORM_RETURN' && (
                                            <>
                                                <td className="px-6 py-4 text-slate-500">{r.date}</td>
                                                <td className="px-6 py-4 font-medium text-slate-900">{r.tenantName}</td>
                                                <td className="px-6 py-4 text-slate-500">{r.roomNumber}</td>
                                                <td className="px-6 py-4 text-slate-900">{r.returnTime || <span className="text-red-500">未归</span>}</td>
                                                <td className="px-6 py-4 text-slate-500">{r.curfewTime}</td>
                                                <td className="px-6 py-4">
                                                    {r.status === 'NORMAL' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                            正常
                                                        </span>
                                                    )}
                                                    {r.status === 'LATE' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                                                            <Clock size={12} /> 晚归
                                                        </span>
                                                    )}
                                                    {r.status === 'NOT_RETURNED' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                                            <Moon size={12} /> 未归
                                                        </span>
                                                    )}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportQuery;