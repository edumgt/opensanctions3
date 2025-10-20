export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const ALLOW_UNAUTHENTICATED = process.env.ZAVOD_ALLOW_UNAUTHENTICATED === 'false';
export const IAP_AUDIENCE = process.env.ZAVOD_IAP_AUDIENCE;
// export const DATABASE_URI = 'postgresql://postgres:password@localhost:5432/dev';
export const DATABASE_URI = 'postgresql://postgres:password@sa.edumgt.co.kr:5432/dev';
export const OPENSANCTIONS_WEBSITE_BASE_URL = process.env.ZAVOD_WEB_SITE || 'https://www.opensanctions.org';