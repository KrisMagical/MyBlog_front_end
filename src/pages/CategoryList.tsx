import { useEffect, useState } from 'react'
import { getPostsByCategory } from '@/services/api'
import { Skeleton, Empty } from '@/components/ui'
import PostCard from '@/components/PostCard'
import type { PostSummaryDto } from '@/types/dtos'

export default function CategoryList({ categorySlug }: { categorySlug: string }) {
    const [posts, setPosts] = useState<PostSummaryDto[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getPostsByCategory(categorySlug)
            .then(setPosts)
            .finally(() => setLoading(false))
    }, [categorySlug])

    const titleMap: Record<string, string> = {
        blog: '学习笔记 (Blog)',
        'my-shares': '日常分享 (My Shares)',
        creations: '开发笔记 / 项目展示 (Creations)'
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">{titleMap[categorySlug] || categorySlug}</h1>
            {loading ? (
                <Skeleton lines={6} />
            ) : posts.length ? (
                <div className="space-y-3">{posts.map((p) => <PostCard key={p.slug} post={p} />)}</div>
            ) : (
                <Empty text="暂无内容" />
            )}
        </div>
    )
}