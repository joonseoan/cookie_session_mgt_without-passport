const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// import express-session lib
const session = require('express-session');
const mongoStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const Mongo_URI = 'mongodb+srv://joon:7604632tk@firstatlas-drwhc.mongodb.net/shop';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


/* 

  _id: "Sr5H66Ieud9JLHhUmymKb51iABX_yg_i"
  expires: 2019-03-20T19:42:39.295+00:00
  session: Object
  cookie: Object {
    originalMaxAge: null
    expires: null
    secure: null
    httpOnly: true
    domain: null
    path: "/"
    sameSite: null
  }
  isAuthenticated: true ==>>> we set it up 

*/
const store = new mongoStore({
  uri: Mongo_URI,
  collection: 'sessions'

})
// resave:false : as long as session data is not switched,
//  it is not going to be saved.
// saveUninitialized: false: until the req requests the session to be saved,
//  it is not going to be saved.
app.use(session({secret: 'asfasdfsafdsa', resave: false, saveUninitialized: false, store }));

// moved to login route
// app.use((req, res, next) => {
//   User.findById('5c7ff22830149705b40657f0')
//     .then(user => {
//       req.user = user;
//       next();
//     })
//     .catch(err => console.log(err));
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(Mongo_URI, { useNewUrlParser: true })
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Joon',
          email: 'joon@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
