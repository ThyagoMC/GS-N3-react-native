import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const result = await AsyncStorage.getItem('products');
      if (result) {
        const parsedProducts = JSON.parse(result);
        setProducts(parsedProducts);
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      let toAddProduct = products.find(p => p.id === product.id);
      if (toAddProduct) {
        toAddProduct.quantity += 1;
      } else {
        toAddProduct = product;
        toAddProduct.quantity = 1;
      }
      const filteredProducts = products.filter(p => p.id !== product.id);
      const newProducts = [...filteredProducts, toAddProduct];
      setProducts(newProducts);
      AsyncStorage.setItem('products', JSON.stringify(newProducts));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const toIncProduct = products.find(p => p.id === id);
      if (toIncProduct) {
        toIncProduct.quantity += 1;
      }
      setProducts([...products]);
      AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const toDecProduct = products.find(p => p.id === id);
      let currProducts = [...products];
      if (toDecProduct) {
        toDecProduct.quantity -= 1;
        if (!toDecProduct.quantity) {
          currProducts = products.filter(p => p.id !== toDecProduct.id);
        }
      }
      setProducts(currProducts);
      AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
