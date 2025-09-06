import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '@/services/api';
import type { PageDto } from '@/types/dtos';

// 如果你项目中已使用 @uiw/react-md-editor 的预览组件，可以用它；
// 没有的话，先简单用 <div> 展示（或替换成你的 Markdown 渲染器）
export default function GenericPage() {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<PageDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setErr(null);
        getPageBySlug(slug)
            .then(setPage)
            .catch(() => setErr('页面不存在或暂不可用'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div className="p-6 text-sm text-gray-500">加载中...</div>;
    if (err) return <div className="p-6 text-sm text-red-600">{err}</div>;
    if (!page) return <div className="p-6 text-sm text-gray-500">未找到页面</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{page.title}</h1>
            {/* 简单渲染；若是 Markdown，请替换为你的 Markdown 预览组件 */}
            <div className="prose max-w-none whitespace-pre-wrap">{page.content ?? ''}</div>
        </div>
    );
}
