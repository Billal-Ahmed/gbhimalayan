This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## PostgreSQL and product administration

The storefront uses the bundled catalog until `DATABASE_URL` is configured. Once connected, product listing, details, the homepage, and admin changes read from PostgreSQL.

1. Create a PostgreSQL database and copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL`, a private `ADMIN_PASSWORD`, and an `ADMIN_SESSION_SECRET` of at least 32 characters. Keep `.env.local` out of version control.
3. Run `pnpm db:seed` to create the tables and import any missing original catalog rows and local image paths. Re-running the seed preserves products already edited in the admin panel.
4. Start the site and open `/admin` to sign in and manage products.

Admin product operations are authenticated on the server and persist in PostgreSQL. The browser does not receive database credentials. If no database URL is configured, the public store remains viewable using the included catalog and the admin interface asks for database configuration.

## Image assets

- `public/images/products/` contains product photos, thumbnails, and the missing-image placeholder.
- `public/images/brand/` contains the active logo; `legacy/` holds older logo files kept for reference.
- `public/images/site/` contains service graphics and older site artwork.

Catalog product URLs use `/images/products/...`. Legacy `/catalog/...` image requests are redirected to the new product-image folder, and `pnpm db:seed` migrates those paths in an existing PostgreSQL database.
