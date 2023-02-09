require("dotenv").config();

const express = require("express");
const errorHandler = require('errorhandler');
const path = require("path");
const app = express();
const port = 3000;

const fetch = require("node-fetch");
const Prismic = require("@prismicio/client");
const PrismicH = require("@prismicio/helpers");

const routes = [
  {
    type: "page",
    path: "/"
  },{
    type: "page",
    path: "/about"
  },{
    type: "page",
    path: "/collections"
  },{
    type: "page",
    path: "/detail/:id"
  },
]

const initApi = async (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    // routes,
    req,
    fetch
  });
}

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

app.use(errorHandler());

app.use((req, res, next) => {
  // res.locals.ctx = {
  //   PrismicH,
  // }
  res.locals.PrismicH = PrismicH;
  next()
})

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
  // initApi(req).then((api) => {
  //   api.get({
  //     predicates: Prismic.predicate.at("document.type", "home")
  //   }).then((response) => {
  //     res.render('pages/home', { 
  //       document: response.results[0]
  //     });
  //   })
  // });
  res.render('pages/home');
});

app.get('/about', (req, res) => {
  initApi(req).then((api) => {
    api.get({
      predicates: Prismic.predicate.any("document.type", ["meta", "about"])
    }).then((response) => {

      const { results } = response;
      const [ meta, about ] = results;

      res.render('pages/about', {
        about,
        meta
      });
    })
  });
});

app.get('/collections', async (req, res) => {
    const api = await initApi(req);
    const home = await api.getSingle("home");
    const meta = await api.getSingle("meta");
    const { results: collections } = await api.get({
      predicates: Prismic.predicate.at("document.type", "collection"),
      fetchLinks: "product.model"
    });

    res.render('pages/collections', {
      collections,
      home,
      meta
    });

    console.log(collections, "collectionsss")
    collections.forEach(coll => {
      console.log(coll.data.products[0].products_product, "collami")
    })

});

app.get('/detail/:uid', async (req, res) => {
    const api = await initApi(req);
    const meta = await api.getSingle("meta");
    const product = await api.getByUID("product", req.params.uid, {
      fetchLinks: "collection.title"
    });
    
    res.render('pages/detail', {
      product,
      meta
    });
    
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});