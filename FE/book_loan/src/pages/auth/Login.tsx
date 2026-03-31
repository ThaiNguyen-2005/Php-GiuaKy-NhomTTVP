import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerStudent } from '../../api/authApi';

export default function Login({ onLogin }: { onLogin: (role: 'student' | 'admin') => void }) {
    const [isLogin, setIsLogin] = useState(true);
    const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const res = await loginUser(selectedRole, identifier, password);
                localStorage.setItem('user', JSON.stringify(res.user));
                onLogin(selectedRole);
                if (selectedRole === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/home');
                }
            } else {
                if (selectedRole === 'admin') {
                    throw new Error('Chỉ sinh viên mới được phép đăng ký tài khoản.');
                }
                const res = await registerStudent(name, identifier, password, phone);
                localStorage.setItem('user', JSON.stringify(res.user));
                onLogin('student');
                navigate('/home');
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Không thể kết nối tới máy chủ.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col academic-pattern bg-background">
            <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-md shadow-xl shadow-blue-900/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                        <span className="material-symbols-outlined filled">school</span>
                    </div>
                    <span className="font-headline text-xl font-bold tracking-tight text-primary">HCMUE Library</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">language</span>
                    </button>
                    <button className="text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">help_outline</span>
                    </button>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center px-4 py-24">
                <div className="w-full max-w-[1100px] grid md:grid-cols-2 bg-surface-bright rounded-xl overflow-hidden shadow-2xl shadow-blue-900/10">
                    <div className="hidden md:flex flex-col justify-center p-12 bg-primary relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full border-[20px] border-white"></div>
                            <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 rounded-full border-[15px] border-white"></div>
                        </div>
                        <div className="relative z-10">
                            <span className="text-white/70 font-label tracking-[0.2em] text-xs font-bold uppercase mb-4 block">HCMUE Digital Library</span>
                            <h1 className="text-white font-headline text-4xl font-extrabold leading-tight mb-6">
                                Khám phá kho tri thức số đa phương tiện.
                            </h1>
                            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
                                Truy cập hàng ngàn tài liệu học tập, nghiên cứu và bài giảng số mọi lúc, mọi nơi.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                        <div className="mb-10">
                            <h2 className="text-slate-900 font-headline text-3xl font-bold mb-2">Chào mừng bạn!</h2>
                            <p className="text-slate-500">Đăng nhập để tiếp tục hành trình học thuật của bạn.</p>
                        </div>

                        <div className="flex gap-8 mb-6 border-b border-surface-container-high">
                            <button
                                className={`pb-4 text-sm font-semibold transition-colors ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Đăng nhập
                            </button>
                            <button
                                type="button"
                                className={`pb-4 text-sm font-semibold transition-colors ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                onClick={() => { setIsLogin(false); setSelectedRole('student'); }}
                            >
                                Đăng ký
                            </button>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Role Selector */}
                            {isLogin && (
                                <div className="flex gap-4 p-3 bg-surface-container-low rounded-lg">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={selectedRole === 'student'}
                                            onChange={() => setSelectedRole('student')}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium">Sinh viên</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={selectedRole === 'admin'}
                                            onChange={() => setSelectedRole('admin')}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium">Thủ thư (Admin)</span>
                                    </label>
                                </div>
                            )}

                            {/* Error Message */}
                            {errorMsg && (
                                <div className="p-4 bg-red-50 text-red-600 font-medium text-sm flex items-center gap-2 rounded-lg border border-red-200">
                                    <span className="material-symbols-outlined">error</span>
                                    {errorMsg}
                                </div>
                            )}

                            {!isLogin && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-label">Họ và Tên</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">badge</span>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Nguyễn Văn A"
                                                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 outline-none"
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-label">Số điện thoại</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">call</span>
                                            <input
                                                type="text"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="0123456789"
                                                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 outline-none"
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-label">Mã số hoặc Email</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="user@example.com hoặc MSSV..."
                                        className="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-label">Mật khẩu</label>
                                    {isLogin && <a href="#" className="text-xs font-semibold text-primary hover:underline">Quên mật khẩu?</a>}
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-slate-900 placeholder:text-slate-400 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {isLogin && (
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="remember" className="w-4 h-4 rounded text-primary focus:ring-primary bg-surface-container-low border-none" />
                                    <label htmlFor="remember" className="text-sm text-slate-600">Duy trì đăng nhập</label>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2 ${isLoading ? 'bg-primary/70 cursor-wait' : 'bg-primary hover:bg-blue-700'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    isLogin ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-surface-container-high">
                            <p className="text-center text-sm text-slate-500">
                                Bạn gặp khó khăn khi đăng nhập? <a href="#" className="text-primary font-semibold hover:underline">Liên hệ Hỗ trợ Thư viện</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full flex flex-col md:flex-row justify-center items-center gap-6 px-8 py-8 bg-slate-50 mt-auto">
                <p className="font-label text-xs uppercase tracking-widest text-slate-500">
                    © 2026 HCMUE Library. Institutional Access Provided.
                </p>
                <div className="flex gap-6">
                    <a href="#" className="font-label text-xs uppercase tracking-widest text-slate-500 hover:text-primary underline underline-offset-4 transition-all">Privacy Policy</a>
                    <a href="#" className="font-label text-xs uppercase tracking-widest text-slate-500 hover:text-primary underline underline-offset-4 transition-all">Terms of Service</a>
                    <a href="#" className="font-label text-xs uppercase tracking-widest text-slate-500 hover:text-primary underline underline-offset-4 transition-all">Library Support</a>
                </div>
            </footer>
        </div>
    );
}