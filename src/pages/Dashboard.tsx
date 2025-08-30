import { useState } from "react"
import dynamic from "next/dynamic"
import { createPost, uploadImage, uploadVideo } from "@/services/api"

// 动态导入 Markdown 编辑器，避免 SSR 报错
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

export default function Dashboard() {
    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [categorySlug, setCategorySlug] = useState("blog")
    const [content, setContent] = useState<string>("")
    const [submitting, setSubmitting] = useState(false)

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

    // 提交文章
    const handleSubmit = async () => {
        if (!title || !slug || !content) {
            return alert("请填写完整的文章信息")
        }
        setSubmitting(true)
        try {
            await createPost({ title, slug, content }, categorySlug)
            alert("文章已创建！")
            setTitle("")
            setSlug("")
            setContent("")
            setCategorySlug("blog")
        } catch (e) {
            alert("文章创建失败")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">控制台 - 新建文章</h1>

            {/* 标题输入 */}
            <input
                className="w-full border px-3 py-2 rounded-xl"
                placeholder="标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            {/* Slug 输入 */}
            <input
                className="w-full border px-3 py-2 rounded-xl"
                placeholder="Slug（唯一标识）"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
            />

            {/* 分类选择 */}
            <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">分类</label>
                <select
                    className="border px-3 py-2 rounded-xl"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                >
                    <option value="blog">blog</option>
                    <option value="my-shares">my-shares</option>
                    <option value="creations">creations</option>
                </select>
            </div>

            {/* Markdown 编辑器 */}
            <div data-color-mode="light">
                <MDEditor value={content} onChange={(v: string | undefined) => setContent(v || "")} height={500} />
            </div>

            {/* 插入文件按钮 */}
            <div className="flex gap-3">
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

            {/* 提交按钮 */}
            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
            >
                {submitting ? "提交中..." : "发布文章"}
            </button>
        </div>
    )
}
