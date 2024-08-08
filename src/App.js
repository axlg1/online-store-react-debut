// App.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from 'react-router-dom';
import './App.css';

// Contexte global pour le panier
const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    window.alert("Article ajouté au panier"); // Affichage du message de confirmation
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const history = useHistory();

  useEffect(() => {
    axios.get('https://fakestoreapi.com/products')
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));

    axios.get('https://fakestoreapi.com/products/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.log(err));
  }, []);

  const sortProducts = (order) => {
    const sortedProducts = [...products].sort((a, b) => {
      return order === 'asc' ? a.price - b.price : b.price - a.price;
    });
    setProducts(sortedProducts);
  };

  useEffect(() => {
    sortProducts(sortOrder);
  }, [sortOrder]);

  const filterByCategory = (category) => {
    axios.get(`https://fakestoreapi.com/products/category/${category}`)
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  };

  return (
    <div className="ProductList">
      <h2>Product List</h2>
      <div className="filters">
        <label>Sort by price: </label>
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
        <label>Filter by category: </label>
        <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
          <option value="">All</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <button onClick={() => filterByCategory(selectedCategory)}>Filter</button>
      </div>
      <div className="products">
        {products.map(product => (
          <Link key={product.id} to={`/product/${product.id}`} className="product">
            <img src={product.image} alt={product.title} />
            <h3>{product.title}</h3>
            <p>${product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const ProductDetails = ({ match }) => {
  const [product, setProduct] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { id } = match.params;
  const history = useHistory();

  useEffect(() => {
    axios.get(`https://fakestoreapi.com/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="ProductDetails">
      <img src={product.image} alt={product.title} />
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>${product.price}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
      <button onClick={() => history.goBack()}>Back to Product List</button>
    </div>
  );
};

const Cart = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);

  return (
    <div className="Cart">
      <h2>Cart</h2>
      {cartItems.length === 0 ? <p>No items in cart</p> : (
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.title} />
              <h3>{item.title}</h3>
              <p>${item.price}</p>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="App">
          <Switch>
            <Route path="/" exact component={ProductList} />
            <Route path="/product/:id" component={ProductDetails} />
            <Route path="/cart" component={Cart} />
          </Switch>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
