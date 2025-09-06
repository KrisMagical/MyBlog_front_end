export interface CommentDto {
    id: number
    name: string
    content: string
    createdAt: string
}

export interface PostDetailDto {
    id?: number
    title?: string
    content?: string
    slug?: string
    createdAt?: string
    updateAt?: string
    likeCount?: number
    dislikeCount?: number
    viewCount?: number
    categoryName?: string
    comments?: CommentDto[]
}

export interface User {
    id?: number
    username?: string
    password?: string
    role?: string
}

export interface LikeResponseDto {
    likes: number
    dislikes: number
    message: string
}

export interface CreateCommentRequest {
    name: string
    email: string
    content: string
}

export interface PostSummaryDto {
    id: number
    title: string
    slug: string
    excerpt?: string
    createdAt: string
    likeCount?: number
    dislikeCount?: number
    viewCount?: number
    categoryName?: string
}

export interface CategoryDto {
    id: number
    name: string
    slug: string
}

// ✅ 新增 PageDto
export interface PageDto {
    id?: number
    slug: string
    title: string
    content?: string
}
