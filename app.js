require("dotenv").config();

const logger = require("morgan");
const express = require("express");
const errorHandler = require('errorhandler');
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const app = express();
const path = require("path");
const port = 3000;

const fetch = require("node-fetch");
const Prismic = require("@prismicio/client");
const PrismicH = require("@prismicio/helpers");

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride());
app.use(errorHandler());
app.use(express.static(path.join(__dirname, "public")));

const initApi = async (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
    fetch
  });
}

const handleLinkResolver = (doc) => {
    if (doc.type === 'product') {
      return `/detail/${doc.slug}`;
    }

    if (doc.type === 'collections') {
      return `/collections`;
    }
    
    if (doc.type === 'about') {
      return `/about`;
    }
    
    // Default to homepage
    return '/';
};


app.use((req, res, next) => {
    res.locals.PrismicH = PrismicH;
    res.locals.Link = handleLinkResolver
    next()
})

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

const handleRequest = async (api) => {
    const meta = await api.getSingle("meta");
    const navigation = await api.getSingle("navigation");  
    const preloader = await api.getSingle("preloader");

    return {
      meta,
      navigation,
      preloader
    }
}

app.get('/', async (req, res) => {
    const api = await initApi(req);
    const defaults = await handleRequest(api);
    const home = await api.getSingle("home");

    const { results: collections } = await api.get({
      predicates: Prismic.predicate.at("document.type", "collection"),
      fetchLinks: "product.model"
    });

    res.render('pages/home', {
      ...defaults,
      collections,
      home
    });
});

app.get('/about', async (req, res) => {
    const api = await initApi(req);
    const defaults = await handleRequest(api);
    const about = await api.getSingle("about");

    res.render('pages/about', {
      ...defaults,
      about
    });
});

app.get('/collections', async (req, res) => {
    const api = await initApi(req);    
    const defaults = await handleRequest(api);
    const home = await api.getSingle("home");

    const { results: collections } = await api.get({
      predicates: Prismic.predicate.at("document.type", "collection"),
      fetchLinks: "product.model"
    });

    res.render('pages/collections', {
      ...defaults,
      collections,
      home
    });
});

app.get('/detail/:uid', async (req, res) => {
    const api = await initApi(req);
    const defaults = await handleRequest(api);

    const product = await api.getByUID("product", req.params.uid, {
      fetchLinks: "collection.title"
    });
    
    res.render('pages/detail', {
      ...defaults,
      product
    });    
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});