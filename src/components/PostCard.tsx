import { Link } from 'react-router-dom'
import type { PostSummaryDto } from '@/types/dtos'

export default function PostCard({ post }: { post: PostSummaryDto }) {
    return (
        <Link to={`/blog/${post.slug}`} className="block rounded-2xl border border-gray-200 hover:shadow-sm p-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-600 mt-1 line-clamp-2">{post.excerpt}</p>
            <div className="mt-2 text-xs text-gray-500 flex gap-4">
                <span>👍 {post.likeCount ?? 0}</span>
                <span>👎 {post.dislikeCount ?? 0}</span>
                <span>👁️ {post.viewCount ?? 0}</span>
                <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded">{post.categoryName}</span>
            </div>
        </Link>
    )
}