import { useEffect, useState } from 'react'
import { getAllCategories, getPostsByCategory, getPageBySlug } from '@/services/api'
import type { CategoryDto, PostSummaryDto, PageDto } from '@/types/dtos'
import PostCard from '@/components/PostCard'
import { Empty, Skeleton } from '@/components/ui'
import ReactMarkdown from 'react-markdown'

export default function Home() {
    const [categories, setCategories] = useState<CategoryDto[]>([])
    const [recent, setRecent] = useState<PostSummaryDto[]>([])
    const [page, setPage] = useState<PageDto | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const cats = await getAllCategories()
                if (!mounted) return
                const validCats = (cats ?? []).filter(c => !!c?.name && !!c?.slug)
                setCategories(validCats)

                if (validCats.length) {
                    const posts = await getPostsByCategory(validCats[0].slug)
                    if (!mounted) return
                    setRecent(posts)
                } else {
                    setRecent([])
                }

                try {
                    const p = await getPageBySlug("home")
                    if (mounted) setPage(p)
                } catch {
                }
            } finally {
                setLoading(false)
            }
        })()
        return () => {
            mounted = false
        }
    }, [])

    return (
        <div>
            {page ? (
                <div className="mb-8 prose max-w-none">
                    <ReactMarkdown>{page.content}</ReactMarkdown>
                </div>
            ) : (
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">欢迎 👋</h1>
                    <p className="text-gray-600">这是一个最小可用界面（MVP），对接 Blog Service API。</p>
                </div>
            )}

            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-3">分类</h2>
                {loading ? (
                    <Skeleton lines={2} />
                ) : categories.length ? (
                    <div className="flex flex-wrap gap-2">
                        {categories.map(c => (
                            <span
                                key={c.id ?? c.slug}
                                className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                            >
                                {c.name}
                            </span>
                        ))}
                    </div>
                ) : (
                    <Empty text="暂无分类" />
                )}
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-3">近期文章</h2>
                {loading ? (
                    <Skeleton lines={4} />
                ) : recent.length ? (
                    <div className="space-y-3">
                        {recent.slice(0, 5).map(p => (
                            <PostCard key={p.slug} post={p} />
                        ))}
                    </div>
                ) : (
                    <Empty text="暂无文章" />
                )}
            </section>
        </div>
    )
}
