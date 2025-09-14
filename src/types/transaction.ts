export interface Transaction {
  id?: number;
  type: "deposit" | "withdraw";
  amount: number;
  description?: string;
  category?: string;
  created_at?: Date;
}
