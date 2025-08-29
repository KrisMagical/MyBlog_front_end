// CHANGE: API 客户端与 OpenAPI v0.0.1 对齐（分类更新用 PUT；post create/update 带 categorySlug）
import axios from 'axios';
import type {
    CategoryDto,
    CommentDto,
    CreateCommentRequest,
    LikeResponseDto,
    PostDetailDto,
    PostSummaryDto,
} from '@/types/dtos';
import { getToken } from './auth';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080' });
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Categories
export async function getAllCategories(): Promise<CategoryDto[]> {
    const { data } = await api.get('/api/categories');
    return data;
}

export async function createCategory(body: CategoryDto): Promise<CategoryDto> {
    // CHANGE: 后端用 CategoryDto 作为请求体，我们仅发 name/slug（若 body.id 存在后端应忽略）
    const { data } = await api.post('/api/categories', { name: body.name, slug: body.slug });
    return data;
}

export async function updateCategory(id: number, body: CategoryDto): Promise<CategoryDto> {
    // CHANGE: 与 OpenAPI 对齐：PUT /api/categories/{id}
    const { data } = await api.put(`/api/categories/${id}`, { name: body.name, slug: body.slug });
    return data;
}

// Posts
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

// Comments
export async function getComments(postId: number): Promise<CommentDto[]> {
    const { data } = await api.get(`/api/comments/post/${postId}`);
    return data;
}
export async function addComment(postId: number, body: CreateCommentRequest): Promise<CommentDto> {
    const { data } = await api.post(`/api/comments/post/${postId}`, body);
    return data;
}
export async function deleteComment(commentId: number, email: string): Promise<CommentDto> {
    const { data } = await api.delete(`/api/comments/${commentId}`, { params: { email } });
    return data;
}

// Auth
export async function login(username: string, password: string): Promise<string> {
    const { data } = await api.post('/login', { username, password });
    return data;
}

// Create / Update Posts
export async function createPost(body: Partial<PostDetailDto>, categorySlug: string): Promise<PostDetailDto> {
    const { data } = await api.post(`/api/posts/create`, body, { params: { categorySlug } });
    return data;
}

export async function createPostFromMd(file: File, categorySlug: string): Promise<PostDetailDto> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/api/posts/create-md`, fd, {
        params: { categorySlug },
        headers: { 'Content-Type': 'multipart/form-data' },
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
    const { data } = await api.put(`/api/posts/update-md/${id}`, fd, {
        params: { categorySlug },
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}

// Uploads (后端若采用 multipart, 这里按 multipart 发送)
export async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/api/posts/upload/image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}
export async function uploadVideo(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/api/posts/upload/video`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}
