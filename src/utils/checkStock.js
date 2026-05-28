import api from "./api";

export async function checkAvailableStock(ownerId, itemId) {
  try {
    const resp = await api.get(`/inventory/stock/${itemId}`);
    return resp.data.quantity;
  } catch {
    return 0;
  }
}
