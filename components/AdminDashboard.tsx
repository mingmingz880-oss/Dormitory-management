import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users, AlertTriangle, Activity, DoorOpen, ShieldAlert, ClipboardList } from 'lucide-react';
import { MOCK_ALERTS, MOCK_ROOMS } from '../constants';

interface AdminDashboardProps {
    waitlistCount: number;
    onNavigate: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ waitlistCount, onNavigate }) => {
  // Calculated stats (Normally would come from props if fully dynamic, but using mock here for layout demo)
  const totalBeds = MOCK_ROOMS.reduce((acc, r) => acc + r.beds.length, 0);
  const occupiedBeds = MOCK_ROOMS.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'OCCUPIED').length, 0);
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const trafficData = [
    { name: '06:00', in: 10, out: 50 },
    { name: '07:00', in: 20, out: 120 },
    { name: '08:00', in: 15, out: 80 },
    { name: '12:00', in: 60, out: 40 },
    { name: '18:00', in: 110, out: 30 },
    { name: '20:00', in: 80, out: 20 },
    { name: '22:00', in: 40, out: 5 },
  ];

  const occupancyData = [
    { name: '已入住', value: occupiedBeds },
    { name: '空闲', value: totalBeds - occupiedBeds },
  ];
  const COLORS = ['#3b82f6', '#e2e8f0'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">总体入住率</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{occupancyRate}%</h3>
              <p className="text-xs text-green-600 mt-1">↑ 2% 较上周</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Waitlist Card */}
        <div 
            onClick={() => onNavigate('dorms-waitlist')}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">排队等待人数</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{waitlistCount}</h3>
              <p className="text-xs text-slate-400 mt-1">点击查看详情</p>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
              <ClipboardList size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">待处理告警</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{MOCK_ALERTS.length}</h3>
              <p className="text-xs text-red-600 mt-1">需立即处理</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">平均房间日能耗</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">12.5 kWh</h3>
              <p className="text-xs text-slate-400 mt-1">每日 / 每间</p>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">今日通行人次</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">1,245</h3>
              <p className="text-xs text-slate-400 mt-1">总进出记录</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <DoorOpen size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">今日通行流量趋势</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="in" name="进入" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="外出" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">房源入住情况</h3>
          <div className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-[-100px] mb-[60px]">
               <span className="text-3xl font-bold text-slate-900">{occupancyRate}%</span>
               <p className="text-xs text-slate-500">已入住</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alerts List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">安防与安全告警</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">查看全部</button>
        </div>
        <div className="divide-y divide-slate-100">
          {MOCK_ALERTS.map(alert => (
            <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
              <div className={`mt-1 p-2 rounded-full ${
                alert.severity === 'HIGH' ? 'bg-red-100 text-red-600' :
                alert.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-600' :
                'bg-yellow-100 text-yellow-600'
              }`}>
                {alert.type === 'SECURITY' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {alert.severity} 级风险: {alert.type === 'SECURITY' ? '安防' : (alert.type === 'SAFETY' ? '安全' : '系统')}告警
                  </h4>
                  <span className="text-xs text-slate-500">
                    {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50">查看监控</button>
                  <button className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">派遣保安</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;