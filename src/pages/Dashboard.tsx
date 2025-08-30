import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import {
    createPost,
    createPostFromMd,
    updatePost,
    updatePostFromMd,
    uploadImage,
    uploadVideo,
    getAllCategories,
} from "@/services/api"
import type { CategoryDto, PostDetailDto } from "@/types/dtos"
import CategoryManager from "@/components//CategoryManager"

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

    // 加载分类
    useEffect(() => {
        getAllCategories().then(setCategories)
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

    // 提交文章（创建/更新）
    const handleSubmit = async () => {
        if (!fileMode && (!title || !slug || !content)) {
            return alert("请填写完整的文章信息")
        }
        if (fileMode && !selectedFile) {
            return alert("请选择 Markdown 文件")
        }

        setSubmitting(true)
        try {
            let result: PostDetailDto
            if (isUpdate && updateId) {
                // 更新模式
                if (fileMode && selectedFile) {
                    result = await updatePostFromMd(updateId, selectedFile, categorySlug)
                } else {
                    result = await updatePost(updateId, { title, slug, content }, categorySlug)
                }
                alert("文章已更新！")
            } else {
                // 创建模式
                if (fileMode && selectedFile) {
                    result = await createPostFromMd(selectedFile, categorySlug)
                } else {
                    result = await createPost({ title, slug, content }, categorySlug)
                }
                alert("文章已创建！")
            }

            // 重置表单
            setTitle("")
            setSlug("")
            setContent("")
            setCategorySlug("blog")
            setSelectedFile(null)
            setIsUpdate(false)
            setUpdateId(null)
        } catch (e) {
            alert("操作失败")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">控制台 - {isUpdate ? "更新文章" : "新建文章"}</h1>

            {/* 标题输入 */}
            {!fileMode && (
                <input
                    className="w-full border px-3 py-2 rounded-xl"
                    placeholder="标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            )}

            {/* Slug 输入 */}
            {!fileMode && (
                <input
                    className="w-full border px-3 py-2 rounded-xl"
                    placeholder="Slug（唯一标识）"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                />
            )}

            {/* 分类选择 */}
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
                {submitting ? "提交中..." : isUpdate ? "更新文章" : "发布文章"}
            </button>

            {/* 分类管理面板 */}
            <CategoryManager />
        </div>
    )
}
