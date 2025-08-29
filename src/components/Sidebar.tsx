// CHANGE: Sidebar 动态按分类渲染；修正 className 的模板字符串；保留 Console 区域逻辑
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getToken } from '@/services/auth';
import { getAllCategories } from '@/services/api';
import type { CategoryDto } from '@/types/dtos';

import avatarImage from 'D:\\java Project\\Blog_Front\\Resoures\\喜多.png';
import magicHatImage from 'D:\\java Project\\Blog_Front\\Resoures\\HAt.png';

const item = (to: string, text: string) => (
    // CHANGE: 修复模板字符串 & 添加基础类名
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
    const [categories, setCategories] = useState<CategoryDto[]>([]); // CHANGE: 动态分类
    const location = useLocation();
    const magicHatLink = 'https://www.sunqixian.xyz';

    useEffect(() => {
        const token = getToken();
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        // CHANGE: 拉取全部分类，驱动左侧栏
        getAllCategories()
            .then(setCategories)
            .catch((e) => console.error('Failed to load categories for sidebar', e));
    }, []);

    const isConsoleRoute = location.pathname.includes('/console');

    return (
        <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-100 min-h-screen p-6 justify-between sticky top-0">
            <div>
                <div className="flex items-center gap-3 mb-8">
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

                    {/* 过滤无效分类，并保证 key 唯一 */}
                    {(categories ?? [])
                        .filter(c => !!c && !!c.name && !!c.slug)
                        .map((c, idx) => (
                            <NavLink
                                key={`${c.id ?? 'idless'}-${c.slug}-${idx}`}
                                to={`/category/${encodeURIComponent(c.slug)}`}
                                className={({ isActive }) =>
                                    `block rounded-xl px-3 py-2 text-sm hover:bg-white hover:shadow ${isActive ? 'bg-white shadow' : ''}`
                                }
                            >
                                {c.name}
                            </NavLink>
                        ))}

                    {item('/consulting', '咨询空间')}
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
                <a href="https://x.com" aria-label="X">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/X_logo_2023.svg/1200px-X_logo_2023.svg.png"
                        alt="X"
                        className="w-6 h-6"
                    />
                </a>
                <a href="https://youtube.com" aria-label="YouTube">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png"
                        alt="YouTube"
                        className="w-6 h-6"
                    />
                </a>
                <a href="https://github.com" aria-label="GitHub">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
                        alt="GitHub"
                        className="w-6 h-6"
                    />
                </a>
                <a href={magicHatLink} aria-label="Magic Hat">
                    <img src={magicHatImage} alt="Magic Hat" className="w-6 h-6" />
                </a>
            </div>
        </aside>
    );
}
