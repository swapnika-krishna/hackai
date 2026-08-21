export interface CampusBlockConfig {
  name: string;
  code: string;
  totalFloors: number;
  floors: string[];
}

export const CAMPUS_BLOCKS: Record<string, CampusBlockConfig> = {
  'A Block': {
    name: 'A Block',
    code: 'A',
    totalFloors: 5,
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
  },
  'H Block': {
    name: 'H Block',
    code: 'H',
    totalFloors: 4,
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
  },
  'N Block': {
    name: 'N Block',
    code: 'N',
    totalFloors: 6,
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'],
  },
  'U Block': {
    name: 'U Block',
    code: 'U',
    totalFloors: 4,
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
  },
  'P Block': {
    name: 'P Block',
    code: 'P',
    totalFloors: 3,
    floors: ['Ground Floor', '1st Floor', '2nd Floor'],
  },
};

export const CAMPUS_BLOCK_LIST = Object.keys(CAMPUS_BLOCKS);

export interface CampusDepartmentOption {
  code: string;
  name: string;
  category: 'engineering' | 'management' | 'computer_applications' | 'sciences' | 'other';
}

export const CAMPUS_DEPARTMENTS_AND_DEGREES = [
  'Computer Science & Engineering (CSE)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (MECH)',
  'Bachelor of Business Administration (BBA)',
  'Master of Business Administration (MBA)',
  'Civil Engineering (CIVIL)',
  'Information Technology (IT)',
  'Artificial Intelligence & Data Science (AI & DS)',
  'Bachelor of Commerce (B.Com)',
  'Bachelor of Computer Applications (BCA)',
  'Master of Computer Applications (MCA)',
  'Biotechnology Engineering',
  'Chemical Engineering',
  'Sciences & Humanities',
  'Campus Administration',
] as const;
