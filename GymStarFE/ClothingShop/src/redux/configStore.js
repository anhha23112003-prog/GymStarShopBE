import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./cartSlice";
export const store = configureStore({
  reducer: {
    cart: cartSlice, // Gắn cartSlice với key "cart"
  },
});
