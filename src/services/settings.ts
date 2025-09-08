import type { AppSettings, SocialLink } from '@/types/settings';

const DEFAULT_ICONS = {
    x: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/X_logo_2023.svg/1200px-X_logo_2023.svg.png',
    youtube: 'https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png',
    github: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
    magicHat: ''
};

const STORAGE_KEY = 'app_settings_v1';

export const defaultSettings: AppSettings = {
    site: {
        title: 'Kris Magic',
        subtitle: 'Blog & Notes',
        avatarUrl: ''
    },
    social: [
        { id: 'x',       label: 'X',        href: 'https://x.com',        iconUrl: DEFAULT_ICONS.x },
        { id: 'youtube', label: 'YouTube',  href: 'https://youtube.com',  iconUrl: DEFAULT_ICONS.youtube },
        { id: 'github',  label: 'GitHub',   href: 'https://github.com',   iconUrl: DEFAULT_ICONS.github },
        { id: 'magic',   label: 'Magic Hat', href: 'https://www.sunqixian.xyz', iconUrl: '' },
    ],
};

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

export const isValidUrl = (url: string) => /^https?:\/\/.+/i.test(url);

export function getSettings(): AppSettings {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('app_settings_v1') : null;
    const merged = safeParse(raw, defaultSettings);
    if (!Array.isArray(merged.social)) merged.social = defaultSettings.social;
    return merged;
}

export function saveSettings(next: AppSettings) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('app-settings-updated'));
}

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

export function resetSettings() {
    saveSettings(defaultSettings);
}

export function addSocialLink(link: Omit<SocialLink, 'id'>) {
    const current = getSettings();
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next = { ...current, social: [...current.social, { ...link, id }] };
    saveSettings(next);
    return id;
}

export function removeSocialLink(id: string) {
    const current = getSettings();
    const next = { ...current, social: current.social.filter(s => s.id !== id) };
    saveSettings(next);
}

export function updateSocialLink(id: string, patch: Partial<Omit<SocialLink, 'id'>>) {
    const current = getSettings();
    const next = {
        ...current,
        social: current.social.map(s => (s.id === id ? { ...s, ...patch } : s)),
    };
    saveSettings(next);
}
