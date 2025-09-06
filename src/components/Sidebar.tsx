import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getToken } from '@/services/auth';
import { getAllCategories, getAllPages } from '@/services/api'; // 👈 新增 getAllPages
import type { CategoryDto, PageDto } from '@/types/dtos';

import { getSettings } from '@/services/settings';
import type { AppSettings, SocialLink } from '@/types/settings';

import avatarImage from '../Resoures/喜多.png';
import magicHatImage from '../Resoures/HAt.png';

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
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [pages, setPages] = useState<PageDto[]>([]); // 👈 新增：页面列表
    const [settings, setSettings] = useState<AppSettings>(getSettings());
    const location = useLocation();

    useEffect(() => {
        const token = getToken();
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        getAllCategories().then(setCategories).catch((e) => console.error('Failed to load categories for sidebar', e));
        getAllPages().then(setPages).catch((e) => console.error('Failed to load pages for sidebar', e)); // 👈 拉取页面
    }, []);

    // 监听设置变更（来自 ConsoleSettings 的 save/patch）
    useEffect(() => {
        const onUpdated = () => setSettings(getSettings());
        window.addEventListener('app-settings-updated', onUpdated);
        return () => window.removeEventListener('app-settings-updated', onUpdated);
    }, []);

    const isConsoleRoute = location.pathname.includes('/console');

    // 头像优先取用户设置，否则用本地兜底
    const avatarSrc =
        settings.site.avatarUrl && settings.site.avatarUrl.trim().length > 0
            ? settings.site.avatarUrl
            : (avatarImage as string);

    // 渲染社交：magic 图标优先使用用户 iconUrl；没有的话回退到本地方帽图
    const renderIconImg = (s: SocialLink) => {
        const fallback = s.id === 'magic' ? (magicHatImage as string) : undefined;
        const src = s.iconUrl && s.iconUrl.trim().length > 0 ? s.iconUrl : (fallback ?? s.iconUrl);
        if (!src) return <div className="w-6 h-6 flex items-center justify-center text-[10px] text-gray-400">N/A</div>;
        return <img src={src} alt={s.label} className="w-6 h-6" />;
    };

    // 辅助：把 /consulting 这种固定菜单避免与动态 Page 重复
    const hasConsulting = pages.some((p) => p.slug === 'consulting');

    return (
        <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-100 min-h-screen p-6 justify-between sticky top-0">
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                        <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="font-semibold text-lg">{settings.site.title || 'Kris Magic'}</div>
                        <div className="text-xs text-gray-500">{settings.site.subtitle || 'Blog & Notes'}</div>
                    </div>
                </div>

                <nav className="space-y-2">
                    {item('/', 'Home')}

                    {/* 分类 */}
                    {(categories ?? [])
                        .filter((c) => !!c && !!c.name && !!c.slug)
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

                    {/* Pages 动态渲染（如果你有通用路由 /:pageSlug，to 就是 `/${slug}`。
              当前你已有 /consulting 专页，也能正常匹配。 */}
                    {(pages ?? [])
                        .filter((p) => !!p && !!p.slug && !!p.title)
                        .map((p, idx) => (
                            <NavLink
                                key={`${p.id ?? 'idless'}-${p.slug}-${idx}`}
                                to={`/page/${encodeURIComponent(p.slug)}`}
                                className={({ isActive }) =>
                                    `block rounded-xl px-3 py-2 text-sm hover:bg-white hover:shadow ${isActive ? 'bg-white shadow' : ''}`
                                }
                            >
                                {p.title}
                            </NavLink>
                        ))}

                    {/* 原先手写的“咨询空间”入口：如果已经有同名 Page，就不再重复渲染 */}
                    {!hasConsulting && item('/consulting', '咨询空间')}

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
                {settings.social.map((s) => (
                    <a key={s.id} href={s.href} aria-label={s.label} title={s.label} target="_blank" rel="noreferrer">
                        {renderIconImg(s)}
                    </a>
                ))}
            </div>
        </aside>
    );
}
