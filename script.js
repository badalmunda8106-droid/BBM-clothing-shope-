const $ = (selector) => document.querySelector(selector);
const menuToggle = $('#menuToggle');
const mainNav = $('#mainNav');
const toast = $('#toast');
let toastTimer;
let products = [];
let catalogProducts = [];
let cart = JSON.parse(localStorage.getItem('bbm-cart') || '[]');

function notify(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle('toast-error', isError);
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}
function money(paise) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100); }
function saveCart() { localStorage.setItem('bbm-cart', JSON.stringify(cart)); renderCart(); }
function getProduct(id) { return catalogProducts.find(p => p.id === Number(id)); }

menuToggle?.addEventListener('click', () => mainNav.classList.toggle('open'));
mainNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mainNav.classList.remove('open')));

function productCard(product) {
  const artClass = product.art === 'hoodie-charcoal' || product.art === 'hoodie-black' ? 'mock-hoodie' : 'mock-tee';
  const print = product.art === 'tee-orange' ? 'MOVE<br>DIFFERENT' : product.art.startsWith('hoodie') ? 'NO<br>LIMITS.' : product.name.toUpperCase().replace(' ', '<br>');
  const artClassExtra = product.art === 'tee-orange' ? ' tee-orange' : '';
  return `<article class="product-card">
    <div class="product-image product-${product.id % 3 === 0 ? 'c' : product.id % 3 === 1 ? 'a' : 'b'}">
      ${product.badge ? `<span class="product-tag">${escapeHtml(product.badge)}</span>` : ''}
      <div class="${artClass}${artClassExtra}"><span>${print}</span></div>
      <button class="quick-add" type="button" data-add="${product.id}" ${product.stock < 1 ? 'disabled' : ''}>+ QUICK ADD</button>
    </div>
    <div class="product-info"><div><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.colour)} / ${escapeHtml(product.fit)} · ${product.stock} left</p></div><strong>${money(product.price_paise)}</strong></div>
  </article>`;
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function loadProducts() {
  const params = new URLSearchParams({ search: $('#productSearch').value, category: $('#categoryFilter').value, sort: $('#sortFilter').value, max: $('#maxPrice').value });
  $('#maxPriceLabel').textContent = money(Number($('#maxPrice').value) * 100);
  const grid = $('#productGrid');
  grid.innerHTML = '<p class="muted">Loading collection...</p>';
  try {
    const response = await fetch(`/api/products?${params}`);
    if (!response.ok) throw new Error('Could not load products.');
    const data = await response.json(); products = data.products;
    grid.innerHTML = products.length ? products.map(productCard).join('') : '<p class="muted">No products match these filters. Try another search.</p>';
    $('#filterCount').textContent = `${products.length} product${products.length === 1 ? '' : 's'} found`;
    renderCart();
  } catch (error) { grid.innerHTML = '<p class="muted">Products could not be loaded. Please refresh the page.</p>'; notify(error.message, true); }
}
let filterTimer;
$('#productSearch').addEventListener('input', () => { clearTimeout(filterTimer); filterTimer = setTimeout(loadProducts, 250); });
$('#categoryFilter').addEventListener('change', loadProducts);
$('#sortFilter').addEventListener('change', loadProducts);
$('#maxPrice').addEventListener('input', loadProducts);

$('#productGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-add]'); if (!button) return;
  const product = getProduct(button.dataset.add); if (!product) return;
  const existing = cart.find(item => item.id === product.id);
  if (existing) { if (existing.quantity >= product.stock || existing.quantity >= 10) return notify('Maximum available quantity reached.', true); existing.quantity += 1; }
  else cart.push({ id: product.id, quantity: 1 });
  saveCart(); notify(`${product.name} added to your bag.`);
});

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  $('#cartCount').textContent = count;
  const items = cart.map(item => ({ ...item, product: getProduct(item.id) })).filter(item => item.product);
  cart = items.map(({id, quantity}) => ({id, quantity}));
  const subtotal = items.reduce((sum, item) => sum + item.product.price_paise * item.quantity, 0);
  $('#cartSubtotal').textContent = money(subtotal); $('#checkoutTotal').textContent = money(subtotal);
  $('#checkoutOpen').disabled = !items.length;
  $('#cartItems').innerHTML = items.length ? items.map(item => `<div class="cart-item"><div><strong>${escapeHtml(item.product.name)}</strong><small>${money(item.product.price_paise)} each</small><div class="quantity-controls"><button type="button" data-qty="-1" data-id="${item.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-qty="1" data-id="${item.id}" aria-label="Increase quantity">+</button></div></div><div class="cart-item-side"><strong>${money(item.product.price_paise * item.quantity)}</strong><button type="button" class="remove-item" data-remove="${item.id}">Remove</button></div></div>`).join('') : '<p>Your bag is empty. Add something from the collection.</p>';
  localStorage.setItem('bbm-cart', JSON.stringify(cart));
}
$('#cartItems').addEventListener('click', event => {
  const qtyButton = event.target.closest('[data-qty]'); const removeButton = event.target.closest('[data-remove]');
  if (removeButton) cart = cart.filter(item => item.id !== Number(removeButton.dataset.remove));
  if (qtyButton) {
    const item = cart.find(entry => entry.id === Number(qtyButton.dataset.id)); const product = getProduct(qtyButton.dataset.id);
    if (item) { item.quantity += Number(qtyButton.dataset.qty); if (item.quantity < 1) cart = cart.filter(entry => entry.id !== item.id); else if (item.quantity > Math.min(product?.stock || 10, 10)) { item.quantity -= 1; notify('Maximum available quantity reached.', true); } }
  }
  saveCart();
});
function openCart() { $('#cartDrawer').classList.add('visible'); $('#drawerBackdrop').classList.add('visible'); $('#cartDrawer').setAttribute('aria-hidden', 'false'); }
function closeCart() { $('#cartDrawer').classList.remove('visible'); $('#drawerBackdrop').classList.remove('visible'); $('#cartDrawer').setAttribute('aria-hidden', 'true'); }
$('#cartOpen').addEventListener('click', openCart); $('#cartClose').addEventListener('click', closeCart); $('#drawerBackdrop').addEventListener('click', closeCart);
$('#checkoutOpen').addEventListener('click', () => { closeCart(); $('#checkoutModal').classList.add('visible'); $('#checkoutModal').setAttribute('aria-hidden', 'false'); });
function closeCheckout() { $('#checkoutModal').classList.remove('visible'); $('#checkoutModal').setAttribute('aria-hidden', 'true'); }
$('#checkoutClose').addEventListener('click', closeCheckout);

$('#checkoutForm').addEventListener('submit', async event => {
  event.preventDefault();
  const button = $('#payButton'); const message = $('#checkoutMessage');
  const checkoutForm = event.currentTarget;
  const form = new FormData(checkoutForm);
  const customer = { name: form.get('name').trim(), email: form.get('email').trim(), phone: form.get('phone').trim(), address: form.get('address').trim() };
  button.disabled = true; button.textContent = 'CREATING SECURE PAYMENT...'; message.textContent = '';
  try {
    const response = await fetch('/api/checkout/create-order', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ customer, items: cart }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to start checkout.');
    if (!window.Razorpay) throw new Error('Razorpay Checkout could not load. Check your internet connection.');
    const checkout = new Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, name: 'BBM Clothing Shop', description: 'Your BBM order', order_id: data.orderId, prefill: { name: customer.name, email: customer.email, contact: customer.phone }, notes: { delivery_address: customer.address }, theme: { color: '#f26a21' }, handler: async payment => {
      try {
        const verifyResponse = await fetch('/api/checkout/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payment) });
        const verified = await verifyResponse.json(); if (!verifyResponse.ok) throw new Error(verified.error || 'Payment verification failed.');
        cart = []; saveCart(); closeCheckout(); checkoutForm.reset(); notify('Payment successful! Your order is confirmed.');
      } catch (error) { message.textContent = `${error.message} Please contact BBM support with your payment ID.`; }
    }, modal: { ondismiss: () => { button.disabled = false; button.textContent = 'PAY SECURELY WITH RAZORPAY ↗'; } } });
    checkout.on('payment.failed', failure => { message.textContent = failure.error?.description || 'Payment was not completed. You can try again.'; });
    checkout.open();
  } catch (error) { message.textContent = error.message; }
  finally { button.disabled = false; button.textContent = 'PAY SECURELY WITH RAZORPAY ↗'; }
});

$('#newsletterForm').addEventListener('submit', async event => {
  event.preventDefault(); const email = $('#email').value.trim(); const button = event.currentTarget.querySelector('button');
  button.disabled = true; button.textContent = 'JOINING...'; $('#formMessage').textContent = '';
  try {
    const response = await fetch('/api/newsletter', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email}) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not subscribe.');
    $('#formMessage').textContent = data.message; event.currentTarget.reset();
  } catch (error) { $('#formMessage').textContent = error.message; }
  finally { button.disabled = false; button.textContent = 'Join the list ↗'; }
});

(async () => {
  try { const response = await fetch('/api/products'); const data = await response.json(); catalogProducts = data.products || []; } catch { catalogProducts = []; }
  await loadProducts();
  renderCart();
})();
