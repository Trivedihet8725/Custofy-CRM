import api from "./api";

export async function updateInventory({
  ownerId,
  itemId,
  itemName,
  unit,
  change,
  reason,
  refId = null,
}) {
  if (!ownerId || !itemId) {
    throw new Error("Missing ownerId or itemId");
  }

  await api.post("/inventory/update", {
    itemId,
    itemName,
    unit,
    change,
    reason,
    refId: refId || "",
  });
}
