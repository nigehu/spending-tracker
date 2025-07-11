This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, setup your db by creating a .env file based off of the .env.sample.

Next, run the migrations:

```bash
bun prisma migrate dev
```

Next, run the development server:

```bash
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

# spending-tracker

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# Adding new UI components

This project uses [ShadCN](https://ui.shadcn.com/) for the component library.

Use the following command to install new components:

```
bun x shadcn@latest add <component>
```

# Testing

See https://github.com/Quramy/prisma-fabbrica?tab=readme-ov-file#usage-of-factories

See https://bun.sh/docs/test/mocks#hoisting-preloading

Prisma example with jest (doesn't work :( ) https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing

Example with vitest? https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o

# TODO

- [x] Complete the transaction form
  - [x] Save data to db
  - [x] Show data in list on save
- [x] Add Category Customization page
- [x] Add a way to edit:
  - [x] Transactions
  - [x] Categories
- [x] Add tests for:
  - [x] Transaction submission
  - [ ] Transaction editing
  - [ ] Transaction deleting
  - [ ] Category submission
  - [ ] Category editing
  - [ ] Category submission
- [x] Improve UI
  - [x] Fix the transaction item layout
  - [x] Add a more aesthetic way to add a transaction
  - [x] Add a more aesthetic way to add a category
- [x] Budget page (set budget for the month)
- [ ] Import page for CSVs
- [ ] Add a better guided UX for first time
  - [ ] Add a category from transaction form
  - [ ] Guide user towards transactions
- [ ] Add docker file
- [ ] Insights page (what can we see based on purchase)
- [ ] Labels for transactions (ie: for a trip, you can calculate how much money you spent)
