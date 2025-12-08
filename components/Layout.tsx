
import React, { useState } from 'react';
import { LayoutDashboard, Users, Zap, ShieldAlert, Key, Settings, LogOut, Bell, History, Building2, ClipboardList, ChevronDown, ChevronRight, FileBarChart, ClipboardCheck } from 'lucide-react';

interface MenuItem {
  id: string;
  icon: any;
  label: string;
  children?: { id: string; icon: any; label: string }[];
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dorms']);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: '总览看板' },
    { 
      id: 'dorms', 
      icon: Users, 
      label: '宿舍管理',
      children: [
        { id: 'dorms-rooms', icon: Building2, label: '房源视图' },
        { id: 'dorms-waitlist', icon: ClipboardList, label: '排队序列' }
      ]
    },
    { id: 'utilities', icon: Zap, label: '智能水电' },
    { id: 'security', icon: ShieldAlert, label: '安防预警' },
    { id: 'approvals', icon: ClipboardCheck, label: '审批处理' },
    { id: 'reports', icon: FileBarChart, label: '报表查询' },
    { id: 'logs', icon: History, label: '操作日志' },
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const isChildActive = (item: MenuItem) => {
    return item.children?.some(child => child.id === activeTab);
  };

  const currentTitle = () => {
      for (const item of menuItems) {
          if (item.id === activeTab) return item.label;
          if (item.children) {
              const child = item.children.find(c => c.id === activeTab);
              if (child) return `${item.label} - ${child.label}`;
          }
      }
      return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">SD</div>
            <span className="text-xl font-bold tracking-tight">智宿平台</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">企业版 v2.1</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.children ? (
                // Parent Menu Item
                <div>
                   <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      isChildActive(item) ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {expandedMenus.includes(item.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {/* Sub Menu Items */}
                  {expandedMenus.includes(item.id) && (
                    <div className="ml-4 pl-4 border-l border-slate-700 space-y-1 mt-1">
                      {item.children.map(child => (
                         <button
                           key={child.id}
                           onClick={() => setActiveTab(child.id)}
                           className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                             activeTab === child.id 
                               ? 'bg-blue-600 text-white shadow-md' 
                               : 'text-slate-400 hover:text-white hover:bg-slate-800'
                           }`}
                         >
                           <child.icon size={16} />
                           <span>{child.label}</span>
                         </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Simple Menu Item
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white w-full">
            <Settings size={20} />
            <span>设置</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 w-full">
            <LogOut size={20} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
             {currentTitle()}
          </h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-slate-900">管理员</div>
                <div className="text-xs text-slate-500">宿舍运营经理</div>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
