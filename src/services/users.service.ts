import { api } from "./api";
import { CreateUserDto, UpdateUserDto, User } from "@/types/user";

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface GetUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export const usersService = {
  async getAll(params?: GetUsersParams) {
    const { data } = await api.get<GetUsersResponse>("/users", { params });
    return data;
  },

  async create(dto: CreateUserDto) {
    const { data } = await api.post<User>("/users/create", dto);
    return data;
  },

  async update(id: string, dto: UpdateUserDto) {
    const { data } = await api.patch<User>(`/users/${id}`, dto);
    return data;
  },

  async delete(id: string) {
    await api.delete(`/users/${id}`);
  },
};
