export type MealOption = 'A' | 'B' | 'C' | 'D';

export interface Order {
  id: string;
  date: string;
  seat_number: number;
  meal_option: MealOption;
  created_at: string;
  updated_at: string;
}

export interface DailyMenu {
  date: string;
  option_a_enabled: boolean;
  option_b_enabled: boolean;
  option_c_enabled: boolean;
  option_d_enabled: boolean;
}

export interface OrderStats {
  countA: number;
  countB: number;
  countC: number;
  countD: number;
  totalCount: number;
  totalAmount: number;
}