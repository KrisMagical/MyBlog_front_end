export type SocialLink = {
    id: string;
    label: string;
    href: string;
    iconUrl: string;
};

export type AppSettings = {
    site: {
        title: string;
        subtitle: string;
        avatarUrl?: string;
    };
    social: SocialLink[];
};
