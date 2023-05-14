require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs")
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const findOrCreate = require('mongoose-findorcreate')
const alert= require('alert')

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
app.set('view engine', 'ejs');

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}));










app.use(passport.initialize());
app.use(passport.session());




mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://prithunarang:Krsna108@e-commerce.ls62ryh.mongodb.net', {useNewUrlParser:true});


const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    googleId: String,
    
    
});
const productSchema = new mongoose.Schema({
    product_name: String,
    product_price: String,
    img_url: String,
})


const cartSchema = new mongoose.Schema({
    name: String,
    price: String,
    url: String,
    userid: String
})


userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = new mongoose.model("User", userSchema)
const Product = new mongoose.model("Product", productSchema)
const Cart = new mongoose.model("Cart", cartSchema)


passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  


app.get("/", function(req, res){
    
    if(req.isAuthenticated()){
        res.render("home", {
            name: "Hi " + req.user.username,
            name1: "logout"
        })
        } else {
        res.render("home", {
            name: "Login",
            name1: "Signup"
        })
       }

})

app.get("/login", function(req, res){
    if(req.isAuthenticated()){
        req.logout(function(err){
            console.log(err);
        });
        res.redirect("/")
    }else{
        res.render("login")
    }
})

app.get("/signup", function(req, res){
    if(req.isAuthenticated()){
        req.logout(function(err){
            console.log(err);
        });
        res.redirect("/")
    }else{
        res.render("signup")
    }
   
})

app.get("/faliure", function(req, res){
    res.render("faliure")
})

app.get("/cart", function(req, res){
    if(req.isAuthenticated()){
        Cart.find({userid : req.user._id}).then(function(documents){
            res.render("cart", {
                items: documents
            })
         })
        }else{
            res.redirect("/login")
        }
    

    
})

app.get("/products/:productId", function(req, res){
    alert("Item added to cart")
    id= req.params.productId
    if(req.isAuthenticated()){
    Product.findOne({_id: id}).then(function(documents){
        const item = new Cart({
            name: documents.product_name,
            price: documents.product_price,
            url: documents.img_url,
            userid: req.user._id

        })
        item.save()
        res.redirect("/products")
       
    })
    }else{
        res.redirect("/login")

    }
    })

app.get("/delete/:itemId", function(req, res){
    id= req.params.itemId
    Cart.deleteOne({_id: id}).then(function(documents){
        res.redirect("/cart")
    })
})


app.post("/signup", function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/signup")
        } else {
           passport.authenticate("local") (req, res, function(){
            res.redirect("/")
            
           })
        }
    })
    });
   
    app.post("/login", function(req, res){
        const user = new User({
            username: req.body.username,
            password: req.body.password
        })
    
        req.login(user, function(err){
            if (err){
                console.log(err);
            } else {
                passport.authenticate("local", { failureRedirect: '/faliure', failureMessage: true })(req, res, function(){
                    res.redirect("/")
                })
               
            }
        })
    })
 app.get("/products", function(req, res){
    
   Product.find().then(function(documents){
    Cart.find().then(function(items){
        res.render("product", {
            products: documents,
            items: items
            
        })
    })
     })
    })

    app.get("/create", function(req, res){
        if(req.isAuthenticated()){
            if(req.user.username === "admin"){
                res.render("create")
            }else{  
                res.redirect("/login")
                alert
            }
        }else{
            res.redirect("/login")
        }
    })


    app.post("/create", function(req, res){
        const product = new Product({
            product_name: req.body.name,
            product_price: req.body.price,
            img_url: req.body.url
        })
        product.save()
            
        res.redirect("/create")


    })

    app.post("/faliure", function (req, res){
        res.redirect("/login")
        } )

        
app.listen( process.env.PORT || 3000, function(){
    console.log("Server is running at port 3000")
})