CREATE TABLE "User" (
    lineId TEXT PRIMARY KEY NOT NULL,
    fullname TEXT NOT NULL,
    phone VARCHAR(10) UNIQUE NOT NULL,
    email TEXT,
    lineProfilePic TEXT,
    isTheOne BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    accPointsByBranchID INT ,
    accPoints DECIMAL DEFAULT 0,
    currentPoints DECIMAL DEFAULT 0,
    rights INT DEFAULT 0,
    "mostBranchId" TEXT,
    "mostBranchName" VARCHAR(255),
    "accRights" INTEGER DEFAULT 0;
);

CREATE TABLE "Branch" (
    "branchId" TEXT PRIMARY KEY,
    "branchName" TEXT UNIQUE NOT NULL,
    "isBranchEnable" BOOLEAN DEFAULT TRUE,
    "canVip" BOOLEAN DEFAULT TRUE,
    "vipPoint" DECIMAL DEFAULT 70000
);

CREATE TABLE "Store" (
    "storeId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeName" TEXT NOT NULL,
    "branchId" TEXT,
    "isStoreEnable" BOOLEAN DEFAULT TRUE,
    "canLuckydraw" BOOLEAN DEFAULT TRUE,
    "canBag" BOOLEAN DEFAULT TRUE
);

CREATE TABLE "Receipt" (
  "receiptId" SERIAL PRIMARY KEY UNIQUE,
  "receiptNo" VARCHAR,
  "receiptDate" TIMESTAMPTZ(6) NOT NULL,
  "lineId" TEXT UNIQUE NOT NULL,
  "branchId" TEXT,
  "storeId" UUID,
  "amount" DECIMAL NOT NULL,
  "receiptImage" VARCHAR NOT NULL,
  "status" VARCHAR NOT NULL DEFAULT 'pending',
  "receiptPoints" DECIMAL DEFAULT 0,
  "branchName" VARCHAR NOT NULL,
  "storeName" VARCHAR NOT NULL,
  "fullname" VARCHAR NOT NULL,
  "phone" VARCHAR NOT NULL,
  "updatedAt" TIMESTAMPTZ(6) DEFAULT now(),
  "uploadedAt" TIMESTAMPTZ(6) DEFAULT now(),
  "canBag" BOOLEAN DEFAULT TRUE,
  "canLuckydraw" BOOLEAN DEFAULT TRUE,
  "canVip" BOOLEAN DEFAULT TRUE
);

CREATE TABLE "accPointsByBranch" (
	"accPointsByBranchID" SERIAL PRIMARY KEY UNIQUE,
	"branchId" TEXT,
	"branchName" TEXT,
	"lineId" TEXT,
	"fullname" TEXT NOT NULL,
	"point" DECIMAL DEFAULT 0
)

CREATE TABLE "branchStock" (
"branchStockId" SERIAL PRIMARY KEY NOT NULL,
"branchId" TEXT,
"branchName" TEXT,
"isEnable" BOOLEAN DEFAULT TRUE,
"RedeemId" TEXT DEFAULT 1,
"amount" INT DEFAULT 0,
"gotRedeemded" INT DEFAULT 0
)

CREATE TABLE "Admin" (
    "adminId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "username" TEXT UNIQUE,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isEnable" BOOLEAN NOT NULL,
    "branchId" TEXT,
    "isMfa" BOOLEAN NOT NULL,
    "secretKey" TEXT
);

CREATE TABLE "AdminBranchHistory" (
    "branchStockHistoryId" SERIAL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "adminId" UUID NOT NULL,
    "redeemId" INT NOT NULL,
    "editDate" TIMESTAMPTZ(6) DEFAULT NOW(),
    "amount" DECIMAL NOT NULL,
    "updatedStatus" BOOLEAN NOT NULL,
    "isEnable" BOOLEAN NOT NULL,
    "username" VARCHAR(255)
);



-- drop table
DROP TABLE IF EXISTS "Branch";

--rename table
ALTER TABLE AdminBranchHistory RENAME TO NewTableName;

-- rename column
ALTER TABLE "Store"
RENAME COLUMN "canLuckydraw" TO "canLuckydraw";

-- add 1 row
INSERT INTO "accPointsByBranch" 
("branchId", "branchName", "lineId", "fullname", "point")
VALUES 
('R001', 'Centralworld', 'line1234', 'Fern mock', 55000.00);

-- add 1 column
ALTER TABLE "accPointsByBranch" ADD COLUMN "phone" VARCHAR(20);

-- join table with conditons
SELECT DISTINCT ON (apb."branchId", apb."lineId") apb.*
FROM "accPointsByBranch" apb
JOIN "Branch" b On apb."branchId" = b."branchId"
WHERE apb."point" >= b."vipPoint" AND b."isBranchEnable" = true AND b."canVip" = true
ORDER BY apb."branchId", apb."lineId", apb."point" DESC;

--change type to var
ALTER TABLE "AdminBranchHistory" 
ALTER COLUMN "redeemId" TYPE VARCHAR(255) USING "redeemId"::VARCHAR;

--add unique idetifyer (composite key?)
ALTER TABLE "branchStock" ADD CONSTRAINT unique_branch_redeem UNIQUE ("branchId", "redeemId");


--list column name
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'branchStock';

