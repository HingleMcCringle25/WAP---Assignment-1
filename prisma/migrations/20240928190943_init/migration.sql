-- CreateTable
CREATE TABLE "Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "atk" INTEGER,
    "def" INTEGER,
    "element" TEXT,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "monsterType" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_serialNumber_key" ON "Card"("serialNumber");
