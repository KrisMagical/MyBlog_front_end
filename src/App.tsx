import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import CategoryList from '@/pages/CategoryList'
import PostDetail from '@/pages/PostDetail'
import Consulting from '@/pages/Consulting'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import { getToken } from '@/services/auth'

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<CategoryList categorySlug="blog" />} />
                <Route path="/blog/:slug" element={<PostDetail />} />
                <Route path="/my-shares" element={<CategoryList categorySlug="my-shares" />} />
                <Route path="/my-shares/:slug" element={<PostDetail />} />
                <Route path="/creations" element={<CategoryList categorySlug="creations" />} />
                <Route path="/creations/:slug" element={<PostDetail />} />
                <Route path="/consulting" element={<Consulting />} />

                <Route path="/console/login" element={<Login />} />
                <Route
                    path="/console/dashboard"
                    element={getToken() ? <Dashboard /> : <Navigate to="/console/login" replace />}
                />
            </Routes>
        </Layout>
    )
}