import { useEffect, useState } from 'react'
import { addComment, deleteComment, getComments } from '@/services/api'
import type { CommentDto, CreateCommentRequest } from '@/types/dtos'
import { Empty, Skeleton } from './ui'

export default function Comments({ postId }: { postId: number }) {
    const [items, setItems] = useState<CommentDto[]>([])
    const [form, setForm] = useState<CreateCommentRequest>({ name: '', email: '', content: '' })
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const load = async () => {
        const data = await getComments(postId)
        setItems(data)
    }

    useEffect(() => {
        setLoading(true)
        load().finally(() => setLoading(false))
    }, [postId])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        await addComment(postId, form)
        setForm({ name: '', email: '', content: '' })
        await load()
        setSubmitting(false)
    }

    const remove = async (commentId: number) => {
        const email = window.prompt('请输入你的邮箱以删除该评论（需与创建时一致）')
        if (!email) return
        await deleteComment(commentId, email)
        await load()
    }

    return (
        <section className="mt-10">
            <h2 className="text-lg font-semibold mb-3">留言</h2>
            {loading ? (
                <Skeleton lines={3} />
            ) : items.length ? (
                <div className="space-y-3 mb-6">
                    {items.map((c) => (
                        <div key={c.id} className="border rounded-xl p-3">
                            <div className="text-sm text-gray-600 flex items-center justify-between">
                                <span className="font-medium">{c.name}</span>
                                <span className="text-xs">{new Date(c.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
                            <div className="text-right mt-2">
                                <button onClick={() => remove(c.id)} className="text-xs text-red-600 hover:underline">删除</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Empty text="还没有评论" />
            )}

            <form onSubmit={submit} className="space-y-2">
                <input
                    required
                    placeholder="你的名字"
                    className="w-full border rounded-xl px-3 py-2"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
                <input
                    type="email"
                    required
                    placeholder="邮箱（用于删除验证）"
                    className="w-full border rounded-xl px-3 py-2"
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                />
                <textarea
                    required
                    rows={4}
                    placeholder="留言内容"
                    className="w-full border rounded-xl px-3 py-2"
                    value={form.content}
                    onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
                />
                <button disabled={submitting} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60">
                    {submitting ? '提交中...' : '提交'}
                </button>
            </form>
        </section>
    )
}
