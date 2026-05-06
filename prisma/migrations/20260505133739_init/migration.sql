-- CreateEnum
CREATE TYPE "Level" AS ENUM ('L3', 'L4', 'L5');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- CreateTable
CREATE TABLE "Salary" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "location" TEXT NOT NULL,
    "experience_years" INTEGER NOT NULL,
    "base_salary" INTEGER NOT NULL,
    "bonus" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "total_compensation" INTEGER NOT NULL,
    "confidence_score" "Confidence" NOT NULL,
    "quality_score" DOUBLE PRECISION NOT NULL,
    "market_value_score" DOUBLE PRECISION,
    "market_score_computed_at" TIMESTAMP(3),
    "insufficient_data" BOOLEAN NOT NULL DEFAULT false,
    "peer_group_size" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
);
