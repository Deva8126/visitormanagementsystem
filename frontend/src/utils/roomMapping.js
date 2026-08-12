export const ROOM_MAPPING = {
  "Officers / Official Visitors": {
    "CGST GHAZIABAD": {
      "CENTRAL DIARY AND DISPATCH": "006",
      "GST SUVIDHA KENDRA": "007",
      "RETIRESD OFFICERS ROOM": "012",
      "COMMISSIONER": "201",
      "ADDITIONAL/JOINT COMMISSIONER (ROOM 202)": "202",
      "ADDITIONAL/JOINT COMMISSIONER (ROOM 203)": "203",
      "ADDITIONAL/JOIN COMMISSIONER": "208",
      "DY./ASST.COMMISSIONER, DIVISION-I": "309",
      "DY./ASST.COMMISSIONER, DIVISION-II": "308",
      "DY./ASST.COMMISSIONER, DIVISION-III": "409",
      "DY./ASST.COMMISSIONER, DIVISION-IV": "405",
      "DY./ASST.COMMISSIONER, DIVISION-V": "410",
      "DY./ASST.COMMISSIONER, DIVISION-VI": "511",
      "DY./ASST.COMMISSIONER, DIVISION-VII": "612",
      "Library": "108",
      "RANGES OF DIVISION-I": "313",
      "RANGES OF DIVISION-II": "307",
      "RANGES OF DIVISION-III": "407",
      "RANGES OF DIVISION-IV": "401",
      "RANGES OF DIVISION-V": "413",
      "RANGES OF DIVISION-VI": "517",
      "RANGE-31, 32 OF DIVISION-VII": "615",
      "RANGE- 33, 34, 35 OF DIVISION-VII": "618",
      "ANTI- EVASION": "301",
      "SUPERINTENDENT ADJUDICATION": "411",
      "SUPERINTENDENT HEADQUARTER": "009",
      "SUPERINTENDENT INFRA-BUILDING": "009",
      "SUPERINTENDENT ACCOUNTS": "210",
      "SUPERINTENDENT ADMINISTRATION": "210",
      "Other": ""
    },
    "CCO, MEERUT ZONE MEERUT (CAMP OFFICE)": {
      "CHIEF COMMISSIONER (HAG+)": "101",
      "ADDITIONAL/JOINT COMMISSIONER": "107",
      "DY./ASSTT. COMMISSIONER": "106",
      "SECRETERIATE (CCO)": "102",
      "Other": ""
    },
    "CGST AUDIT (MEERUT) CIRCLE GHAZIABAD": {
      "COMMISSIONER": "501",
      "ADDITIONAL/JOINT COMMISSIONER": "502",
      "DY./ASST.COMMISSIONER": "503",
      "DY./ASST.COMMISSIONER, CIRCLE-4": "508",
      "DY./ASST.COMMISSIONER, CIRCLE-5": "509",
      "DY./ASST.COMMISSIONER, CIRCLE-6": "608",
      "SUPERINTENDENT AUDIT CIRCLE- 4, 5, 6, 7": "510",
      "Other": ""
    },
    "COMMISSIONER APPEALS (CAMP OFFICE)": {
      "COMMISSIONER": "601",
      "ADDITIONAL/JOINT COMMISSIONER": "602",
      "DY./ASST.COMMISSIONER": "603",
      "SUPERINTENDENT/INSPECTOR": "610",
      "Other": ""
    },
    "PAY & ACCOUNT OFFICE GHAZIABAD": {
      "PAO": "512",
      "AAO/AD(OL)": "513",
      "TAX ASSIATANT": "514",
      "Other": ""
    }
  },
  "Other Than Official": {
    "CPWD": { "Other": "" },
    "CONTRACTOR (housekeeping/security)": { "Other": "" },
    "MAINTENANCE (CGST BHAWAN)": { "Other": "" },
    "Other": { "Other": "" }
  }
};

export function getRoomNumber(purposeType, purposeCategory, purposeSubcategory) {
  if (!purposeType || !purposeCategory || !purposeSubcategory) return '';
  return ROOM_MAPPING[purposeType]?.[purposeCategory]?.[purposeSubcategory] || '';
}
