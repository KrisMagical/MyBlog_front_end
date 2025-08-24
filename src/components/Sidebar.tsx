import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getToken } from '@/services/auth';

// File path for the custom avatar
import avatarImage from 'D:\\java Project\\Blog_Front\\Resoures\\喜多.png'; // Ensure correct path
import magicHatImage from 'D:\\java Project\\Blog_Front\\Resoures\\HAt.png'; // Replace with the correct path for your custom Magic Hat image

const item = (to: string, text: string) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `block rounded-xl px-3 py-2 text-sm hover:bg-white hover:shadow ${isActive ? 'bg-white shadow' : ''}`
        }
    >
        {text}
    </NavLink>
);

export default function Sidebar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation(); // 获取当前路径
    const magicHatLink = "https://www.sunqixian.xyz"; // Customize the link for Magic Hat

    useEffect(() => {
        // 检查 token 是否存在以确定用户是否登录
        const token = getToken();
        setIsLoggedIn(!!token); // 如果 token 存在，说明用户已登录
    }, []);

    // 只有在用户登录时，并且访问控制台路径时才显示控制台部分
    const isConsoleRoute = location.pathname.includes('/console');

    return (
        <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-100 min-h-screen p-6 justify-between sticky top-0">
            <div>
                <div className="flex items-center gap-3 mb-8">
                    {/* Updated avatar with dynamic image */}
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                        <img src={avatarImage} alt="Kris Magic Avatar" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div>
                        <div className="font-semibold text-lg">Kris Magic</div>
                        <div className="text-xs text-gray-500">Blog & Notes</div>
                    </div>
                </div>

                <nav className="space-y-2">
                    {item('/', 'Home')}
                    {item('/blog', 'Blog')}
                    {item('/my-shares', 'My Shares')}
                    {item('/creations', 'Creations')}
                    {item('/consulting', '咨询空间')}

                    {/* 只有在登录并且访问控制台路径时才显示 Console */}
                    {isLoggedIn && isConsoleRoute && (
                        <div className="pt-4 border-t border-gray-200 mt-4">
                            <div className="text-xs uppercase text-gray-400 mb-1">Console</div>
                            {item('/console/login', 'Login')}
                            {item('/console/dashboard', 'Dashboard')}
                        </div>
                    )}
                </nav>
            </div>

            <div className="flex items-center gap-3 text-gray-500">
                {/* Updated X icon for Twitter */}
                <a href="https://x.com" aria-label="X">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/X_logo_2023.svg/1200px-X_logo_2023.svg.png" alt="X" className="w-6 h-6" />
                </a>
                <a href="https://youtube.com" aria-label="YouTube">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png" alt="YouTube" className="w-6 h-6" />
                </a>
                <a href="https://github.com" aria-label="GitHub">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" className="w-6 h-6" />
                </a>

                {/* Custom Magic Hat Image Link */}
                <a href={magicHatLink} aria-label="Magic Hat">
                    <img src={magicHatImage} alt="Magic Hat" className="w-6 h-6" />
                </a>
            </div>
        </aside>
    );
}
