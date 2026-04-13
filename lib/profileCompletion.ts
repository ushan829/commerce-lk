export interface ProfileData {
  name?: string;
  isVerified?: boolean;
  phone?: string;
  school?: string;
  district?: string;
  medium?: string;
  alYear?: number;
  profilePicture?: string;
  stream?: string;
  gender?: string;
  dateOfBirth?: Date | string;
}

export interface CompletionResult {
  percentage: number;
  message: string;
  breakdown: { key: keyof ProfileData; label: string; weight: number; filled: boolean }[];
}

const FIELDS: { key: keyof ProfileData; label: string; weight: number }[] = [
  { key: "name", label: "Full Name", weight: 10 },
  { key: "isVerified", label: "Email Verification", weight: 15 },
  { key: "phone", label: "Phone Number", weight: 10 },
  { key: "school", label: "School Name", weight: 10 },
  { key: "district", label: "District", weight: 10 },
  { key: "medium", label: "Medium", weight: 10 },
  { key: "alYear", label: "A/L Year", weight: 10 },
  { key: "profilePicture", label: "Profile Picture", weight: 10 },
  { key: "stream", label: "Subject Stream", weight: 10 },
  { key: "gender", label: "Gender", weight: 5 },
  { key: "dateOfBirth", label: "Date of Birth", weight: 5 },
];

export function calculateProfileCompletion(profile: ProfileData): CompletionResult {
  let score = 0;
  const breakdown = FIELDS.map((field) => {
    const filled = field.key === "isVerified" 
      ? Boolean(profile.isVerified)
      : Boolean(profile[field.key]);
    
    if (filled) score += field.weight;
    return { ...field, filled };
  });

  const percentage = Math.min(score, 100);

  let message: string;
  if (percentage <= 30) message = "Get started — complete your profile!";
  else if (percentage <= 60) message = "Good progress! Add more details";
  else if (percentage <= 90) message = "Almost there!";
  else message = "Profile complete! 🎉";

  return { percentage, message, breakdown };
}

export const SL_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

export const AL_STREAMS = [
  "Accounting, Business Studies, Economics",
  "Accounting, Business Studies, Business Mathematics",
  "Accounting, Business Studies, Information Technology",
  "Accounting, Economics, Business Mathematics",
  "Business Studies, Economics, Business Mathematics",
  "Business Studies, Economics, Information Technology",
];
