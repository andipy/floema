require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

//const fetch = require("node-fetch");
const Prismic = require("@prismicio/client");
const PrismicH = require("@prismicio/helpers");

const initApi = (req) => {
    return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
      accessToken: process.env.PRISMIC_ACCESS_TOKEN,
      req,
      fetch,
    });
};

// const handleLinkResolver = (doc) => {
//     if (doc.type === 'product') {
//       return `/detail/${doc.slug}`;
//     }
  
//     if (doc.type === 'collections') {
//       return '/collections';
//     }
  
//     if (doc.type === 'about') {
//       return `/about`;
//     }
  
//     // Default to homepage
//     return '/';
// };

// app.use((req, res, next) => {
//     res.locals.ctx = {
//         endpoint: process.env.PRISMIC_ENDPOINT,
//         linkResolver: handleLinkResolver
//     };
//     res.locals.PrismicDOM = PrismicDOM;
//     next();
// });

app.use((req, res, next) => {
    res.locals.ctx = {
      PrismicH,
    }
    next()
})

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get('/', async (req, res) => {
    // Here we are retrieving the first document from your API endpoint
    const document = await initApi();
    console.log(document, "from api call");
    res.render('pages/home', { document })
})

app.get('/about', (req, res) => {
    res.render("pages/about");
});

app.get('/collections', (req, res) => {
    res.render("pages/collections");
});

app.get('/detail/:id', (req, res) => {
    res.render("pages/detail");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});