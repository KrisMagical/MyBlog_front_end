import { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">{children}</main>
            </div>
        </div>
    )
}