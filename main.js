// Selectors:
const cartBtn = document.querySelector('.cart-icon'),
  cart = document.querySelector('.cart'),
  closeBtn = cart.querySelector('.close-icon'),
  cartItems = cart.querySelector('.cart-items'),
  cartLength = cartBtn.querySelector('span'),
  totalPrice = cart.querySelector('.cart-footer span'),
  clearCartBtn = cart.querySelector('.cart-footer button'),
  productsContainer = document.querySelector('.products .container'),
  modal = document.querySelector('.modal-content');

// ##### Global Variables #####
//? prefix => To avoid conflict with other localStorage items
const prefix = "VALINTECA_TASK-";
let products = JSON.parse(localStorage.getItem(`${prefix}products`)),
  cartProducts = JSON.parse(localStorage.getItem(`${prefix}cart`)) || [];

// #### Events ####
document.addEventListener('DOMContentLoaded', async () => {
  if (!products) products = await fetchProducts();
  renderProducts(products);
  cartProducts.forEach((product) => renderCart(product));
  cartLength.innerText = cartProducts.length;
});

cartBtn.addEventListener('click', () => {
  cart.classList.contains('show') ? cart.classList.remove('show') : cart.classList.add('show');
});

clearCartBtn.addEventListener('click', clearCart);
// To close modal
document.addEventListener('click', (e) => e.target.parentElement.classList.remove('show'));

// ##### Functions #####
// Fetch data from json file
async function fetchProducts() {
  res = await fetch('./products.json');
  data = await res.json();

  // error handling
  try {
    return data.products;
  } catch (err) {
    console.log(err);
  }
}
// Save & Render all products
function renderProducts(products) {
  localStorage.setItem(`${prefix}products`, JSON.stringify(products));

  products.forEach(({ id, title, price, image, inCart }) => {
    productsContainer.innerHTML += `
      <div class="product-item" data-id=${id}>
            <div class="image">
                <img src="${image}" class="product-overlay" />
            </div>
            <div class="info">
                <h3>${title}</h3>
                <span class="price">${price}</span>
            </div>
            <div class='actions'>
              <button onclick="ToggleHandler(${id})" class="add-btn">${inCart ? "Remove from Cart" : "Add to Cart"}</button>
              <button onclick="renderModal(${id})" class="view-btn">View</button>
            </div>
        </div>`;
  });
}

function ToggleHandler(productId) {
  const selectedProduct = products.find(product => product.id == productId);
  selectedProduct.inCart ? removeFromCart(productId) : addToCart(selectedProduct);
}

// Add to cart
function addToCart(prodcut) {
  // update product state (inCart: true)
  prodcut.inCart = true;
  localStorage.setItem(`${prefix}products`, JSON.stringify(products));

  // Add to localStorage
  const cartItem = {
    ...prodcut,
    quantity: 1,
  };
  cartProducts.push(cartItem);
  localStorage.setItem(`${prefix}cart`, JSON.stringify(cartProducts));

  // Update Screen
  cartLength.innerText = cartProducts.length;
  renderCart(cartItem);
  setPrice();

  // Update btn (get the selected btn bassed on data-*attribute)
  productsContainer.querySelector(`[data-id="${prodcut.id}"] .add-btn`).textContent = "remove from cart";
}

// Remove from cart
function removeFromCart(prodcutId) {
  // update product state (inCart: false)
  const selectedProduct = products.find(product => product.id == prodcutId);
  selectedProduct.inCart = false;
  localStorage.setItem(`${prefix}products`, JSON.stringify(products));

  // remove from localStorage
  cartProducts = cartProducts.filter(itm => itm.id != prodcutId);
  localStorage.setItem(`${prefix}cart`, JSON.stringify(cartProducts));

  // remove from screen 
  cartItems.querySelector(`[data-id="${prodcutId}"]`).remove();
  cartLength.innerText = cartProducts.length;
  setPrice();

  // update btn (get the selected btn bassed on data-*attribute)
  productsContainer.querySelector(`[data-id="${prodcutId}"] .add-btn`).textContent = "Add to cart";
}

// Clear cart
function clearCart() {
  // update all products state (inCart: false)
  products = products.map((product) => {
    return { ...product, inCart: false };
  });
  localStorage.setItem(`${prefix}products`, JSON.stringify(products));

  // clear localStorage
  cartProducts = [];
  localStorage.setItem(`${prefix}cart`, JSON.stringify(cartProducts));

  // clear UI
  cartItems.innerHTML = '';
  cartLength.innerText = cartProducts.length;

  // update total price
  setPrice();

  // update btn (get the selected btn based on data attribute)
  productsContainer.querySelectorAll('.add-btn').forEach(btn => btn.textContent = "Add to cart");
}

// Render cart items
function renderCart(product) {
  let { id, image, title, price, quantity } = product;
  cartItems.innerHTML += `
    <li class="cart-item" data-id=${id} >
        <div class="image">
            <img src="${image}" />
        </div>
        <div class="info">
            <h4>${title}</h4>
            <h5>${price}</h5>
            <button onclick="removeFromCart(${id})">remove</button>
        </div>
        <div class="quantity">
            <svg onClick="changeQuantity('increment', ${id})" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path></svg>
            <span>${quantity}</span>
            <svg onClick="changeQuantity('decrement', ${id})" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path></svg>            <i class="fas fa-chevron-down" onclick="changeQuantity('decrement', this.id)" id=${id}></i>
        </div>
    </li>`;

  setPrice();
}

// change quantity
function changeQuantity(action, prodcutId) {
  const selectedProduct = cartProducts.find((product) => product.id == prodcutId);
  if (action == "decrement" && selectedProduct.quantity > 1) {
    selectedProduct.quantity--;
  } else if (action == "increment") {
    selectedProduct.quantity++;
  }
  // update localStorage
  localStorage.setItem(`${prefix}cart`, JSON.stringify(cartProducts));

  // update screen
  cartItems.innerHTML = '';
  cartProducts.forEach((product) => renderCart(product));
}
// set total price
function setPrice() {
  let total = cartProducts.reduce((sum, product) => {
    return sum + (product.price * product.quantity);
  }, 0);
  totalPrice.innerText = total.toFixed(2);
}

// modal
function renderModal(productId) {
  const selectedProduct = products.find((product) => product.id == productId);
  const { id, image, desc, title, price, inCart } = selectedProduct;
  modal.innerHTML = `
    <div class="left"><img src="${image}" alt="product-img" /></div>
    <div class="right">
      <h3>${title}</h3>
      <span class="price">${price}</span>
      <p>${desc}</p>
      <button onclick="ToggleHandler(${id}, this)">${inCart ? "Remove from Cart" : "Add to Cart"}</button>
    </div>
  `;
  modal.parentElement.classList.add('show');
}