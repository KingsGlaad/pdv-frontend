export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "cashier" | "manager";
  createdAt: Date;
  updatedAt: Date;
}
