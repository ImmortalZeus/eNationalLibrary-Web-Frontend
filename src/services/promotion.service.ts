// src/services/promotion.service.ts
// Backend PromotionController: create/list/update/delete/activate/deactivate are
// guarded by JwtAuthGuard + RolesGuard(Admin); the admin token is attached by api.ts.
// NOTE: update is a PATCH (not PUT).
import api from "./api";
import type {
  PromotionPublicDto,
  CreatePromotionInput,
  UpdatePromotionInput,
} from "../types";

export const promotionService = {
  /** GET /promotions (admin) */
  async findAll(): Promise<PromotionPublicDto[]> {
    const { data } = await api.get<PromotionPublicDto[]>("/promotions");
    return data;
  },

  /** GET /promotions/active (public) */
  async findActive(): Promise<PromotionPublicDto[]> {
    const { data } = await api.get<PromotionPublicDto[]>("/promotions/active");
    return data;
  },

  async findById(id: string): Promise<PromotionPublicDto | null> {
    const { data } = await api.get<PromotionPublicDto | null>(`/promotions/${id}`);
    return data ?? null;
  },

  /** POST /promotions — returns new promotionId */
  async create(dto: CreatePromotionInput): Promise<string> {
    const { data } = await api.post<string>("/promotions", dto);
    return data;
  },

  /** PATCH /promotions/:id */
  async update(id: string, dto: UpdatePromotionInput): Promise<boolean> {
    const { data } = await api.patch<boolean>(`/promotions/${id}`, dto);
    return data;
  },

  /** DELETE /promotions/:id */
  async remove(id: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/promotions/${id}`);
    return data;
  },

  /** POST /promotions/:id/activate — also retroactively applies to matching cards */
  async activate(id: string): Promise<boolean> {
    const { data } = await api.post<boolean>(`/promotions/${id}/activate`);
    return data;
  },

  /** POST /promotions/:id/deactivate — reverts affected cards to default pricing */
  async deactivate(id: string): Promise<boolean> {
    const { data } = await api.post<boolean>(`/promotions/${id}/deactivate`);
    return data;
  },

  /** GET /promotions/:id/affected-cards — count of reading cards a promotion would touch */
  async affectedCards(id: string): Promise<number> {
    const { data } = await api.get<{ count: number }>(`/promotions/${id}/affected-cards`);
    return data.count;
  },
};
