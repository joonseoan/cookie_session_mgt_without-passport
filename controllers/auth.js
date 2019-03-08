const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    
    // 2) Session
    // it sents "true" because we sent cookie value in postLogin
    console.log(req.session.isAuthenticated);
    
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        // isAuthenticated: req.session.isAuthenticated
        // because when the user tries to login, not automaticllay logged in.
        isAuthenticated: false
    });

    // ---------------------------------------------------------------
    // 1) Cookie
    // Syntax to get header information
    // console.log(req.get('Cookie').split('=')[1])

    // However, we have an [issue] here.
    // In the browser, the cookie value can be manipulated by a user. ***
    // for instance, when the user would set loggedIn=false,
    //  The follwing value would return false.
    // Then cookie would not work.  

    // Also, the brwoser's cookie is sent to every webpages
    //  Then the any other host can collect user's cookie information like below.
    // Then, it can be tracked down by the web host.

    // let isAuthenticated;
    // if(req.get('Cookie')) {

    //     console.log(req.get('Cookie'))
    //     isAuthenticated = req.get('Cookie')
    //         .split('=')[1]
    //         .trim();
            
    // }
    // res.render('auth/login', {
    //     path: '/login',
    //     pageTitle: 'Login',
    //     isAuthenticated

    // });
}

exports.postLogin = (req, res, next) => {

    // ------------------------------------------------------------
    // 2) Session
    // In case of session, we can use req....
    //  because we setup the session initialization with "app.use(session({ ... }))"" in app.js.
    // It is initialized and then results in making the "req.sessiond" field
    //  we can implement this session field at any routes.
    // "connect.sid" in cookie of the browser is shown up.

    // sending encrypted value to the cookie of the brwoser not by express but express-session
    //  ***** Encrypted value : secret in app.use(session) + key value
    //  by entering session fileds like the one below.
    // req.session.isAuthenticated = true;

    // [Assignment]d
    User.findById('5c81b725ad17ef2cd0824c3d')
        .then(user => {
            req.session.isAuthenticated = true;

            // user: "object"
            console.log('typeof User', typeof user);

            // the object is assigned to session database and cookie
            //  1) For the cookie in the browser, the encrypted _id is stored.
            //  2) In the database, the all user object is going to be stored.
            req.session.user = user;

            /* **************************************************************88
            
                In the routes, at postCart().

                req.session.user: "{ cart: { items: [ [Object] ] }""
                
                // which is the one below
                
                // that is, it a just fetching data with manipulation 
                //  then stored in database.
                // It does not have defined mongoose schema
                // At this point of view, we can not invoke 
                //  mongoose schema methods with 'req.session.user'

                user:Object
                    cart: Object
                        items : Array 0
                        : Object
                            _id: 5c801c35f71dea2f78594c72
                            productId: 5c7ff3b56e6b513590be60c2
                            qty: 1
                            _id : 5c7ff22830149705b40657f0
                            username: "joon"
                            email: "joon@test.com"
                            __v:2

                console.log(typeof req.session.user)

                req.session.user.addToCart(product);
            
            
            */
            // normally we do not need to forcely save for the session collection
            //  However, sometime when the db is not quickly responsive,
            //  redirect can be run before the session storage is made out.
            // Only for the redirect and just in case, we need to set this up
            return req.session.save();                

        })
        .then(() => {
            res.redirect('/');
        })
        .catch(err =>  { throw new Error('Unable to log in.'); });
    
    // ----------------------------------------------------------------
    // 1) Cookie
    // It is not working in routes.
    //  because 'res' finishes and req.isAuthenticated vanishes in routes.
    // Then, in this router, new request from '/' executes.
    // Remember it is a callback function that executes in express.
    // Each express route callback attributes can not be shared with the entire express routes.    
    // Solution: a global variable to be shared. ===> cookie in the browser
    // req.isAuthenticated = true;
    
    // The server particularly here sent cookie value, "loggedIn=true" to browser
    //  , then the browser sets up and stores the cookie and its value.
    // And, finally, the cookie value in browser is sent back to the server 
    //  in every request!!!!!!! by using "req.header"!!!! 
    //  as long as the cookie is expired.
     
    // [ SETUP ]
    // set up A cookie in the browser by SENDING cookie VALUE.
    // the first parameter is a built-in paramter for cookie.
    // the second paramter can be built by us.
    
    // etc: 
    //  Domain, 
    //  Secure (does not show cooke info in browser because of https) 
    //  HttpOnly : the cookie value can be accessed by the client side's javascript
    //          Threfore, the hacker can inject some malicious scripts to get cookie information
    //          The cookie information should not have important information for this reason. 
    //          for tracking

    // res.setHeader('Set-Cookie', 'loggedIn=true; '); //======> use this one
    
    // adding a expriring day
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10');

    // res.redirect('/');
}

// Logout when using session
// Clear Session can be run by session middleware
// Then, remove cookie in the browser
// Both should be done to run logout. 
exports.postLogout = (req, res, next) => {
    console.log('working!!!!!!!!!!?')
    // .destroy is a middleware from session lib.
    // For now, it get rid of the current session document in db.
    // Therefore, cookie in browser is still available,
    //  the client can't automatically log in again
    //  because of a count partner (session db) of session
    //  is not availalbe. 

    // By the way, when the browser is closed, cookie in the browse
    // will be deleted.

    // When new request (log in by entering email and passwor) 
    //  from the client is created, new the session will create 
    //  new cookie encrypted key and user information and send them to the browser
    //  and the identified cookie information will be copied to the db. 
    req.session.destroy((err) => {
        if(err) throw new Error(err);
        res.redirect('/');
    });
}