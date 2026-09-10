import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { donHangService } from "../services/donHang.service";

// Async thunk để lấy danh sách sản phẩm từ API
export const fetchCartProducts = createAsyncThunk(
  "cart/fetchCartProducts",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await donHangService.getProductsByCart(userId, token);
      return response.data.data?.products || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

const initialState = {
  cartItems: [],
  status: "idle", // Trạng thái: idle, loading, succeeded, failed
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const itemIndex = state.cartItems.findIndex(
        (item) => item.product_id === action.payload.product_id
      );
      if (itemIndex >= 0) {
        state.cartItems[itemIndex].quantity += 1;
      } else {
        const tempProduct = { ...action.payload, quantity: 1 };
        state.cartItems.push(tempProduct);
      }
    },
    removeFromCart: (state, action) => {
      const nextCartItems = state.cartItems.filter(
        (cartItem) => cartItem.product_id !== action.payload.id
      );
      state.cartItems = nextCartItems;
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCartProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cartItems = action.payload.map((item) => ({
          ...item,
          quantity: item.quantity || 1, // Đảm bảo mỗi item có quantity
        }));
      })
      .addCase(fetchCartProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// Export các action
export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
