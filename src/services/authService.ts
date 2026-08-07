import { apiClient, formatApiError } from "../api";
import { components } from "../types";

type RegisterInput = components["schemas"]["RegisterInput"];
type LoginInput = components["schemas"]["LoginInput"];

export const authService = {
  register: async (input: RegisterInput) => {
    const { data, error } = await apiClient.POST("/auth/register", {
      body: input,
    });
    if (error) throw formatApiError(error, "Registration failed");
    return data;
  },
  login: async (input: LoginInput) => {
    const { data, error } = await apiClient.POST("/auth/login", {
      body: input,
    });
    if (error) throw formatApiError(error, "Login failed");
    return data;
  },
};

