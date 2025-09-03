import type { AppSettings, SocialLink } from '@/types/settings';

// 默认图标（与原 Sidebar 保持一致）
const DEFAULT_ICONS = {
    x: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/X_logo_2023.svg/1200px-X_logo_2023.svg.png',
    youtube: 'https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png',
    github: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
    magicHat: '' // 交给 Sidebar 内部的魔法帽本地图标来处理（或你可以放在线地址）
};

const STORAGE_KEY = 'app_settings_v1';

export const defaultSettings: AppSettings = {
    site: {
        title: 'Kris Magic',
        subtitle: 'Blog & Notes',
        avatarUrl: '' // 使用你原来的本地头像作为兜底
    },
    social: [
        { id: 'x',       label: 'X',        href: 'https://x.com',        iconUrl: DEFAULT_ICONS.x },
        { id: 'youtube', label: 'YouTube',  href: 'https://youtube.com',  iconUrl: DEFAULT_ICONS.youtube },
        { id: 'github',  label: 'GitHub',   href: 'https://github.com',   iconUrl: DEFAULT_ICONS.github },
        { id: 'magic',   label: 'Magic Hat', href: 'https://www.sunqixian.xyz', iconUrl: '' },
    ],
};

// ✅ 专用解析函数，去掉不必要的泛型，避免 TS2339
function safeParse(raw: string | null, fallback: AppSettings): AppSettings {
    if (!raw) return fallback;
    try {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        return {
            site: { ...fallback.site, ...(parsed.site ?? {}) },
            social: Array.isArray(parsed.social) ? parsed.social as SocialLink[] : fallback.social,
        };
    } catch {
        return fallback;
    }
}

// 简单 URL 校验（宽松）
export const isValidUrl = (url: string) => /^https?:\/\/.+/i.test(url);

// 读取全部设置
export function getSettings(): AppSettings {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('app_settings_v1') : null;
    const merged = safeParse(raw, defaultSettings);
    if (!Array.isArray(merged.social)) merged.social = defaultSettings.social;
    return merged;
}

// 保存并广播“已更新”事件
export function saveSettings(next: AppSettings) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('app-settings-updated'));
}

// 仅更新某一部分（例如 site 或 social），其余保留
export function patchSettings(partial: {
    site?: Partial<AppSettings['site']>;
    social?: SocialLink[];
}) {
    const current = getSettings();
    const next: AppSettings = {
        site: { ...current.site, ...(partial.site ?? {}) },
        social: partial.social ?? current.social,
    };
    saveSettings(next);
}

// 重置为默认
export function resetSettings() {
    saveSettings(defaultSettings);
}

// 便捷工具：新增一个社交项
export function addSocialLink(link: Omit<SocialLink, 'id'>) {
    const current = getSettings();
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next = { ...current, social: [...current.social, { ...link, id }] };
    saveSettings(next);
    return id;
}

// 便捷工具：删除社交项
export function removeSocialLink(id: string) {
    const current = getSettings();
    const next = { ...current, social: current.social.filter(s => s.id !== id) };
    saveSettings(next);
}

// 便捷工具：更新某个社交项
export function updateSocialLink(id: string, patch: Partial<Omit<SocialLink, 'id'>>) {
    const current = getSettings();
    const next = {
        ...current,
        social: current.social.map(s => (s.id === id ? { ...s, ...patch } : s)),
    };
    saveSettings(next);
}
