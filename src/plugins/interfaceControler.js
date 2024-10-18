import axios from 'axios';
let server = (process.env.NODE_ENV =="development") ?  document.location.protocol + '//' + document.location.hostname + ':3000'  : 'https://barcoder.eu-4.evennode.com'

export async function searchProduct(search) {
  try {
    // Fetch the document from the URL
    const response = await axios({
      url: server + '/search/' + search,
      method: 'GET'
    });

   return response.data;; // This is the binary data stored in memory
  } catch (error) {
    console.error('Error fetching document:', error.message);
    return null;
  }
}


export function replaceImageInIframe() {
  try {
    // Get a reference to the iframe element
    const iframe = document.getElementById('iFrame');

    // Check if the iframe exists
    if (!iframe) {
      console.error('Iframe not found');
      return;
    }

    // Get the document of the iframe (requires same-origin policy)
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    // Clear the iframe's current content
    //iframeDoc.open();
    //iframeDoc.write(''); // Clear the document
    //iframeDoc.close();
    const item = iframeDoc.querySelector('.product-grid').innerHTML
    if (!item) {
      console.error('Item not found');
      return;
    }
    iframeDoc.open();
    iframeDoc.write(item);
    iframeDoc.close();
return console.log(iframeDoc)
    // Find the image in the iframe document
    const image = iframeDoc.querySelector('img');

    // Check if an image was found
    if (!image) {
      console.error('Image not found in iframe');
      return;
    }

    // Replace the src of the image
    image.src = newImageUrl;

    console.log('Image source replaced successfully!');
  } catch (error) {
    console.error('Error accessing iframe or replacing image:', error);
  }
}