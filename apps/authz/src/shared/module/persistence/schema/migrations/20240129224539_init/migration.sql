-- CreateTable
CREATE TABLE "organization" (
    "uid" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "auth_credential" (
    "pub_key" TEXT NOT NULL PRIMARY KEY,
    "alg" TEXT NOT NULL,
    "user_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL
);
