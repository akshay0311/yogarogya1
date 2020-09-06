const express = require('express');
var hbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const http = require('http');
const https = require('https');
var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS
const cors = require("cors");
const session = require('express-session');
var path = require('path');
const app = express();
const fs = require('fs');
var multer = require("multer");
const bodyParser = require("body-parser");
const User = require('./instructor/models/User');
const Profile = require('./student/models/profile');
const Package = require('./student/models/packages');

// DB Config
const db = require('./config/keys').mongoURI;



// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const exphbs = hbs.create({
        defaultLayout:'main',
        extname: '.hbs', 
        partialsDir: 'views/partials',
        helpers :{ 
            times: function(n, block) {
                  var accum = '';
                  for(var i = 0; i < n; ++i)
                      accum += block.fn(i);
                  return accum;
               }
            }   
        })

app.use(redirectToHTTPS([], [], 301));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// express-handlebar
app.engine('.hbs',exphbs.engine);
app.set('view engine', '.hbs');


// static folder
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

//using cors
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


app.get('/about',(req,res,next)=>{
  res.render("about.hbs")
})

// Routes for instructors
app.use('/', require('./instructor/routes/index.js'));
app.use('/users', require('./instructor/routes/users.js'));


//Routes for students
app.use('/student', require('./student/routes/profile'));

//Routes for package trial
app.use('/trial_package', require('./student/routes/trial_package'));

//Routes for package trial
app.use('/book_package', require('./student/routes/book_package'));



/*--------------------------------------APIS FOR PACKAGES---------------------*/
/*-------------------- POST api*-------------------*/
app.post('/PackageApi',(req,res,next)=>{
  var {hours,validity,mode,participants,sessions,price} = req.body;
  var package = new Package({hours,validity,mode,participants,sessions,price})
  package.save()
  .then(result=>res.status(201).json({result}))
  .catch(err=>console.log(err))        
})
/*-------------------- GET api*-------------------*/
app.get('/PackageApi',(req,res,next)=>{
  Package.find({})
  .then(result=>res.status(201).json(result))
  .catch(err=>console.log(err))
})
/*------------------------ DELETE api for deleting package------------------------------*/
app.delete('/PackageApi',(req,res,next)=>{
  Package.deleteMany({},function(result){
      console.log("deleted");
  })
})



const PORT = process.env.PORT || 5001;


const httpServer = http.createServer(app);
const httpsServer = https.createServer({
  key: fs.readFileSync('./yogarogya.key','utf8'),
  cert: fs.readFileSync('./fdca413655f05bb4.pem','utf8'),
}, app);

//app.listen(PORT);
httpServer.listen(PORT, () => {
    console.log('HTTP Server running on port '+PORT);
});

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});

