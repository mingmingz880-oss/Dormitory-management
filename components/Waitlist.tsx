import React from 'react';
import { WaitlistEntry } from '../types';
import { Users, ClipboardList } from 'lucide-react';

interface WaitlistProps {
    waitlist: WaitlistEntry[];
}

const Waitlist: React.FC<WaitlistProps> = ({ waitlist }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">入住排队序列</h3>
                    <p className="text-sm text-slate-500">因床位不足无法即时安排的员工列表</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                      等待中: {waitlist.length} 人
                  </span>
              </div>
              {waitlist.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                      <Users size={48} className="mx-auto mb-4 opacity-20" />
                      <p>当前无排队人员</p>
                  </div>
              ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">排队ID</th>
                                <th className="px-6 py-4">姓名</th>
                                <th className="px-6 py-4">性别</th>
                                <th className="px-6 py-4">所属企业</th>
                                <th className="px-6 py-4">手机号</th>
                                <th className="px-6 py-4">排队时间</th>
                                <th className="px-6 py-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {waitlist.map(person => (
                                <tr key={person.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{person.id.split('-')[2]}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{person.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-xs ${person.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                            {person.gender === 'MALE' ? '男' : '女'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{person.company}</td>
                                    <td className="px-6 py-4 text-slate-600">{person.phone}</td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(person.queueDate).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">分配床位</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              )}
          </div>
    );
};

export default Waitlist;