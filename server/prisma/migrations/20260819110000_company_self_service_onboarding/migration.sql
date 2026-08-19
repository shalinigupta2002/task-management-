-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('CHECKOUT_CREATED', 'PAYMENT_PENDING', 'PAYMENT_FAILED', 'PAYMENT_SUCCESS', 'ONBOARDING_PENDING', 'ONBOARDING_COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "company_subscriptions" ADD COLUMN     "amount_paid" DECIMAL(12,2),
ADD COLUMN     "billing_cycle" "BillingCycle",
ADD COLUMN     "currency" VARCHAR(10) DEFAULT 'INR',
ADD COLUMN     "onboarding_id" UUID,
ADD COLUMN     "payment_reference" VARCHAR(150);

-- CreateTable
CREATE TABLE "company_onboardings" (
    "id" UUID NOT NULL,
    "reference_code" VARCHAR(64) NOT NULL,
    "session_token_hash" VARCHAR(255) NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'CHECKOUT_CREATED',
    "subscription_plan_id" UUID NOT NULL,
    "billing_cycle" "BillingCycle" NOT NULL,
    "amount_in_paise" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "payment_provider" VARCHAR(50) NOT NULL DEFAULT 'INTERNAL',
    "payment_order_id" VARCHAR(100),
    "payment_payment_id" VARCHAR(100),
    "payment_signature" VARCHAR(255),
    "paid_at" TIMESTAMP(3),
    "company_id" UUID,
    "contact_email" VARCHAR(255),
    "metadata" JSONB,
    "expires_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_onboardings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_onboardings_reference_code_key" ON "company_onboardings"("reference_code");

-- CreateIndex
CREATE UNIQUE INDEX "company_onboardings_payment_order_id_key" ON "company_onboardings"("payment_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_onboardings_company_id_key" ON "company_onboardings"("company_id");

-- CreateIndex
CREATE INDEX "company_onboardings_status_idx" ON "company_onboardings"("status");

-- CreateIndex
CREATE INDEX "company_onboardings_subscription_plan_id_idx" ON "company_onboardings"("subscription_plan_id");

-- CreateIndex
CREATE INDEX "company_onboardings_payment_order_id_idx" ON "company_onboardings"("payment_order_id");

-- CreateIndex
CREATE INDEX "company_onboardings_expires_at_idx" ON "company_onboardings"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "company_subscriptions_onboarding_id_key" ON "company_subscriptions"("onboarding_id");

-- AddForeignKey
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_onboarding_id_fkey" FOREIGN KEY ("onboarding_id") REFERENCES "company_onboardings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_onboardings" ADD CONSTRAINT "company_onboardings_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_onboardings" ADD CONSTRAINT "company_onboardings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
