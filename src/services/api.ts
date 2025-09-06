import axios from 'axios';
import type {
    CategoryDto,
    CommentDto,
    CreateCommentRequest,
    LikeResponseDto,
    PostDetailDto,
    PostSummaryDto,
    PageDto, // 从 types 引入
} from '@/types/dtos';
import { getToken } from './auth';

// ✅ 兼容旧用法：允许从 "@/services/api" 直接导入 PageDto
export type { PageDto } from '@/types/dtos';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080' });

// 自动加上 Authorization
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ---------- Categories ----------
export async function getAllCategories(): Promise<CategoryDto[]> {
    const { data } = await api.get('/api/categories');
    return data;
}
export async function createCategory(body: CategoryDto): Promise<CategoryDto> {
    const { data } = await api.post('/api/categories', { name: body.name, slug: body.slug });
    return data;
}
export async function updateCategory(id: number, body: CategoryDto): Promise<CategoryDto> {
    const { data } = await api.put(`/api/categories/${id}`, { name: body.name, slug: body.slug });
    return data;
}

// ---------- Posts ----------
export async function getPostsByCategory(slug: string): Promise<PostSummaryDto[]> {
    const { data } = await api.get(`/api/posts/category/${encodeURIComponent(slug)}`);
    return data;
}
export async function getPostDetail(slug: string): Promise<PostDetailDto> {
    const { data } = await api.get(`/api/posts/${encodeURIComponent(slug)}`);
    return data;
}
export async function getLikeAndDislikeCount(slug: string): Promise<LikeResponseDto> {
    const { data } = await api.get(`/api/posts/${encodeURIComponent(slug)}/likes`);
    return data;
}
export async function postLike(postId: number, positive: boolean): Promise<LikeResponseDto> {
    const { data } = await api.post(`/api/posts/${postId}/like`, null, { params: { positive } });
    return data;
}

// ---------- Comments（匿名） ----------
export async function getComments(postId: number): Promise<CommentDto[]> {
    const { data } = await api.get(`/api/comments/post/${postId}`, {
        headers: { Authorization: '' },
    });
    return data;
}
export async function addComment(postId: number, body: CreateCommentRequest): Promise<CommentDto> {
    const { data } = await api.post(`/api/comments/post/${postId}`, body, {
        headers: { Authorization: '' },
    });
    return data;
}
export async function deleteComment(commentId: number, email: string): Promise<CommentDto> {
    const { data } = await api.delete(`/api/comments/${commentId}`, {
        params: { email },
        headers: { Authorization: '' },
    });
    return data;
}

// ---------- Auth ----------
export async function login(username: string, password: string): Promise<string> {
    const { data } = await api.post('/login', { username, password });
    return data;
}

// ---------- Create / Update Posts ----------
export async function createPost(body: Partial<PostDetailDto>, categorySlug: string): Promise<PostDetailDto> {
    const { data } = await api.post(`/api/posts/create`, body, { params: { categorySlug } });
    return data;
}

// ⚠ 与 OpenAPI 对齐：/api/posts/create-md 的 slug/title 在 query 上
export async function createPostFromMd(
    file: File,
    categorySlug: string,
    slug: string,
    title?: string
): Promise<PostDetailDto> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/api/posts/create-md`, fd, {
        params: { categorySlug, slug, title },
    });
    return data;
}

export async function updatePost(id: number, body: Partial<PostDetailDto>, categorySlug?: string): Promise<PostDetailDto> {
    const { data } = await api.put(`/api/posts/update/${id}`, body, { params: { categorySlug } });
    return data;
}
export async function updatePostFromMd(id: number, file: File, categorySlug?: string): Promise<PostDetailDto> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.put(`/api/posts/update-md/${id}`, fd, { params: { categorySlug } });
    return data;
}

// ---------- Uploads ----------
export async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/api/posts/upload/image`, fd);
    return data;
}
export async function uploadVideo(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/api/posts/upload/video`, fd);
    return data;
}
export async function deletePostBySlug(slug: string): Promise<string> {
    const { data } = await api.delete(`/api/posts/${encodeURIComponent(slug)}`);
    return data as string;
}

// ========== Pages ==========
export async function getPageBySlug(slug: string): Promise<PageDto> {
    const { data } = await api.get(`/api/pages/${encodeURIComponent(slug)}`, {
        headers: { Authorization: '' }, // 公共 GET：不带 token，避免 401
    });
    return data;
}

// ✅ 新增：列出全部页面（用于 Sidebar 动态渲染）
export async function getAllPages(): Promise<PageDto[]> {
    const { data } = await api.get('/api/pages', {
        headers: { Authorization: '' }, // 公共 GET
    });
    return data;
}

export async function createPage(body: Partial<PageDto>): Promise<PageDto> {
    // body 需至少包含 slug, title（content 可选）
    const { data } = await api.post(`/api/pages`, body);
    return data;
}
export async function updatePageBySlug(slug: string, body: Partial<PageDto>): Promise<PageDto> {
    const { data } = await api.put(`/api/pages/${encodeURIComponent(slug)}`, body);
    return data;
}
export async function deletePageBySlug(slug: string): Promise<string> {
    const { data } = await api.delete(`/api/pages/${encodeURIComponent(slug)}`);
    return data as string;
}
export async function createPageFromMd(file: File, slug: string, title?: string): Promise<PageDto> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/api/pages/create-md`, fd, {
        params: { slug, title },
    });
    return data;
}
export async function updatePageFromMdBySlug(slug: string, file: File): Promise<PageDto> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.put(`/api/pages/update-md/${encodeURIComponent(slug)}`, fd);
    return data;
}
