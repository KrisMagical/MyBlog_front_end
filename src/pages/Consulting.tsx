// Consulting.tsx
import { useEffect, useState } from "react";
import { getPageBySlug } from "@/services/api";

export default function Consulting() {
    const [exists, setExists] = useState<boolean | null>(null);

    useEffect(() => {
        getPageBySlug("consulting")
            .then(() => setExists(true))
            .catch(() => setExists(false));
    }, []);

    if (exists === null) {
        return <div className="text-sm text-gray-500">加载中…</div>;
    }
    if (exists === false) {
        // 后端无该 Page：你也可以在这里改成 navigate('/404')
        return (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-700">
                页面未在后台登记（slug: <code>consulting</code>），当前显示静态内容。
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-3">咨询空间</h1>
            <p className="text-gray-600 mb-6">提供技术咨询、系统设计、代码评审、AI 赋能等服务。欢迎通过左下角社交渠道与邮箱联系。</p>
            <ul className="list-disc list-inside space-y-2">
                <li>后端：Spring / Spring Security / JPA / MySQL</li>
                <li>前端：React / TailwindCSS / Vite</li>
                <li>AI & LLM：应用集成、插件、Agent、检索增强</li>
            </ul>
        </div>
    );
}
