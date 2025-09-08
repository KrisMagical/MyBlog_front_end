import { useEffect, useState, useCallback } from "react";
import { getAllCategories, createCategory, updateCategoryByName, deleteCategoryByName } from "@/services/api";
import type { CategoryDto } from "@/types/dtos";

export default function CategoryManager() {
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [editing, setEditing] = useState<CategoryDto | null>(null);
    const [editingOriginalName, setEditingOriginalName] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllCategories();
            setCategories(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchCategories();
    }, [fetchCategories]);

    const handleCreate = async () => {
        if (!newName.trim() || !newSlug.trim()) return alert("请填写完整分类信息");
        try {
            await createCategory({ id: 0, name: newName.trim(), slug: newSlug.trim() });
            setNewName("");
            setNewSlug("");
            await fetchCategories();
        } catch {
            alert("创建分类失败");
        }
    };

    const handleUpdate = async () => {
        if (!editing || !editingOriginalName) return;
        try {
            await updateCategoryByName(editingOriginalName, {
                id: editing.id,
                name: editing.name.trim(),
                slug: editing.slug.trim(),
            });
            setEditing(null);
            setEditingOriginalName(null);
            await fetchCategories();
        } catch {
            alert("更新分类失败");
        }
    };

    const handleDelete = async (name: string) => {
        if (!name) return;
        if (!confirm(`确定要删除分类「${name}」吗？此操作将删除该分类下的所有文章（及其评论），不可恢复！`)) return;
        try {
            await deleteCategoryByName(name);
            // 若正在编辑被删项，重置编辑状态
            if (editing?.name === name) {
                setEditing(null);
                setEditingOriginalName(null);
            }
            await fetchCategories();
            alert("分类已删除");
        } catch {
            alert("删除分类失败");
        }
    };

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
                                    <button
                                        className="px-2 py-1 border rounded"
                                        onClick={() => {
                                            setEditing(null);
                                            setEditingOriginalName(null);
                                        }}
                                    >
                                        取消
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span>{c.name}</span>
                                    <span className="text-gray-500 text-sm">({c.slug})</span>
                                    <button
                                        className="px-2 py-1 border rounded"
                                        onClick={() => {
                                            setEditing(c);
                                            setEditingOriginalName(c.name); // 记录原始 name，供路径参数使用
                                        }}
                                    >
                                        编辑
                                    </button>
                                    <button
                                        className="px-2 py-1 border border-red-500 text-red-600 rounded"
                                        onClick={() => handleDelete(c.name)}
                                    >
                                        删除
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
