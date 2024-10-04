import { Product } from './types';

function extractProductInfo(): Product[] {
  console.log('Content Script: Starting product extraction');
  const products: Product[] = [];
  const productElements = document.querySelectorAll('.lv-product-list__item');
  console.log(`Content Script: Found ${productElements.length} product elements`);

  productElements.forEach((element, index) => {
    console.log(`Content Script: Processing product element ${index + 1}`);
    const nameElement = element.querySelector('.lv-product-card__name');
    const priceElement = element.querySelector('.lv-product-card__price');
    const imageElement = element.querySelector('img.lv-product-card__image');
    const linkElement = element.querySelector('a.lv-product-card__link');

    console.log('Content Script: Element details:', {
      nameElement: nameElement?.textContent,
      priceElement: priceElement?.textContent,
      imageElement: imageElement?.getAttribute('src'),
      linkElement: linkElement?.getAttribute('href')
    });

    const name = nameElement?.textContent?.trim() || '';
    const price = priceElement?.textContent?.trim() || '';
    const imageUrl = imageElement?.getAttribute('src') || '';
    const modelId = linkElement?.getAttribute('href')?.split('/').pop() || '';

    if (name && price) {
      console.log('Content Script: Adding product:', { name, price, imageUrl, modelId });
      products.push({ name, price, imageUrl, modelId });
    } else {
      console.log('Content Script: Skipping product due to missing name or price');
    }
  });

  console.log(`Content Script: Extracted ${products.length} products`);
  return products;
}

function sendProductsToPopup(products: Product[]) {
  console.log('Content Script: Sending products to popup:', products);
  chrome.runtime.sendMessage({ action: 'updateProducts', products }, (response) => {
    console.log('Content Script: Response from sendMessage:', response);
  });
}

function observePageChanges() {
  console.log('Content Script: Setting up page observer');
  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  const callback = function(mutationsList: MutationRecord[], observer: MutationObserver) {
    console.log('Content Script: Page change detected');
    for(let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('Content Script: Child list mutation detected');
        const updatedProducts = extractProductInfo();
        if (updatedProducts.length > 0) {
          console.log('Content Script: Sending updated products');
          sendProductsToPopup(updatedProducts);
        } else {
          console.log('Content Script: No products found after page change');
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
  console.log('Content Script: Page observer set up');
}

// Initial extraction
console.log('Content Script: Performing initial product extraction');
const initialProducts = extractProductInfo();
if (initialProducts.length > 0) {
  console.log('Content Script: Sending initial products');
  sendProductsToPopup(initialProducts);
} else {
  console.log('Content Script: No initial products found');
}

// Set up observer for dynamic content changes
observePageChanges();

// Log for debugging
console.log('Louis Vuitton Product Identifier content script loaded and initialized');