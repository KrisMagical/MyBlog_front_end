import { useEffect, useState } from 'react'
import {
    getSettings,
    saveSettings,
    patchSettings,
    addSocialLink,
    removeSocialLink,
    updateSocialLink,
    isValidUrl,
} from '@/services/settings'
import type { AppSettings, SocialLink } from '@/types/settings'
import { uploadImage } from '@/services/api'

export default function ConsoleSettings() {
    const [settings, setSettings] = useState<AppSettings>(getSettings())
    const [saving, setSaving] = useState(false)

    // 监听「设置已更新」事件，做到 Sidebar/其它处与本页联动
    useEffect(() => {
        const onUpdated = () => setSettings(getSettings())
        window.addEventListener('app-settings-updated', onUpdated)
        return () => window.removeEventListener('app-settings-updated', onUpdated)
    }, [])

    const onChangeSite = (k: 'title' | 'subtitle', v: string) => {
        const next = { ...settings, site: { ...settings.site, [k]: v } }
        setSettings(next)
        patchSettings({ site: { [k]: v } }) // ✅ 不再需要 as any
    }

    const onUploadAvatar = async (file?: File | null) => {
        if (!file) return
        try {
            const url = await uploadImage(file)
            const next = { ...settings, site: { ...settings.site, avatarUrl: url } }
            setSettings(next)
            patchSettings({ site: { avatarUrl: url } }) // ✅ 类型完全匹配
            alert('头像已更新')
        } catch {
            alert('头像上传失败')
        }
    }

    const onAddSocial = () => {
        const id = addSocialLink({ label: 'New', href: 'https://', iconUrl: '' })
        setSettings(getSettings())
        // 可选：自动滚到末尾
        setTimeout(() => {
            const el = document.getElementById(`social-${id}`)
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 0)
    }

    const onRemoveSocial = (id: string) => {
        if (!confirm('确定删除这个社交链接？')) return
        removeSocialLink(id)
        setSettings(getSettings())
    }

    const onPatchSocial = (id: string, patch: Partial<Omit<SocialLink, 'id'>>) => {
        updateSocialLink(id, patch)
        setSettings(getSettings())
    }

    const onUploadSocialIcon = async (id: string, file?: File | null) => {
        if (!file) return
        try {
            const url = await uploadImage(file)
            onPatchSocial(id, { iconUrl: url })
            alert('图标已更新')
        } catch {
            alert('图标上传失败')
        }
    }

    const onSaveAll = () => {
        setSaving(true)
        try {
            saveSettings(settings)
            alert('设置已保存')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">站点设置</h1>

            {/* 站点基础信息 */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">站点信息</h2>
                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">标题</label>
                        <input
                            className="w-full border px-3 py-2 rounded-xl"
                            value={settings.site.title}
                            onChange={(e) => onChangeSite('title', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">副标题</label>
                        <input
                            className="w-full border px-3 py-2 rounded-xl"
                            value={settings.site.subtitle}
                            onChange={(e) => onChangeSite('subtitle', e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                        {settings.site.avatarUrl ? (
                            <img src={settings.site.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Avatar</div>
                        )}
                    </div>
                    <label className="cursor-pointer border px-3 py-2 rounded-xl">
                        上传头像
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => onUploadAvatar(e.target.files?.[0] ?? null)}
                        />
                    </label>
                </div>
            </section>

            {/* 社交链接 */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">社交链接</h2>
                    <button onClick={onAddSocial} className="px-3 py-2 rounded-xl border">
                        新增社交链接
                    </button>
                </div>

                <div className="space-y-4">
                    {settings.social.map((s) => (
                        <div
                            key={s.id}
                            id={`social-${s.id}`}
                            className="border rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden">
                                    {s.iconUrl ? (
                                        <img src={s.iconUrl} alt={s.label} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Icon</div>
                                    )}
                                </div>
                                <label className="cursor-pointer border px-3 py-2 rounded-xl">
                                    上传图标
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => onUploadSocialIcon(s.id, e.target.files?.[0] ?? null)}
                                    />
                                </label>
                            </div>

                            <input
                                className="flex-1 border px-3 py-2 rounded-xl"
                                value={s.label}
                                onChange={(e) => onPatchSocial(s.id, { label: e.target.value })}
                                placeholder="显示名称"
                            />
                            <input
                                className="flex-1 border px-3 py-2 rounded-xl"
                                value={s.href}
                                onChange={(e) => onPatchSocial(s.id, { href: e.target.value })}
                                placeholder="https://example.com"
                            />

                            <div className="flex items-center gap-2">
                                {!isValidUrl(s.href) && (
                                    <span className="text-xs text-red-500">链接格式需以 http/https 开头</span>
                                )}
                                <button
                                    onClick={() => onRemoveSocial(s.id)}
                                    className="px-3 py-2 rounded-xl border border-red-500 text-red-600"
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <button
                onClick={onSaveAll}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
            >
                {saving ? '保存中…' : '保存全部'}
            </button>
        </div>
    )
}
