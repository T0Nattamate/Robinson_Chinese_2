export const premiumReward = [
  {
    rewardId: 1,
    premiumTypeId: 1,
    rewardName: "Travel Bag",
  },
  {
    rewardId: 2,
    premiumTypeId: 1,
    rewardName: "Beach Towel",
  },
];

export const pageSizeChoice = [10, 25, 50, 100];

export const status = [
  {
    key: "approved",
    thStatus: "ถูกต้อง",
    enStatus: "Approved",
  },
  {
    key: "pending",
    thStatus: "รอตรวจสอบ",
    enStatus: "Under review",
  },
  {
    key: "rejected",
    thStatus: "เลขที่ใบเสร็จผิด",
    enStatus: "Incorrect receipt number",
  },
  {
    key: "invalidImage",
    thStatus: "ภาพไม่ชัด / ภาพไม่ถูกต้อง",
    enStatus: "Invalid image",
  },
  {
    key: "amountDontMatch",
    thStatus: "ยอดซื้อไม่ตรงกับใบเสร็จ",
    enStatus: "Amount entered and upload don't match",
  },
  {
    key: "breakRules",
    thStatus: "ยอดสั่งซื้อไม่ตรงตามเงื่อนไข",
    enStatus: "Purchase amount is insufficient.",
  },
  {
    key: "duplicated",
    thStatus: "ใบเสร็จซ้ำกับใบที่อนุมัติแล้ว",
    enStatus: "This receipt has already approved.",
  },

];

export const categories = [
  "ศูนย์การค้า",
  "บริการความงามและคลินิก",
  "บริการด้านการศึกษา",
  "บริการด้านความบันเทิง",
  "แฟชั่น",
  "บริการด้านการเงิน",
  "บริการทั่วไป",
  "อาหารว่าง",
  "ร้านอาหาร",
  "ร้านค้าพิเศษ",
  "เทคโนโลยี",
];
