import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import {
    // Posts
    createPost,
    createPostFromMd,
    updatePost,
    updatePostFromMd,
    deletePostBySlug,
    getAllCategories,
    getPostDetail,
    uploadImage,
    uploadVideo,
    // Pages
    getPageBySlug,
    createPage,
    updatePageBySlug,
    createPageFromMd,
    updatePageFromMdBySlug,
    deletePageBySlug,
    type PageDto,
} from "@/services/api"
import type { CategoryDto, PostDetailDto } from "@/types/dtos"
import CategoryManager from "@/components/CategoryManager"
import SocialLinksManager from "@/components/SocialLinksManager"

// 动态导入 Markdown 编辑器，避免 SSR 报错
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

export default function Dashboard() {
    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [categorySlug, setCategorySlug] = useState("blog")
    const [categories, setCategories] = useState<CategoryDto[]>([])
    const [content, setContent] = useState<string>("")
    const [submitting, setSubmitting] = useState(false)
    const [fileMode, setFileMode] = useState(false) // true 表示 Markdown 文件模式
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUpdate, setIsUpdate] = useState(false)
    const [updateId, setUpdateId] = useState<number | null>(null)

    // ✅ 新增：页面模式（Page）/ 文章模式（Post）
    const [isPageMode, setIsPageMode] = useState(false)

    // 按 slug 加载旧内容
    const [loadSlug, setLoadSlug] = useState("")

    // 简单的 slug 生成（用户可自行覆盖）
    const slugify = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-")

    // 加载分类（文章模式使用）
    useEffect(() => {
        getAllCategories().then(setCategories).catch(() => {})
    }, [])

    // 上传并插入图片
    const handleUploadImage = async (file: File) => {
        try {
            const url = await uploadImage(file)
            setContent((c) => c + `\n\n![图片描述](${url})\n\n`)
        } catch (e) {
            alert("图片上传失败")
        }
    }

    // 上传并插入视频
    const handleUploadVideo = async (file: File) => {
        try {
            const url = await uploadVideo(file)
            setContent((c) => c + `\n\n@[video](${url})\n\n`)
        } catch (e) {
            alert("视频上传失败")
        }
    }

    // ✅ 根据模式与 slug 加载旧内容进入更新模式
    const handleLoadForUpdate = async () => {
        if (!loadSlug) return alert(`请先输入要加载的${isPageMode ? "页面" : "文章"} Slug`)
        try {
            if (isPageMode) {
                const data = await getPageBySlug(loadSlug)
                setTitle(data.title || "")
                setSlug(data.slug || "")
                setContent(data.content || "")
                setIsUpdate(true)
                setFileMode(false)
                setSelectedFile(null)
                setUpdateId(null) // Page 的更新不依赖 id
            } else {
                const data = await getPostDetail(loadSlug)
                setTitle(data.title || "")
                setSlug(data.slug || "")
                setContent(data.content || "")
                setUpdateId(data.id ?? null)
                setIsUpdate(true)
                setFileMode(false)
                setSelectedFile(null)

                // 用 categoryName 匹配可选分类，匹配不到就保留原值
                if (data.categoryName) {
                    const matched = categories.find((c) => c.name === data.categoryName)
                    if (matched) setCategorySlug(matched.slug)
                }
            }
        } catch (e) {
            alert(`未找到该 Slug 对应的${isPageMode ? "页面" : "文章"}`)
        }
    }

    // 取消更新并重置
    const cancelUpdate = () => {
        setTitle("")
        setSlug("")
        setContent("")
        setCategorySlug("blog")
        setSelectedFile(null)
        setIsUpdate(false)
        setUpdateId(null)
        setLoadSlug("")
        setFileMode(false)
    }

    // ✅ 删除（按模式调用）
    const handleDelete = async () => {
        const delSlug = slug || loadSlug
        if (!delSlug) return alert("当前没有可删除的 Slug")
        if (!confirm(`确定要删除${isPageMode ? "页面" : "文章"}「${delSlug}」吗？该操作不可恢复！`)) return
        try {
            if (isPageMode) {
                const removed = await deletePageBySlug(delSlug)
                alert(`页面已删除：${removed}`)
            } else {
                const removed = await deletePostBySlug(delSlug)
                alert(`文章已删除：${removed}`)
            }
            cancelUpdate()
        } catch (e) {
            alert("删除失败")
        }
    }

    // ✅ 提交（创建/更新），按模式调用不同 API
    const handleSubmit = async () => {
        // Page 模式无需分类；其余校验一致
        if (!fileMode && (!title || !slug || !content)) {
            return alert(`请填写完整的${isPageMode ? "页面" : "文章"}信息`)
        }
        if (fileMode) {
            if (!selectedFile) return alert("请选择 Markdown 文件")
            if (!slug && !isUpdate) return alert("请填写 Slug")
        }

        setSubmitting(true)
        try {
            if (isPageMode) {
                let result: PageDto
                if (isUpdate) {
                    if (fileMode && selectedFile) {
                        result = await updatePageFromMdBySlug(slug || loadSlug, selectedFile)
                    } else {
                        result = await updatePageBySlug(slug || loadSlug, { title, slug, content })
                    }
                    alert("页面已更新！")
                } else {
                    if (fileMode && selectedFile) {
                        result = await createPageFromMd(selectedFile, slug, title || undefined)
                    } else {
                        result = await createPage({ title, slug, content })
                    }
                    alert("页面已创建！")
                }
                // 重置
                cancelUpdate()
                return
            }

            // —— 文章模式（沿用原逻辑）——
            let result: PostDetailDto
            if (isUpdate && updateId) {
                if (fileMode && selectedFile) {
                    result = await updatePostFromMd(updateId, selectedFile, categorySlug)
                } else {
                    result = await updatePost(updateId, { title, slug, content }, categorySlug)
                }
                alert("文章已更新！")
            } else {
                if (fileMode && selectedFile) {
                    result = await createPostFromMd(selectedFile, categorySlug, slug, title || undefined)
                } else {
                    result = await createPost({ title, slug, content }, categorySlug)
                }
                alert("文章已创建！")
            }

            cancelUpdate()
        } catch (e) {
            alert("操作失败")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">
                控制台 - {isPageMode ? (isUpdate ? "更新页面" : "新建页面") : isUpdate ? "更新文章" : "新建文章"}
            </h1>

            {/* ✅ 模式切换 */}
            <div className="flex gap-3">
                <button
                    onClick={() => {
                        setIsPageMode(false)
                        cancelUpdate()
                    }}
                    className={`px-3 py-1 rounded-xl border ${!isPageMode ? "bg-black text-white" : ""}`}
                >
                    文章模式
                </button>
                <button
                    onClick={() => {
                        setIsPageMode(true)
                        cancelUpdate()
                    }}
                    className={`px-3 py-1 rounded-xl border ${isPageMode ? "bg-black text-white" : ""}`}
                >
                    页面模式
                </button>
            </div>

            {/* 按 slug 加载旧内容 */}
            <div className="flex items-center gap-3">
                <input
                    className="flex-1 border px-3 py-2 rounded-xl"
                    placeholder={`输入现有${isPageMode ? "页面" : "文章"}的 Slug 加载到编辑器以更新`}
                    value={loadSlug}
                    onChange={(e) => setLoadSlug(e.target.value)}
                />
                <button onClick={handleLoadForUpdate} className="px-3 py-2 rounded-xl border">
                    加载到编辑器
                </button>
                {isUpdate && (
                    <>
                        <button onClick={cancelUpdate} className="px-3 py-2 rounded-xl border">
                            取消更新
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-3 py-2 rounded-xl border border-red-500 text-red-600"
                        >
                            删除{isPageMode ? "页面" : "文章"}
                        </button>
                    </>
                )}
            </div>

            {/* 标题输入（非文件模式显示；文件模式下也有下方的标题/slug输入） */}
            {!fileMode && (
                <input
                    className="w-full border px-3 py-2 rounded-xl"
                    placeholder="标题"
                    value={title}
                    onChange={(e) => {
                        const v = e.target.value
                        setTitle(v)
                        if (!slug) setSlug(slugify(v))
                    }}
                />
            )}

            {/* Slug 输入（非文件模式显示；文件模式下也有下方的 slug 输入） */}
            {!fileMode && (
                <input
                    className="w-full border px-3 py-2 rounded-xl"
                    placeholder="Slug（唯一标识）"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                />
            )}

            {/* 分类选择（✅ 页面模式不显示） */}
            {!isPageMode && (
                <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">分类</label>
                    <select
                        className="border px-3 py-2 rounded-xl"
                        value={categorySlug}
                        onChange={(e) => setCategorySlug(e.target.value)}
                    >
                        {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* 编辑模式切换 */}
            <div className="flex gap-3">
                <button
                    onClick={() => setFileMode(false)}
                    className={`px-3 py-1 rounded-xl border ${!fileMode ? "bg-black text-white" : ""}`}
                >
                    富文本编辑
                </button>
                <button
                    onClick={() => setFileMode(true)}
                    className={`px-3 py-1 rounded-xl border ${fileMode ? "bg-black text-white" : ""}`}
                >
                    Markdown 文件
                </button>
            </div>

            {/* Markdown 编辑器 或 文件上传 */}
            {!fileMode ? (
                <div data-color-mode="light">
                    <MDEditor value={content} onChange={(v: string | undefined) => setContent(v || "")} height={500} />

                    {/* 插入文件按钮 */}
                    <div className="flex gap-3 mt-3">
                        <label className="cursor-pointer border px-3 py-2 rounded-xl">
                            插入图片
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => e.target.files && handleUploadImage(e.target.files[0])}
                            />
                        </label>
                        <label className="cursor-pointer border px-3 py-2 rounded-xl">
                            插入视频
                            <input
                                type="file"
                                accept="video/*"
                                hidden
                                onChange={(e) => e.target.files && handleUploadVideo(e.target.files[0])}
                            />
                        </label>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {/* 文件模式下补充标题与 Slug 输入 */}
                    <input
                        className="w-full border px-3 py-2 rounded-xl"
                        placeholder="标题（可选）"
                        value={title}
                        onChange={(e) => {
                            const v = e.target.value
                            setTitle(v)
                            if (!slug) setSlug(slugify(v))
                        }}
                    />
                    <input
                        className="w-full border px-3 py-2 rounded-xl"
                        placeholder="Slug（必填，唯一标识）"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                    />

                    <input
                        type="file"
                        accept=".md"
                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    />
                    {selectedFile && <span className="text-sm text-gray-600">已选择: {selectedFile.name}</span>}
                </div>
            )}

            {/* 提交按钮 */}
            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
            >
                {submitting
                    ? "提交中..."
                    : isUpdate
                        ? isPageMode
                            ? "更新页面"
                            : "更新文章"
                        : isPageMode
                            ? "发布页面"
                            : "发布文章"}
            </button>

            {/* 分类管理面板 */}
            <CategoryManager />

            {/* 侧边栏社交链接配置面板 */}
            <SocialLinksManager />
        </div>
    )
}
