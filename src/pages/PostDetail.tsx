import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getLikeAndDislikeCount, getPostDetail, postLike } from '@/services/api'
import type { LikeResponseDto, PostDetailDto } from '@/types/dtos'
import { ErrorBlock, Skeleton, Empty } from '@/components/ui'
import Comments from '@/components/Comments'

export default function PostDetail() {
    const { slug } = useParams()
    const [post, setPost] = useState<PostDetailDto | null>(null)
    const [likes, setLikes] = useState<LikeResponseDto>({ likes: 0, dislikes: 0, message: '' })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchAll = async () => {
        try {
            const [p, l] = await Promise.all([
                getPostDetail(slug!),
                getLikeAndDislikeCount(slug!)
            ])
            setPost(p)
            setLikes(l)
        } catch (e: any) {
            setError(e?.message || '加载失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        fetchAll()
    }, [slug])

    const toggleLike = async (positive: boolean) => {
        if (!post?.id) return
        await postLike(post.id, positive)
        const l = await getLikeAndDislikeCount(slug!)
        setLikes(l)
    }

    if (loading) return <Skeleton lines={12} />
    if (error) return <ErrorBlock text={error} />
    if (!post) return <Empty text="未找到文章" />

    return (
        <article className="prose max-w-none">
            <h1 className="!mb-2">{post.title}</h1>
            <div className="text-sm text-gray-500 mb-4">
                <span>{new Date(post.createdAt!).toLocaleString()}</span>
                <span className="mx-2">·</span>
                <span>{post.categoryName}</span>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4 mb-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || ''}</ReactMarkdown>
            </div>

            <div className="flex items-center gap-3 mb-8">
                <button onClick={() => toggleLike(true)} className="px-3 py-1 rounded-full border hover:shadow">👍 赞同 ({likes.likes || 0})</button>
                <button onClick={() => toggleLike(false)} className="px-3 py-1 rounded-full border hover:shadow">👎 反对 ({likes.dislikes || 0})</button>
                {likes.message ? <span className="text-xs text-gray-500">{likes.message}</span> : null}
            </div>

            <Comments postId={post.id!} />
        </article>
    )
}