export const Skeleton = ({ lines = 3 }: { lines?: number }) => (
    <div className="animate-pulse space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
        ))}
    </div>
)

export const Empty = ({ text = '空空如也' }: { text?: string }) => (
    <div className="text-gray-500 text-sm bg-gray-50 border border-dashed rounded-xl p-6">{text}</div>
)

export const ErrorBlock = ({ text }: { text: string }) => (
    <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">{text}</div>
)
