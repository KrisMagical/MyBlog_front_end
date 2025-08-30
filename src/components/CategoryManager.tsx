import { useEffect, useState } from "react"
import { getAllCategories, createCategory, updateCategory } from "@/services/api"
import type { CategoryDto } from "@/types/dtos"

export default function CategoryManager() {
    const [categories, setCategories] = useState<CategoryDto[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState("")
    const [newSlug, setNewSlug] = useState("")
    const [editing, setEditing] = useState<CategoryDto | null>(null)

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const data = await getAllCategories()
            setCategories(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleCreate = async () => {
        if (!newName || !newSlug) return alert("请填写完整分类信息")
        try {
            await createCategory({ id: 0, name: newName, slug: newSlug })
            setNewName("")
            setNewSlug("")
            fetchCategories()
        } catch (e) {
            alert("创建分类失败")
        }
    }

    const handleUpdate = async () => {
        if (!editing) return
        try {
            await updateCategory(editing.id!, { id: editing.id, name: editing.name, slug: editing.slug })
            setEditing(null)
            fetchCategories()
        } catch (e) {
            alert("更新分类失败")
        }
    }

    return (
        <div className="p-4 border rounded-xl space-y-4">
            <h2 className="text-xl font-bold">分类管理</h2>

            {/* 创建分类 */}
            <div className="flex gap-2 items-center">
                <input
                    className="border px-2 py-1 rounded"
                    placeholder="分类名称"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <input
                    className="border px-2 py-1 rounded"
                    placeholder="分类 Slug"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                />
                <button className="px-3 py-1 bg-black text-white rounded" onClick={handleCreate}>
                    新建
                </button>
            </div>

            {/* 分类列表 */}
            {loading ? (
                <p>加载中...</p>
            ) : (
                <ul className="space-y-2">
                    {categories.map((c) => (
                        <li key={c.id} className="flex gap-3 items-center border-b py-1">
                            {editing?.id === c.id ? (
                                <>
                                    <input
                                        className="border px-2 py-1 rounded"
                                        value={editing.name}
                                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                    />
                                    <input
                                        className="border px-2 py-1 rounded"
                                        value={editing.slug}
                                        onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                                    />
                                    <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={handleUpdate}>
                                        保存
                                    </button>
                                    <button className="px-2 py-1 border rounded" onClick={() => setEditing(null)}>
                                        取消
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span>{c.name}</span>
                                    <span className="text-gray-500 text-sm">({c.slug})</span>
                                    <button className="px-2 py-1 border rounded" onClick={() => setEditing(c)}>
                                        编辑
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
