-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FINANCE', 'HOST', 'HR', 'RECRUITER', 'SUPER_ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "IdentityType" AS ENUM ('BVN', 'DRIVER_LICENSE', 'INTERNATIONAL_PASSPORT', 'NIN', 'VOTERS_CARD');

-- CreateEnum
CREATE TYPE "DocumentVerificationStatus" AS ENUM ('FAILED', 'NOT_APPLICABLE', 'NOT_VERIFIED', 'PASSED');

-- CreateEnum
CREATE TYPE "CurrencyEnum" AS ENUM ('NGN', 'USD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "password" VARCHAR(60) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'INACTIVE',
    "otp" INTEGER,
    "otpExpiresIn" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "otherName" TEXT,
    "avatar" TEXT,
    "dob" TEXT,
    "identityType" "IdentityType",
    "idNumber" VARCHAR(15),
    "status" "UserStatus" NOT NULL DEFAULT 'INACTIVE',
    "address" TEXT,
    "lga" TEXT,
    "postalCode" VARCHAR(10),
    "state" TEXT,
    "country" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_username_email_phone_idx" ON "User"("username", "email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
