import { useState } from 'react'
import { login } from '@/services/api'
import { setToken } from '@/services/auth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const nav = useNavigate()
    const [form, setForm] = useState({ username: '', password: '' })
    const [loading, setLoading] = useState(false)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const token = await login(form.username, form.password)
            setToken(token)
            nav('/console/dashboard')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-sm">
            <h1 className="text-2xl font-bold mb-4">管理后台登录</h1>
            <form onSubmit={submit} className="space-y-3">
                <input
                    required
                    placeholder="用户名"
                    className="w-full border rounded-xl px-3 py-2"
                    value={form.username}
                    onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                />
                <input
                    type="password"
                    required
                    placeholder="密码"
                    className="w-full border rounded-xl px-3 py-2"
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                />
                <button disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60">
                    {loading ? '登录中...' : '登录'}
                </button>
            </form>
        </div>
    )
}