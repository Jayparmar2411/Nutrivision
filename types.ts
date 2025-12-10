export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodAnalysis {
  foodName: string;
  calories: number;
  macros: Macros;
  ingredients: string[];
  healthTip: string;
  confidenceScore: number; // 0-100
}

export interface HistoryItem extends FoodAnalysis {
  id: string;
  timestamp: number;
  imageUrl?: string;
}

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  LOGIN = 'LOGIN'
}

export interface UserProfile {
  name: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
}