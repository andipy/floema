require("dotenv").config();

const express = require("express");
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

      console.log(about.data.body, "about data body");

      res.render('pages/about', {
        about,
        meta
      });
    })
  });
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