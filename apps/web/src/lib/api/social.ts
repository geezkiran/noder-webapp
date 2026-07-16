import { apiFetch } from "./client";

export function follow(targetType: "user" | "hierarchy", targetId: string) {
  return apiFetch<{ id: string }>("/follow", { method: "POST", body: { target_type: targetType, target_id: targetId } });
}

export function unfollow(targetType: "user" | "hierarchy", targetId: string) {
  return apiFetch<{ unfollowed: true }>("/follow", {
    method: "DELETE",
    body: { target_type: targetType, target_id: targetId },
  });
}
