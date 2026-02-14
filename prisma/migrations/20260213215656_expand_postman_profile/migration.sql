-- AlterTable
ALTER TABLE "Postman" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "businessSummary" TEXT,
ADD COLUMN     "communicationGifts" INTEGER DEFAULT 0,
ADD COLUMN     "communicationLetters" INTEGER DEFAULT 0,
ADD COLUMN     "communicationMeetings" INTEGER DEFAULT 0,
ADD COLUMN     "communicationSNS" INTEGER DEFAULT 0,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "goals" TEXT,
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "lifePurpose" TEXT,
ADD COLUMN     "meetingCount" INTEGER DEFAULT 0,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "strengths" TEXT;
