import express from 'express';
import cors  from 'cors';
import serveStatic from 'serve-static';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Create an Express app
const app = express();
app.use(cors())
// Serve static files from the 'dist' directory
app.use('/', serveStatic(path.join(process.cwd(), 'dist')));

app.get('/home', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.get('/search/:q', async (req, res) => {
  const response = await parseHtmlFromUrl(req.params.q)
  res.send(response)
});

// Catch-all route to serve the SPA for any route
//app.get(/.*/, (req, res) => {
//  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
//});


// Set the port from environment or default to 8080
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
});


async function parseHtmlFromUrl(search) {
  const url = `https://shop.tijssengovodi.nl/search?q=${search}&pg=true`
  try {
    // Fetch the HTML content from the given URL
    const { data: html } = await axios.get(url);

    // Load the HTML into cheerio for parsing
    const $ = cheerio.load(html);

    // Example: Find and log the title of the page
    const pageTitle = $('title').text();
    console.log(pageTitle)
    console.log('zoeken op', search)
    const productGrid = $('.product-grid');

    if (productGrid.length === 0) {
      console.error('No div with class "product-grid" found.');
      return;
    }
    // Find the first child node of the product-grid div
    const firstChild = productGrid.children().first();
    
    // Get the content (text) of the first child node
    const firstChildContent = firstChild.html();
       
    const product = { 
      number: search,
      name : $('.product-title').text().trim(),
      image: $('.picture img').attr('src'),
      price: $('.actual-price').text().trim()
    }
    $('.product-specs-box .spec-value').each(function(i, elm) {
      console.log($(elm).text().trim())
      const attr = $(elm).text().trim().split(':')[0]
      const value = $(elm).text().trim().split(':')[1].trim()
      product[props[attr]] = value
    })
    console.log(product)
    return product
    // Return the parsed HTML (or manipulate it as needed)
    
  } catch (error) {
    console.error('Error fetching or parsing HTML:', error.message);
  }
}

const props = {
  Merk: 'brand',
  Verpakking: 'unit',
  Maat: 'size'
}