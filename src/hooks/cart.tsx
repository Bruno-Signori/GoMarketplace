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
      const loadStoragedProducts = await AsyncStorage.getItem('@Gomarketplace:product',);

        if( loadStoragedProducts ) {
          setProducts([...JSON.parse(loadStoragedProducts)])
        }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productExists = products.find(CompareProduct => CompareProduct.id === product.id);

    if (productExists) {
      setProducts(
        // estou mapeando todos os produtos... ai se o produto comparado for igual a um que ja existe no carrinho apenas incremento a quantidade. caso nao exista ainda, adiciono ele ao carrinho
        products.map(CompareProduct => CompareProduct.id === product.id ? {...product, quantity: CompareProduct.quantity + 1 } : CompareProduct,),
        );
    } else {
      setProducts([...products, {...product, quantity: 1 }]);
    }

    await AsyncStorage.setItem(
      '@Gomarketplace:product',
      JSON.stringify(products),
      );
  }, [products]);


  const decrement = useCallback(async id => {
    const newProduct =  products.map(product => product.id === id ?
      {...product, quantity: product.quantity - 1, } : product,
      ).filter(CompareProduct => CompareProduct.quantity > 0) ;
      setProducts(newProduct);

      await AsyncStorage.setItem(
        '@Gomarketplace:product',
        JSON.stringify(newProduct),
        );

  }, [products]);

  const increment = useCallback(async id => {
    const newProduct =  products.map(product => product.id === id ?
      {...product, quantity: product.quantity + 1 } : product,
      );
      setProducts(newProduct);

      await AsyncStorage.setItem(
        '@Gomarketplace:product',
        JSON.stringify(newProduct),
        );

  }, [products]);


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
