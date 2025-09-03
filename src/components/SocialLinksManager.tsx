import { useEffect, useState } from 'react';
import type { AppSettings, SocialLink } from '@/types/settings';
import { getSettings, saveSettings, addSocialLink, removeSocialLink, updateSocialLink, isValidUrl, defaultSettings } from '@/services/settings';

export default function SocialLinksManager() {
    const [settings, setSettings] = useState<AppSettings>(getSettings());
    const [dirty, setDirty] = useState(false);

    // 热更新：其他地方更新设置时刷新
    useEffect(() => {
        const onUpdated = () => setSettings(getSettings());
        window.addEventListener('app-settings-updated', onUpdated);
        return () => window.removeEventListener('app-settings-updated', onUpdated);
    }, []);

    // site 基本信息
    const onChangeSite = (key: 'title' | 'subtitle' | 'avatarUrl', value: string) => {
        setSettings(prev => ({ ...prev, site: { ...prev.site, [key]: value } }));
        setDirty(true);
    };

    // 新增一个社交项
    const onAdd = () => {
        const id = addSocialLink({ label: 'New', href: 'https://example.com', iconUrl: '' });
        setSettings(getSettings());
        setDirty(false); // 因为已直接保存
        // 也可以在此滚动到新项
    };

    const onRemove = (id: string) => {
        if (!confirm('确定删除该社交链接吗？')) return;
        removeSocialLink(id);
        setSettings(getSettings());
    };

    const onChangeItem = (id: string, key: keyof Omit<SocialLink, 'id'>, value: string) => {
        // 本地即时反应
        setSettings(prev => ({
            ...prev,
            social: prev.social.map(s => (s.id === id ? { ...s, [key]: value } : s)),
        }));
        setDirty(true);
    };

    const onSave = () => {
        // 简单校验
        for (const s of settings.social) {
            if (!s.label.trim()) return alert('请填写每个社交项的名称');
            if (!isValidUrl(s.href)) return alert(`链接不合法：${s.href}`);
            // iconUrl 可为空（例如用本地图标）
        }
        saveSettings(settings);
        setDirty(false);
        alert('已保存设置');
    };

    const onReset = () => {
        if (!confirm('恢复为默认设置？')) return;
        saveSettings(defaultSettings);
        setSettings(getSettings());
        setDirty(false);
    };

    return (
        <div className="mt-10 border rounded-2xl p-4 space-y-4">
            <h2 className="text-xl font-semibold">侧边栏社交与站点信息</h2>

            {/* 站点标题 / 副标题 / 头像 */}
            <div className="grid md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">站点标题</label>
                    <input
                        className="w-full border px-3 py-2 rounded-xl"
                        value={settings.site.title}
                        onChange={e => onChangeSite('title', e.target.value)}
                        placeholder="Kris Magic"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">副标题</label>
                    <input
                        className="w-full border px-3 py-2 rounded-xl"
                        value={settings.site.subtitle}
                        onChange={e => onChangeSite('subtitle', e.target.value)}
                        placeholder="Blog & Notes"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">头像 URL（可选）</label>
                    <input
                        className="w-full border px-3 py-2 rounded-xl"
                        value={settings.site.avatarUrl ?? ''}
                        onChange={e => onChangeSite('avatarUrl', e.target.value)}
                        placeholder="https://example.com/avatar.png"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">社交链接</h3>
                <button onClick={onAdd} className="px-3 py-1 rounded-xl border">新增社交项</button>
            </div>

            <div className="space-y-3">
                {settings.social.map((s) => (
                    <div key={s.id} className="grid md:grid-cols-12 gap-3 items-center border rounded-xl p-3">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-600 mb-1">名称</label>
                            <input
                                className="w-full border px-3 py-2 rounded-xl"
                                value={s.label}
                                onChange={e => onChangeItem(s.id, 'label', e.target.value)}
                                placeholder="GitHub / X / YouTube"
                            />
                        </div>
                        <div className="md:col-span-6">
                            <label className="block text-sm text-gray-600 mb-1">链接</label>
                            <input
                                className="w-full border px-3 py-2 rounded-xl"
                                value={s.href}
                                onChange={e => onChangeItem(s.id, 'href', e.target.value)}
                                placeholder="https://github.com/..."
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm text-gray-600 mb-1">图标 URL（可空）</label>
                            <input
                                className="w-full border px-3 py-2 rounded-xl"
                                value={s.iconUrl}
                                onChange={e => onChangeItem(s.id, 'iconUrl', e.target.value)}
                                placeholder="https://.../icon.svg"
                            />
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                            <button onClick={() => onRemove(s.id)} className="px-3 py-2 rounded-xl border border-red-500 text-red-600">
                                删除
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <button onClick={onSave} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60" disabled={!dirty}>
                    保存设置
                </button>
                <button onClick={onReset} className="px-4 py-2 rounded-xl border">恢复默认</button>
                {!dirty && <span className="text-sm text-gray-500 self-center">（无未保存更改）</span>}
            </div>
        </div>
    );
}
