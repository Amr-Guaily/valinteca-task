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
  cartProducts = getCartProducts();

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

function getCartProducts() {
  return JSON.parse(localStorage.getItem(`${prefix}products`))?.filter(prodcut => prodcut.inCart) || [];
}

function renderProducts(products) {
  localStorage.setItem(`${prefix}products`, JSON.stringify(products));

  products.forEach(({ id, title, price, image, desc, inCart }) => {
    productsContainer.innerHTML += `
      <div class="product-item" >
            <div class="image">
                <img src="${image}"/>
            </div>
            <div class="info">
                <h3>${title}</h3>
                <span class="price">${price}</span>
            </div>
            <div class='actions'>
              <button data-id=${id} onclick="toggleHandler(${id})" class="add-btn ${inCart ? 'remove' : 'add'}">
                <span>Add to cart</span>
                <span>Remove from cart</span>
              </button>
              <button onclick="renderModal(${id}, this)" data-img-src=${image} data-title=${title} data-price=${price} data-desc="${desc}" class="view-btn">
                View
              </button>
            </div>
        </div>`;
  });
}

function toggleHandler(productId) {
  const selectedProduct = products.find(product => product.id == productId);
  selectedProduct.inCart ? removeFromCart(productId) : addToCart(selectedProduct);
}

function addToCart(prodcut) {
  // update product state (inCart: true)
  prodcut.inCart = true;
  prodcut.quantity = 1;
  localStorage.setItem(`${prefix}products`, JSON.stringify(products));

  // Update Screen
  cartLength.innerText = getCartProducts().length;
  renderCart(prodcut);
  setPrice();

  // Update btn (get the selected btn bassed on data-*attribute)
  document.querySelectorAll(`[data-id="${prodcut.id}"]`).forEach(btn => {
    btn.classList.add('remove');
    btn.classList.remove('add');
  });
}

function removeFromCart(prodcutId) {
  // update product state (inCart: false)
  const selectedProduct = products.find(product => product.id == prodcutId);
  selectedProduct.inCart = false;
  delete selectedProduct.quantity;
  localStorage.setItem(`${prefix}products`, JSON.stringify(products));

  // remove from screen 
  cartItems.querySelector(`[data-cartItem="${prodcutId}"]`).remove();
  cartLength.innerText = getCartProducts().length;
  setPrice();

  // update btn (get the selected btn bassed on data-*attribute)
  document.querySelectorAll(`[data-id="${prodcutId}"]`).forEach(btn => {
    btn.classList.add('add');
    btn.classList.remove('remove');
  });
}

function clearCart() {
  // update all products state (inCart: false)
  products = products.map((product) => {
    delete product.quantity;
    return { ...product, inCart: false };
  });
  localStorage.setItem(`${prefix}products`, JSON.stringify(products));

  // clear UI
  cartItems.innerHTML = '';
  cartLength.innerText = 0;

  // update total price
  setPrice();

  // update btn (get the selected btn based on data attribute)
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.classList.add('add');
    btn.classList.remove('remove');
  });
}

function renderCart(product) {
  let { id, image, title, price, quantity } = product;
  cartItems.innerHTML += `
    <li class="cart-item" data-cartItem=${id}>
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

function changeQuantity(action, prodcutId) {
  const selectedProduct = products.find((product) => product.id == prodcutId);
  if (action == "decrement" && selectedProduct.quantity <= 1) {
    if (confirm('Are you sure you want to remove item from your cart?')) removeFromCart(prodcutId);
  } else if (action == "decrement") {
    selectedProduct.quantity--;
  } else if (action == "increment") {
    selectedProduct.quantity++;
  }
  // update localStorage
  localStorage.setItem(`${prefix}products`, JSON.stringify(products));

  // update screen
  cartItems.querySelector(`[data-cartItem="${prodcutId}"] span`).textContent = selectedProduct.quantity;
  setPrice();
}

function setPrice() {
  let total = getCartProducts().reduce((sum, product) => {
    return sum + (product.price * product.quantity);
  }, 0);
  totalPrice.innerText = total.toFixed(2);
}

function renderModal(productId, btn) {
  // pull data attributes values
  const imgSrc = btn.dataset.imgSrc;
  const title = btn.dataset.title;
  const price = btn.dataset.price;
  const desc = btn.dataset.desc;

  // Get the current class of the add-btn (add or remove)
  const inCart = [...btn.previousElementSibling.classList][1];

  modal.innerHTML = `
    <div class="left"><img src="${imgSrc}" alt="product-img" /></div>
    <div class="right">
      <h3>${title}</h3>
      <span class="price">${price}</span> 
      <p>${desc}</p>
      <button data-id=${productId} onclick="toggleHandler(${productId})" class="add-btn ${inCart}">
        <span>Add to cart</span>
        <span>Remove from cart</span>
      </button>
    </div>
  `;
  modal.parentElement.classList.add('show');
}