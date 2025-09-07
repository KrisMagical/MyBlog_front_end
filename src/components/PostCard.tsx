import { Link } from 'react-router-dom'
import type { PostSummaryDto } from '@/types/dtos'

import ThumbsUp from '../Resources/thumbs-up.svg?react'
import ThumbsDown from '../Resources/thumbs-down.svg?react'
import Eye from '../Resources/eye.svg?react'

export default function PostCard({ post }: { post: PostSummaryDto }) {
    return (
        <Link
            to={`/blog/${post.slug}`}
            className="block rounded-2xl border border-gray-200 hover:shadow-sm p-4"
        >
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <span className="text-xs text-gray-400">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
            </div>

            <p className="text-gray-600 mt-1 line-clamp-2">{post.excerpt}</p>

            <div className="mt-2 text-xs text-gray-500 flex gap-4 items-center">
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" />
            {post.likeCount ?? 0}
        </span>
                <span className="flex items-center gap-1">
          <ThumbsDown className="h-4 w-4" />
                    {post.dislikeCount ?? 0}
        </span>
                <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
                    {post.viewCount ?? 0}
        </span>
                <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded">
          {post.categoryName}
        </span>
            </div>
        </Link>
    )
}
