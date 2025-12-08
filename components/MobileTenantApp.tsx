
import React, { useState, useEffect } from 'react';
import { QrCode, Zap, Wrench, User, Home, ScanFace, Lock, CreditCard, Bell, AlertTriangle, Smartphone, Camera, Check, Loader2, ArrowRight, MapPin, History, Wallet, LogOut, FileText, ArrowLeftRight, ChevronLeft, ChevronRight, Settings, Droplets, Calendar } from 'lucide-react';
import { MOCK_TENANTS } from '../constants';
import { TenantStatus } from '../types';

// App Flow States
type AppState = 'LOGIN' | 'CHECKIN' | 'MAIN';
type CheckInStep = 'INFO' | 'FACE' | 'PASSWORD' | 'SYNC' | 'DONE';
type MainView = 'DASHBOARD' | 'PROFILE' | 'CHECKOUT' | 'TRANSFER' | 'REPAIR' | 'UTILITY_DETAIL';

const MobileTenantApp: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('LOGIN');
    const [currentView, setCurrentView] = useState<MainView>('DASHBOARD');
    const [balance, setBalance] = useState(12.50);
    const [showFaceScan, setShowFaceScan] = useState(false);
    
    // Check-in Flow State
    const [checkInStep, setCheckInStep] = useState<CheckInStep>('INFO');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Utility Detail State
    const [utilityType, setUtilityType] = useState<'ELEC' | 'WATER'>('ELEC');
    const [selectedMonth, setSelectedMonth] = useState('2023-10');

    // Mock User Data
    const [currentUser, setCurrentUser] = useState(MOCK_TENANTS[0]);

    // Process States
    const [isProcessing, setIsProcessing] = useState(false);
    const [processSuccess, setProcessSuccess] = useState(false);

    // --- Actions ---

    const handleLogin = (type: 'NEW' | 'OLD' | 'EVICTED') => {
        if (!phoneNumber && type !== 'EVICTED') { // Allow evicted login demo without phone check strictly
            alert("请输入手机号");
            return;
        }
        
        if (type === 'NEW') {
            setCurrentUser({
                ...MOCK_TENANTS[0],
                name: "李明 (新员工)",
                status: 'PENDING' as any, 
                roomNumber: 'A栋-305',
                bedNumber: '2号床'
            } as any);
            setAppState('CHECKIN');
            setCheckInStep('INFO');
        } else if (type === 'EVICTED') {
             setCurrentUser({
                ...MOCK_TENANTS[0],
                name: "王强 (已离职)",
                status: 'EVICTED' as any,
                roomNumber: 'A栋-201',
                bedNumber: '1号床'
            } as any);
            setAppState('MAIN');
        } else {
            setCurrentUser(MOCK_TENANTS[0]);
            setAppState('MAIN');
            setCurrentView('DASHBOARD');
        }
    };

    const handleLogout = () => {
        setAppState('LOGIN');
        setPhoneNumber('');
        setPassword('');
        setCurrentView('DASHBOARD');
    };

    const handleFaceScan = () => {
        setTimeout(() => {
            setCheckInStep('PASSWORD');
        }, 2000);
    };

    const handleSyncPermissions = () => {
        setTimeout(() => {
            setCheckInStep('DONE');
        }, 3000);
    };

    const handleProcessAction = (action: 'CHECKOUT' | 'TRANSFER') => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setProcessSuccess(true);
            
            if (action === 'CHECKOUT') {
                // After checkout, user becomes evicted
                setTimeout(() => {
                    setCurrentUser(prev => ({ ...prev, status: 'EVICTED' as any }));
                    setProcessSuccess(false);
                    setCurrentView('DASHBOARD');
                }, 2000);
            }
        }, 3000);
    };

    // --- Renderers ---

    const renderLogin = () => (
        <div className="flex flex-col h-full bg-white p-8 pt-20">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                <Home className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">智宿管家</h1>
            <p className="text-slate-500 mb-10">蓝领公寓自助服务平台</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">手机号登录</label>
                    <div className="flex items-center border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                        <Smartphone size={20} className="text-slate-400 mr-3" />
                        <input 
                            type="tel" 
                            placeholder="请输入手机号" 
                            className="bg-transparent outline-none w-full text-lg font-medium"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <button 
                        onClick={() => handleLogin('NEW')}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
                    >
                        新员工入住办理
                    </button>
                    <button 
                        onClick={() => handleLogin('OLD')}
                        className="w-full bg-white text-slate-600 border border-slate-200 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        老租户直接登录
                    </button>
                    <button 
                        onClick={() => handleLogin('EVICTED')}
                        className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-medium text-sm hover:bg-slate-200 transition-all active:scale-[0.98]"
                    >
                        模拟已退宿用户登录
                    </button>
                </div>
            </div>
            <p className="mt-auto text-center text-xs text-slate-400">
                未注册手机号将自动关联企业预分配信息
            </p>
        </div>
    );

    const renderCheckInWizard = () => {
        return (
            <div className="flex flex-col h-full bg-slate-50 relative">
                {/* Header */}
                <div className="bg-white p-6 border-b border-slate-200 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900">自助入住办理</h2>
                    <div className="flex gap-2 mt-4">
                        {['INFO', 'FACE', 'PASSWORD', 'DONE'].map((s, i) => {
                            const steps = ['INFO', 'FACE', 'PASSWORD', 'SYNC', 'DONE'];
                            const currentIndex = steps.indexOf(checkInStep);
                            const thisIndex = steps.indexOf(s);
                            return (
                                <div key={s} className={`h-1 flex-1 rounded-full ${thisIndex <= currentIndex ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {checkInStep === 'INFO' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">欢迎入住！</h3>
                                <p className="text-slate-500 mt-2">系统已为您自动分配宿舍</p>
                            </div>
                            
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <span className="text-slate-500">入住人</span>
                                        <span className="font-bold text-slate-900 text-lg">李明</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <span className="text-slate-500">宿舍位置</span>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-900 text-lg">A栋 305室</div>
                                            <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">男生宿舍</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">床位号</span>
                                        <span className="font-bold text-blue-600 text-2xl">2号床</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setCheckInStep('FACE')}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 mt-8 flex items-center justify-center gap-2"
                            >
                                下一步：录入人脸
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {checkInStep === 'FACE' && (
                        <div className="flex flex-col items-center justify-center h-full animate-in slide-in-from-right duration-300">
                             <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-slate-900">人脸信息采集</h3>
                                <p className="text-slate-500 mt-2 text-sm">用于宿舍大门刷脸通行，请确保光线充足</p>
                            </div>

                            <div className="relative w-64 h-64 bg-slate-200 rounded-full overflow-hidden border-4 border-blue-600 shadow-xl mb-8">
                                <img src="https://picsum.photos/400/400?grayscale" className="w-full h-full object-cover opacity-50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Camera size={48} className="text-slate-600" />
                                </div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                            </div>

                            <button 
                                onClick={handleFaceScan}
                                className="w-full max-w-xs bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <ScanFace size={20} /> 开始采集 (活体检测)
                            </button>
                        </div>
                    )}

                    {checkInStep === 'PASSWORD' && (
                        <div className="space-y-6 pt-6 animate-in slide-in-from-right duration-300">
                             <div className="text-center">
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">设置房门密码</h3>
                                <p className="text-slate-500 mt-2 text-sm">请输入6位数字，用于开启 A栋-305室 智能门锁</p>
                            </div>

                            <div className="flex justify-center gap-2 my-8">
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                                        password.length > i ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white'
                                    }`}>
                                        {password[i] || ''}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                    <button 
                                        key={num}
                                        onClick={() => setPassword(p => (p.length < 6 ? p + num : p))}
                                        className="h-14 bg-white rounded-lg shadow-sm border border-slate-200 text-xl font-semibold active:bg-slate-100"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button onClick={() => setPassword('')} className="h-14 flex items-center justify-center text-sm font-medium text-slate-500">清空</button>
                                <button 
                                    onClick={() => setPassword(p => (p.length < 6 ? p + '0' : p))}
                                    className="h-14 bg-white rounded-lg shadow-sm border border-slate-200 text-xl font-semibold active:bg-slate-100"
                                >
                                    0
                                </button>
                                <button onClick={() => setPassword(p => p.slice(0, -1))} className="h-14 flex items-center justify-center text-sm font-medium text-slate-500">删除</button>
                            </div>

                            <button 
                                onClick={() => {
                                    if (password.length === 6) {
                                        setCheckInStep('SYNC');
                                        handleSyncPermissions();
                                    } else {
                                        alert("请输入完整6位密码");
                                    }
                                }}
                                disabled={password.length !== 6}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                                    password.length === 6 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
                                }`}
                            >
                                提交并下发权限
                            </button>
                        </div>
                    )}

                    {checkInStep === 'SYNC' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in duration-500">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className="text-blue-600" size={32} />
                                </div>
                            </div>
                            <div className="space-y-3 w-full max-w-xs">
                                <h3 className="text-xl font-bold text-slate-900">正在下发权限...</h3>
                                
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm animate-pulse">
                                    <Loader2 size={18} className="animate-spin text-blue-600" />
                                    <span className="text-sm text-slate-600">同步人脸至 A栋大门门禁</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm animate-pulse delay-75">
                                    <Loader2 size={18} className="animate-spin text-blue-600" />
                                    <span className="text-sm text-slate-600">同步密码至 305室智能锁</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {checkInStep === 'DONE' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in zoom-in duration-300">
                             <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                                <Check className="text-white" size={48} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">办理成功！</h3>
                                <p className="text-slate-500 mt-2 px-8">您已获得 A栋-305室 的通行权限，现在可以无需钥匙直接拎包入住。</p>
                            </div>
                            <div className="w-full max-w-xs space-y-3">
                                <button 
                                    onClick={() => {
                                        setAppState('MAIN');
                                        setCurrentView('DASHBOARD');
                                    }}
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all"
                                >
                                    进入首页
                                </button>
                                <p className="text-xs text-slate-400">大门支持刷脸，房门支持密码或手机一键开门</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        )
    };

    const renderEvictedApp = () => (
        <div className="flex flex-col h-full bg-slate-50 relative no-scrollbar">
            <div className="bg-slate-800 p-6 pb-12 rounded-b-[2.5rem] text-white relative shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-lg font-bold">个人中心</div>
                    <button onClick={handleLogout}>
                        <LogOut size={20} className="text-slate-400" />
                    </button>
                </div>
                
                <div className="text-center pb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-900/50">
                        <Check size={32} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold">已办理退宿</h2>
                    <p className="text-slate-400 text-sm mt-1">感谢您的居住，祝您前程似锦</p>
                </div>
            </div>

            <div className="mx-6 -mt-8 bg-white rounded-2xl shadow-lg p-5 border border-slate-100 z-10">
                <div className="flex items-center gap-3 mb-4 text-slate-600">
                     <Wallet size={20} className="text-orange-500" />
                     <span className="font-medium text-sm">退款金额结算</span>
                </div>
                <div className="flex items-end justify-between border-b border-slate-100 pb-4 mb-4">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">待退还总额 (押金+水电结余)</p>
                        <h3 className="text-3xl font-bold text-slate-900">¥ 120.50</h3>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">已核销</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                    <span>退款渠道: 微信零钱</span>
                    <span>预计到账: 24小时内</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-20 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                    <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                        <User size={16} /> 个人信息
                    </h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">姓名</span>
                            <span className="text-slate-900 font-medium">{currentUser.name.split(' ')[0]}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">所属企业</span>
                            <span className="text-slate-900 font-medium">{currentUser.company}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">手机号</span>
                            <span className="text-slate-900 font-medium">138****0000</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                    <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                        <History size={16} /> 住宿记录
                    </h4>
                    <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white"></div>
                            <p className="text-xs text-slate-400 mb-1">2023-10-26 10:00</p>
                            <p className="text-sm font-bold text-slate-900">办理退宿</p>
                            <p className="text-xs text-slate-500 mt-1">管理员已确认，权限已收回</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="flex flex-col h-full bg-slate-50 relative no-scrollbar">
            {/* Header */}
            <div className="bg-blue-600 p-6 pb-8 rounded-b-[2.5rem] text-white relative shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3" onClick={() => setCurrentView('PROFILE')}>
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white/30 cursor-pointer">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="cursor-pointer">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                {currentUser.name} <ChevronRight size={14} className="text-blue-200" />
                            </h2>
                            <p className="text-blue-100 text-xs">{(currentUser as any).roomNumber || 'A栋-305室'} • {(currentUser as any).bedNumber || '2号床'}</p>
                        </div>
                    </div>
                    <button className="relative">
                        <Bell size={24} />
                        {(currentUser.rentStatus === 'OVERDUE_WARNING' || currentUser.rentStatus === 'OVERDUE_FROZEN') && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-600"></span>}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 -mt-6">
                
                {/* Rent Alert */}
                {(currentUser.rentStatus === 'OVERDUE_WARNING' || currentUser.rentStatus === 'OVERDUE_FROZEN') && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 shadow-sm">
                        <AlertTriangle className="text-red-500 shrink-0" size={20} />
                        <div>
                            <h4 className="text-sm font-bold text-red-700">房租逾期提醒</h4>
                            <p className="text-xs text-red-600 mt-1">
                                {currentUser.rentStatus === 'OVERDUE_FROZEN'
                                    ? "您的通行权限已被冻结，请立即前往前台缴费。"
                                    : "请在3天内缴纳房租，以免通行受限。"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Utility Balance */}
                <div 
                    onClick={() => setCurrentView('UTILITY_DETAIL')}
                    className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 cursor-pointer active:scale-[0.98] transition-transform"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Zap size={18} className="text-yellow-500" /> 水电余额
                        </h3>
                        <span className="text-xs text-slate-400 flex items-center gap-1">预付费表 <ChevronRight size={12}/></span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-3xl font-bold text-slate-900">¥{balance.toFixed(2)}</span>
                            <p className="text-xs text-slate-500 mt-1">预计剩余 3 天</p>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setBalance(b => b + 50);
                            }}
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg active:scale-95 transition-transform">
                            充值
                        </button>
                    </div>
                    <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${balance < 10 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(balance, 100)}%` }}></div>
                    </div>
                </div>

                {/* Main Services Grid */}
                <h3 className="font-bold text-slate-800 mb-3 text-sm">常用服务</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setCurrentView('REPAIR')}
                        className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3 active:scale-95 transition-transform"
                    >
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                            <Wrench size={24} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">故障报修</span>
                    </button>

                    <button 
                        onClick={() => setCurrentView('TRANSFER')}
                        className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3 active:scale-95 transition-transform"
                    >
                         <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                            <ArrowLeftRight size={24} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">申请换宿</span>
                    </button>

                     <button 
                        onClick={() => setCurrentView('CHECKOUT')}
                        className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3 active:scale-95 transition-transform"
                    >
                         <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                            <LogOut size={24} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">自助退宿</span>
                    </button>
                    
                    {/* Placeholder for layout balance */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-200 flex flex-col items-center text-center gap-3 justify-center">
                        <span className="text-xs text-slate-400">更多服务敬请期待</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <button onClick={() => setCurrentView('DASHBOARD')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-lg font-bold text-slate-900">个人中心</h2>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                 <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <div className="p-6 flex flex-col items-center border-b border-slate-100">
                         <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-3xl mb-3">
                             {currentUser.name.charAt(0)}
                         </div>
                         <h3 className="font-bold text-xl text-slate-900">{currentUser.name}</h3>
                         <p className="text-slate-500 text-sm mt-1">{currentUser.company}</p>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">手机号码</span>
                            <span className="font-medium text-slate-900">138****0000</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">身份证号</span>
                            <span className="font-medium text-slate-900">4403**********1234</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">入住日期</span>
                            <span className="font-medium text-slate-900">2023-01-15</span>
                        </div>
                    </div>
                 </div>

                 <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">住宿信息</div>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">房间号</span>
                            <span className="font-medium text-slate-900">{(currentUser as any).roomNumber || 'A栋-305室'}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">床位号</span>
                            <span className="font-medium text-slate-900">{(currentUser as any).bedNumber || '2号床'}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">门锁密码</span>
                            <span className="font-medium text-slate-900">****** <span className="text-blue-600 text-xs ml-2">重置</span></span>
                        </div>
                    </div>
                 </div>

                 <button 
                    onClick={handleLogout}
                    className="w-full bg-white border border-slate-200 text-red-600 py-3 rounded-xl font-medium shadow-sm hover:bg-red-50"
                 >
                     退出登录
                 </button>
            </div>
        </div>
    );

    const renderActionFlow = (action: 'CHECKOUT' | 'TRANSFER') => (
        <div className="flex flex-col h-full bg-slate-50">
             {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <button onClick={() => setCurrentView('DASHBOARD')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-lg font-bold text-slate-900">{action === 'CHECKOUT' ? '自助退宿' : '申请换宿'}</h2>
            </div>

            <div className="flex-1 p-6 flex flex-col">
                {processSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                            <Check size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">提交成功</h3>
                        <p className="text-slate-500 mt-2 px-6">
                            {action === 'CHECKOUT' 
                                ? '退宿申请已受理，系统正在进行费用结算和权限回收...' 
                                : '换宿申请已提交，请留意短信通知，审核通过后将下发新房间权限。'}
                        </p>
                        <button 
                            onClick={() => action === 'TRANSFER' ? setCurrentView('DASHBOARD') : null} // Checkout auto redirects
                            className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-lg font-medium"
                        >
                            {action === 'CHECKOUT' ? '正在跳转...' : '返回首页'}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-blue-600"/> 资格自检
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-600">房租缴纳状态</span>
                                    {currentUser.rentStatus === 'PAID' ? (
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Check size={12}/> 正常</span>
                                    ) : (
                                        <span className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={12}/> 欠费</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-600">水电余额状态</span>
                                    {balance >= 0 ? (
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Check size={12}/> 充足</span>
                                    ) : (
                                        <span className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={12}/> 欠费</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-600">报修工单状态</span>
                                    <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Check size={12}/> 无未完成</span>
                                </div>
                            </div>
                        </div>

                        {action === 'CHECKOUT' && (
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 mb-6">
                                <strong>⚠️ 重要提示：</strong>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                                    <li>退宿确认后，门禁权限将立即失效。</li>
                                    <li>请确保个人物品已全部搬离。</li>
                                    <li>押金将在24小时内退回原支付账户。</li>
                                </ul>
                            </div>
                        )}

                        {action === 'TRANSFER' && (
                             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mb-6">
                                <strong>💡 换宿说明：</strong>
                                <p className="mt-2 text-xs">提交申请后，系统将为您自动分配同类型空闲床位。如需指定房间，请联系宿管人工处理。</p>
                            </div>
                        )}

                        <div className="mt-auto">
                            <button 
                                onClick={() => handleProcessAction(action)}
                                disabled={isProcessing}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isProcessing && <Loader2 size={20} className="animate-spin" />}
                                {isProcessing ? '正在处理...' : (action === 'CHECKOUT' ? '确认办理退宿' : '提交换宿申请')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    const renderRepair = () => (
         <div className="flex flex-col h-full bg-slate-50">
             <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <button onClick={() => setCurrentView('DASHBOARD')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-lg font-bold text-slate-900">故障报修</h2>
            </div>
            <div className="p-6 text-center text-slate-400 mt-20">
                <Wrench size={48} className="mx-auto mb-4 opacity-20" />
                <p>报修功能演示页面</p>
                <button onClick={() => setCurrentView('DASHBOARD')} className="mt-4 text-blue-600 text-sm font-medium">返回</button>
            </div>
        </div>
    );

    const renderUtilityDetail = () => (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <button onClick={() => setCurrentView('DASHBOARD')} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-lg font-bold text-slate-900">水电明细</h2>
            </div>

            <div className="p-6 space-y-6">
                {/* Tabs & Month */}
                <div className="flex justify-between items-center">
                    <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
                        <button
                            onClick={() => setUtilityType('ELEC')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                                utilityType === 'ELEC' 
                                ? 'bg-yellow-500 text-white shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Zap size={14} /> 电表
                        </button>
                        <button
                            onClick={() => setUtilityType('WATER')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                                utilityType === 'WATER' 
                                ? 'bg-cyan-500 text-white shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Droplets size={14} /> 水表
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{selectedMonth}</span>
                        <ChevronRight size={14} className="text-slate-400 rotate-90" />
                    </div>
                </div>

                {/* Summary */}
                <div className="text-sm text-slate-600">
                    以下 <span className="font-bold text-slate-900">1</span> 台{utilityType === 'ELEC' ? '电表' : '水表'}，在 {selectedMonth}，总用量 <span className="font-bold text-xl text-slate-900">{utilityType === 'ELEC' ? '124.50' : '8.20'}</span> {utilityType === 'ELEC' ? '度' : '吨'}
                </div>

                {/* Table List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-4 bg-slate-50 p-3 text-xs font-bold text-slate-500 border-b border-slate-100 text-center">
                        <div>抄取时间</div>
                        <div className="col-span-2 text-left pl-4">抄取读数({utilityType === 'ELEC' ? '度' : '吨'})</div>
                        <div>实际用量</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {/* Mock Rows */}
                        {[1, 2, 3, 4, 5].map((i) => {
                            const date = `${selectedMonth}-${String(31 - i * 3).padStart(2, '0')} 09:00`;
                            const reading = utilityType === 'ELEC' ? (1000 + i * 15).toFixed(2) : (200 + i * 2).toFixed(2);
                            const usage = utilityType === 'ELEC' ? '15.00' : '2.00';
                            
                            return (
                                <div key={i} className="grid grid-cols-4 p-4 text-xs items-center text-center hover:bg-slate-50">
                                    <div className="text-slate-500">{date}</div>
                                    <div className="col-span-2 text-left pl-4 font-mono font-medium text-slate-900">{reading}</div>
                                    <div className="font-bold text-slate-900">{usage}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-200 p-4 font-sans">
            {/* Phone Frame */}
            <div className="w-full max-w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl overflow-hidden relative border-8 border-slate-900 flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-slate-900 rounded-b-2xl z-20"></div>

                {/* Status Bar (Fake) */}
                <div className="h-12 bg-slate-900 w-full flex justify-between items-end px-6 pb-2 text-white text-xs shrink-0">
                    <span>9:41</span>
                    <div className="flex gap-1">
                        <span>4G</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* App Content based on State */}
                <div className="flex-1 overflow-hidden relative h-full bg-slate-50">
                    {appState === 'LOGIN' && renderLogin()}
                    {appState === 'CHECKIN' && renderCheckInWizard()}
                    {appState === 'MAIN' && (
                        currentUser.status === 'EVICTED' 
                        ? renderEvictedApp() 
                        : (
                            <>
                                {currentView === 'DASHBOARD' && renderDashboard()}
                                {currentView === 'PROFILE' && renderProfile()}
                                {currentView === 'CHECKOUT' && renderActionFlow('CHECKOUT')}
                                {currentView === 'TRANSFER' && renderActionFlow('TRANSFER')}
                                {currentView === 'REPAIR' && renderRepair()}
                                {currentView === 'UTILITY_DETAIL' && renderUtilityDetail()}
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileTenantApp;
