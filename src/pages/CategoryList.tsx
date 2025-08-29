// CHANGE: 轻微增强：对 slug 做 encode/decode，确保健壮性
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostsByCategory } from '@/services/api';
import { Skeleton, Empty } from '@/components/ui';
import PostCard from '@/components/PostCard';
import type { PostSummaryDto } from '@/types/dtos';

export default function CategoryList({ categorySlug }: { categorySlug?: string }) {
    const { slug: slugFromRoute } = useParams();
    const slug = categorySlug ?? slugFromRoute ?? '';

    const [posts, setPosts] = useState<PostSummaryDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug || slug === 'null' || slug === 'undefined') {
            setPosts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        getPostsByCategory(decodeURIComponent(slug))
            .then(setPosts)
            .finally(() => setLoading(false));
    }, [slug]);

    const title =
        !slug || slug === 'null' || slug === 'undefined'
            ? '未命名分类'
            : decodeURIComponent(slug);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            {loading ? (
                <Skeleton lines={6} />
            ) : posts.length ? (
                <div className="space-y-3">{posts.map((p) => <PostCard key={p.slug} post={p} />)}</div>
            ) : (
                <Empty text="暂无内容" />
            )}
        </div>
    );
}
