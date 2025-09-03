// 全局可编辑设置的数据结构
export type SocialLink = {
    id: string;        // 唯一 ID
    label: string;     // 鼠标悬停文案 / 无障碍名称
    href: string;      // 跳转链接
    iconUrl: string;   // 图标 URL（SVG/PNG/JPG 等）
};

export type AppSettings = {
    site: {
        title: string;
        subtitle: string;
        avatarUrl?: string; // 站点头像（可选）
    };
    social: SocialLink[]; // 社交链接列表
};
