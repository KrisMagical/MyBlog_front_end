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

    // State hooks
    const [post, setPost] = useState<PostDetailDto | null>(null)
    const [likes, setLikes] = useState<LikeResponseDto>({ likes: 0, dislikes: 0, message: '' })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [notification, setNotification] = useState('') // For success or failure messages
    const [notificationType, setNotificationType] = useState<'success' | 'error' | ''>('') // Determine notification type

    // Fetch post and like/dislike count
    const fetchPostData = async () => {
        try {
            const [postDetail, likeData] = await Promise.all([
                getPostDetail(slug!),
                getLikeAndDislikeCount(slug!)
            ])
            setPost(postDetail)
            setLikes(likeData)
        } catch (e) {
            setError('加载失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPostData()
    }, [slug]) // Only re-fetch when slug changes

    // Toggle like/dislike and show notification
    const toggleLike = async (positive: boolean) => {
        if (!post?.id) return

        try {
            await postLike(post.id, positive)
            const updatedLikes = await getLikeAndDislikeCount(slug!)
            setLikes(updatedLikes)

            // Show success message
            setNotification(positive ? '感谢点赞！' : '谢谢反馈！')
            setNotificationType('success') // Set notification type to success
            setTimeout(() => {
                setNotification('')
                setNotificationType('') // Clear after timeout
            }, 3000) // Hide message after 3 seconds
        } catch (e) {
            setNotification('Please do not like repeatedly')
            setNotificationType('error') // Set notification type to error
            setTimeout(() => {
                setNotification('')
                setNotificationType('') // Clear after timeout
            }, 3000) // Hide message after 3 seconds
        }
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

            {/* Notification for success or error */}
            {notification && (
                <div
                    className={`mb-4 p-2 rounded-md ${notificationType === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}
                >
                    {notification}
                </div>
            )}

            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => toggleLike(true)}
                    className="px-3 py-1 rounded-full border hover:shadow">
                    👍 赞同 ({likes.likes || 0})
                </button>
                <button
                    onClick={() => toggleLike(false)}
                    className="px-3 py-1 rounded-full border hover:shadow">
                    👎 反对 ({likes.dislikes || 0})
                </button>
            </div>

            <Comments postId={post.id!} />
        </article>
    )
}
