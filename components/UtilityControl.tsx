import React, { useState } from 'react';
import { MOCK_ROOMS, MOCK_TENANTS } from '../constants';
import { Zap, Droplets, Download, ChevronLeft, ChevronRight, Settings, Search } from 'lucide-react';

const UtilityControl: React.FC = () => {
    const [rooms] = useState(MOCK_ROOMS);

    // Mock Pagination
    const currentPage = 1;
    const totalItems = rooms.length;
    const itemsPerPage = 20;

    return (
        <div className="space-y-6">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">总用电量</p>
                            <h3 className="text-3xl font-bold mt-1">452.8 kWh</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Zap size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs bg-white/10 inline-block px-2 py-1 rounded">今日</div>
                </div>

                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-cyan-100 text-sm font-medium">总用水量</p>
                            <h3 className="text-3xl font-bold mt-1">128.5 m³</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Droplets size={24} />
                        </div>
                    </div>
                     <div className="mt-4 text-xs bg-white/10 inline-block px-2 py-1 rounded">今日</div>
                </div>

                 <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <p className="text-slate-500 text-sm font-medium">自动断电次数 (今日)</p>
                    <h3 className="text-3xl font-bold text-red-600 mt-2">3</h3>
                    <p className="text-xs text-slate-400 mt-1">因余额不足触发</p>
                </div>
            </div>

            {/* Main Content Area - Replaced List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
                
                {/* Filter Bar */}
                <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <select className="appearance-none bg-white border border-slate-300 text-slate-700 py-2 pl-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option>账户状态</option>
                            <option>正常</option>
                            <option>欠费</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>

                    <div className="relative w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="账户名称" 
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="relative w-64">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="代表人手机号" 
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="ml-auto">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm hover:bg-slate-50 transition-colors">
                            <Download size={16} />
                            导出
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">户号</th>
                                <th className="px-6 py-4 whitespace-nowrap">账户名称</th>
                                <th className="px-6 py-4 whitespace-nowrap">代表人</th>
                                <th className="px-6 py-4 whitespace-nowrap">代表人手机号</th>
                                <th className="px-6 py-4 whitespace-nowrap">状态</th>
                                <th className="px-6 py-4 whitespace-nowrap">累计欠费</th>
                                <th className="px-6 py-4 whitespace-nowrap">逾期账单数</th>
                                <th className="px-6 py-4 whitespace-nowrap">本月用电 (度)</th>
                                <th className="px-6 py-4 whitespace-nowrap">本月用水 (吨)</th>
                                <th className="px-6 py-4 whitespace-nowrap">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rooms.map((room, index) => {
                                // Mock Data Generation to match screenshot structure
                                const accountId = `00000${index + 1}`.slice(-6);
                                const accountName = `${room.building}${room.floor}楼${room.number}宿舍`;
                                // Find a representative tenant
                                const repTenant = MOCK_TENANTS.find(t => t.roomId === room.id);
                                const repName = repTenant ? repTenant.name : '-';
                                const repPhone = repTenant ? repTenant.phone : '-';
                                
                                const isNormal = room.utilityBalance >= 0;
                                const arrears = isNormal ? '0.00' : Math.abs(room.utilityBalance).toFixed(2);
                                const overdueBills = isNormal ? 0 : 1;

                                return (
                                    <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-900">{accountId}</td>
                                        <td className="px-6 py-4 text-slate-900">{accountName}</td>
                                        <td className="px-6 py-4 text-slate-900">{repName}</td>
                                        <td className="px-6 py-4 text-slate-900 font-mono">{repPhone}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${isNormal ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className={isNormal ? 'text-slate-700' : 'text-red-600'}>
                                                    {isNormal ? '正常' : '欠费'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900">{arrears}</td>
                                        <td className="px-6 py-4 text-slate-900">{overdueBills}</td>
                                        <td className="px-6 py-4 text-slate-500">-</td>
                                        <td className="px-6 py-4 text-slate-500">-</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 text-blue-600">
                                                <button className="hover:text-blue-800">历史账单</button>
                                                <button className="hover:text-blue-800">缴费记录</button>
                                                <button className="hover:text-blue-800">编辑</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-4 text-sm text-slate-500 bg-white rounded-b-xl relative">
                    {/* Settings Icon from screenshot often floats near bottom left or is decorative, putting simple pagination here */}
                     <div className="absolute left-6 bottom-4 p-2 bg-slate-100 rounded text-slate-400">
                         <Settings size={20} className="animate-spin-slow" />
                     </div>

                    <div className="flex items-center gap-2">
                        <span>合计 {totalItems}</span>
                        <div className="flex items-center border border-slate-300 rounded px-2 py-1 bg-slate-50">
                            <span>{itemsPerPage}条/页</span>
                            <ChevronLeft size={14} className="ml-2 rotate-[-90deg]" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                         <button className="p-1 rounded hover:bg-slate-100 text-slate-300" disabled>
                            <ChevronLeft size={16} />
                         </button>
                         <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded">1</button>
                         <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                            <ChevronRight size={16} />
                         </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span>跳至</span>
                        <input type="text" defaultValue="1" className="w-8 py-1 border border-slate-300 rounded text-center" />
                        <span>页</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UtilityControl;