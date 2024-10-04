import React, { useState, useEffect } from 'react';
import { Product } from './types';
import { ShoppingBag } from 'lucide-react';

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    console.log('App: Component mounted');
    
    const messageListener = (request: any, sender: any, sendResponse: (response?: any) => void) => {
      console.log('App: Received message:', request);
      if (request.action === 'updateProducts') {
        console.log('App: Updating products:', request.products);
        setProducts(request.products);
        sendResponse({ status: 'Products updated successfully' });
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Attempt to get initial products
    console.log('App: Requesting initial products');
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, {action: 'getProducts'}, (response) => {
          console.log('App: Response from content script:', response);
          if (response && response.products) {
            setProducts(response.products);
          }
        });
      }
    });

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      console.log('App: Component unmounted');
    };
  }, []);

  console.log('App: Rendering with products:', products);

  return (
    <div className="w-96 p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <ShoppingBag className="mr-2" />
        Louis Vuitton Products
      </h1>
      {products.length === 0 ? (
        <p>No products found on this page.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product, index) => (
            <li key={index} className="bg-white rounded-lg shadow-md p-4">
              <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover mb-2 rounded" />
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-gray-600">{product.price}</p>
              <p className="text-sm text-gray-500">Model ID: {product.modelId}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;