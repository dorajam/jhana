-- Give User.displayName a default so the Auth.js Prisma adapter's createUser
-- (which only supplies name/email/image/emailVerified) can insert a row.
-- The createUser event then overwrites it with the provider's name.
ALTER TABLE "User" ALTER COLUMN "displayName" SET DEFAULT 'Meditator';
