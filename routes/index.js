var express = require('express');
const passport = require('passport');
var router = express.Router();

//Database models
let User = require('./users');
let Car = require('./carModel')

//For Multer
const multer = require('multer');

//Local Strategy
const local = require('passport-local');

passport.use(new local(User.authenticate()));


//isLoggedIn Middleware
isLoggedIn=(req,res,next)=>{
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}

//redirectToProfile Middleware 
redirectToProfile = (req,res,next)=>{
  if(req.isAuthenticated()){
    res.redirect(`/profile/${req.session.passport.user}`)
  }
  else{
    return next()
  }
}

//Multer Storing Images
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/profileImages');
  },
  filename: function (req, file, cb) {
    let random = Math.floor(Math.random()*10000);
    random = random+''+Date.now();
    cb(null, random + '-' + file.originalname);
  }
}) 
var storageCar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/CarImages');
  },
  filename: function (req, file, cb) {
    let random = Math.floor(Math.random()*10000);
    random = random+''+Date.now();
    cb(null, random + '-' + file.originalname);
  }
})


var upload = multer({ storage: storage });
var uploadCar = multer({ storage: storageCar })

/* GET home page. */
router.get('/', redirectToProfile ,function(req, res, next) {
  res.render('index', { title: 'Express' , isLoggedInVal: false, x:req.flash() });
});

// For Registering
router.post('/register',(req,res)=>{
  
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
  });

  User.register(newUser,req.body.password).then(function(u){
    passport.authenticate('local')(req,res,()=>{
          res.redirect(`/profile/${u.username}`);
    })
  }).catch((error)=>{
    req.flash('problem',true);
    req.flash('error',`${error}`);
    req.flash('errorType',`${error.name}`)
    res.redirect('/');
  })

});

//For Login
router.post('/login', passport.authenticate('local',{
  failureRedirect: '/',
}),function(req,res){
  let lo = req.body.username;
  res.redirect(`/profile/${lo}`);
})

//For Logout
router.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/');
});


//Upload Image Router
router.post('/uploadImage',upload.single('profileImage'),(req,res)=>{
  
  
  let x = `../images/profileImages/${req.file.filename}`
  
    User.findOneAndUpdate(
      {username: req.session.passport.user},
      {userImageUrl: x},
      {returnNewDocument: true, new: true})
  .then((updatedUser)=>{
    // User.create({userImageUrl:x})
    res.redirect(`/profile/${req.session.passport.user}`);
  })
})

//Profile Page
router.get('/profile/:username',isLoggedIn,(req,res)=>{
  User.findOne({username:req.session.passport.user}).then((currentUser)=>{
    // res.render('profile',{cr:currentUser,pr:'testing'});
    Car.find({_id:currentUser.cars}).then((findedcars)=>{
     
      res.render('profile',{ cr:currentUser , fr:findedcars, isLoggedInVal: true });
     
    })
  })
})

//addCarRouter
router.post('/addCar', isLoggedIn, uploadCar.single('carImage'), (req,res)=>{
   let y = `../images/carImages/${req.file.filename}`
 
  User.findOne({username: req.session.passport.user})
  .then((findedUser)=>{
    Car.create({
      price: req.body.carPrice,
      name: req.body.carName,
      contact: req.body.contact,
      carImageUrl: y,
      owner_Id: findedUser._id,
    })
    .then((addedCar)=>{
      findedUser.cars.push(addedCar._id);
      findedUser.save()
      .then((userDetails)=>{
        // res.send(userDetails+'/n'+addedCar);
        res.redirect(`/profile/${req.session.passport.user}`);
      })

    })

  })

});

//Sell Router
router.get('/sell/:page',isLoggedIn, (req,res)=>{
  
  var paggg = parseInt(req.params.page);
  
  var realPage = paggg-1;
  var shownpage = paggg;

  var perPage = 3
  , page = Math.max(0, realPage );

Car.find()
    .limit(perPage)
    .skip(perPage * page)
    .exec(function(err, cars) {
        Car.count().exec(function(err, count) {
            res.render('sellingapp', {
                cars: cars,
                page: page,
                pages: count / perPage,
                isLoggedInVal: true,
                shownPage: shownpage,
            })
                    })
    })

});

router.get('')

module.exports = router;