import { useState } from 'react'
import { createPost, createPostFromMd, updatePost, updatePostFromMd, uploadImage, uploadVideo } from '@/services/api'

export default function Dashboard() {
    const [creating, setCreating] = useState(false)
    const [form, setForm] = useState({ title: '', content: '', slug: '', categorySlug: 'blog' })
    const [mdCategory, setMdCategory] = useState('blog')
    const [file, setFile] = useState<File | null>(null)

    const [updating, setUpdating] = useState(false)
    const [updateForm, setUpdateForm] = useState({ id: '', title: '', content: '', slug: '', categorySlug: '' })
    const [updateFile, setUpdateFile] = useState<File | null>(null)

    const createJSON = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        await createPost({ title: form.title, content: form.content, slug: form.slug }, form.categorySlug)
        alert('创建成功')
        setForm({ title: '', content: '', slug: '', categorySlug: 'blog' })
        setCreating(false)
    }

    const createFromMd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return alert('请选择 Markdown 文件')
        await createPostFromMd(file, mdCategory)
        alert('Markdown 创建成功')
        setFile(null)
    }

    const doUpdateJSON = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!updateForm.id) return
        setUpdating(true)
        await updatePost(Number(updateForm.id), { title: updateForm.title, content: updateForm.content, slug: updateForm.slug }, updateForm.categorySlug || undefined)
        alert('更新成功')
        setUpdating(false)
    }

    const doUpdateMd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!updateForm.id || !updateFile) return
        await updatePostFromMd(Number(updateForm.id), updateFile, updateForm.categorySlug || undefined)
        alert('Markdown 更新成功')
    }

    const [img, setImg] = useState<File | null>(null)
    const [vid, setVid] = useState<File | null>(null)

    const upImg = async () => { if (!img) return; const url = await uploadImage(img); alert('上传成功: ' + url) }
    const upVid = async () => { if (!vid) return; const url = await uploadVideo(vid); alert('上传成功: ' + url) }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">控制台</h1>

            <div className="grid md:grid-cols-2 gap-6">
                <section className="border rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">创建文章（JSON）</h2>
                    <form onSubmit={createJSON} className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 items-center">
                            <label className="text-sm text-gray-600">分类</label>
                            <select className="col-span-2 border rounded-xl px-3 py-2" value={form.categorySlug} onChange={(e) => setForm((s) => ({ ...s, categorySlug: e.target.value }))}>
                                <option value="blog">blog</option>
                                <option value="my-shares">my-shares</option>
                                <option value="creations">creations</option>
                            </select>
                        </div>
                        <input className="w-full border rounded-xl px-3 py-2" placeholder="标题" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
                        <input className="w-full border rounded-xl px-3 py-2" placeholder="Slug（唯一）" value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} />
                        <textarea rows={8} className="w-full border rounded-xl px-3 py-2" placeholder="Markdown 内容" value={form.content} onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))} />
                        <button disabled={creating} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60">{creating ? '提交中...' : '创建'}</button>
                    </form>
                </section>

                <section className="border rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">从 Markdown 创建</h2>
                    <form onSubmit={createFromMd} className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 items-center">
                            <label className="text-sm text-gray-600">分类</label>
                            <select className="col-span-2 border rounded-xl px-3 py-2" value={mdCategory} onChange={(e) => setMdCategory(e.target.value)}>
                                <option value="blog">blog</option>
                                <option value="my-shares">my-shares</option>
                                <option value="creations">creations</option>
                            </select>
                        </div>
                        <input type="file" accept=".md,.markdown,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        <button className="px-4 py-2 rounded-xl bg-black text-white">上传并创建</button>
                    </form>
                </section>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <section className="border rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">更新文章（JSON）</h2>
                    <form onSubmit={doUpdateJSON} className="space-y-2">
                        <input className="w-full border rounded-xl px-3 py-2" placeholder="文章 ID" value={updateForm.id} onChange={(e) => setUpdateForm((s) => ({ ...s, id: e.target.value }))} />
                        <div className="grid grid-cols-3 gap-2 items-center">
                            <label className="text-sm text-gray-600">新分类（可选）</label>
                            <input className="col-span-2 border rounded-xl px-3 py-2" placeholder="例如 blog" value={updateForm.categorySlug} onChange={(e) => setUpdateForm((s) => ({ ...s, categorySlug: e.target.value }))} />
                        </div>
                        <input className="w-full border rounded-xl px-3 py-2" placeholder="标题" value={updateForm.title} onChange={(e) => setUpdateForm((s) => ({ ...s, title: e.target.value }))} />
                        <input className="w-full border rounded-xl px-3 py-2" placeholder="Slug（可改）" value={updateForm.slug} onChange={(e) => setUpdateForm((s) => ({ ...s, slug: e.target.value }))} />
                        <textarea rows={6} className="w-full border rounded-xl px-3 py-2" placeholder="Markdown 内容" value={updateForm.content} onChange={(e) => setUpdateForm((s) => ({ ...s, content: e.target.value }))} />
                        <button disabled={updating} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60">{updating ? '提交中...' : '更新'}</button>
                    </form>
                </section>

                <section className="border rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">更新文章（Markdown）</h2>
                    <form onSubmit={doUpdateMd} className="space-y-2">
                        <input className="w-full border rounded-xl px-3 py-2" placeholder="文章 ID" value={updateForm.id} onChange={(e) => setUpdateForm((s) => ({ ...s, id: e.target.value }))} />
                        <div className="grid grid-cols-3 gap-2 items-center">
                            <label className="text-sm text-gray-600">新分类（可选）</label>
                            <input className="col-span-2 border rounded-xl px-3 py-2" placeholder="例如 blog" value={updateForm.categorySlug} onChange={(e) => setUpdateForm((s) => ({ ...s, categorySlug: e.target.value }))} />
                        </div>
                        <input type="file" accept=".md,.markdown,.txt" onChange={(e) => setUpdateFile(e.target.files?.[0] || null)} />
                        <button className="px-4 py-2 rounded-xl bg-black text-white">上传并更新</button>
                    </form>
                </section>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <section className="border rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">上传图片</h2>
                    <div className="flex items-center gap-3">
                        <input type="file" accept="image/*" onChange={(e) => setImg(e.target.files?.[0] || null)} />
                        <button onClick={upImg} className="px-3 py-1 rounded-xl border">上传</button>
                    </div>
                </section>
                <section className="border rounded-2xl p-4">
                    <h2 className="font-semibold mb-3">上传视频</h2>
                    <div className="flex items-center gap-3">
                        <input type="file" accept="video/*" onChange={(e) => setVid(e.target.files?.[0] || null)} />
                        <button onClick={upVid} className="px-3 py-1 rounded-xl border">上传</button>
                    </div>
                </section>
            </div>
        </div>
    )
}