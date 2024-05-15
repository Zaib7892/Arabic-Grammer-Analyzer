const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
var bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");


// for user registration

router.post("/register", async (req, res) => {

    const { fname, email, password, cpassword } = req.body;

    if (!fname || !email || !password || !cpassword) {
        res.status(422).json({ error: "fill all the details" })
    }

    try {

        const preuser = await userdb.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This Email is Already Exist" })
        } else if (password !== cpassword) {
            res.status(422).json({ error: "Password and Confirm Password Not Match" })
        } else {
            const finalUser = new userdb({
                fname, email, password, cpassword
            });

            // here password hasing

            const storeData = await finalUser.save();

            // console.log(storeData);
            res.status(201).json({ status: 201, storeData })
        }

    } catch (error) {
        res.status(422).json(error);
        console.log("catch block error");
    }

});




// user Login

router.post("/login", async (req, res) => {
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(422).json({ error: "fill all the details" })
        
    }

    try {
       
       console.log("Entered into try block");
       const userValid = await userdb.findOne({email:email});
       //console.log("Step 1", userValid);
        if(userValid){
            console.log("Step 2");
            const isMatch = await bcrypt.compare(password,userValid.password);
            console.log("isMatch",isMatch)
            if(isMatch == false){
                toast.fail()
                res.status(422).json({ error: "invalid details"});
            }else{

                // token generate

                console.log("generating token");
                const token = await userValid.generateAuthtoken();
                console.log("Token Generated Successfully");
                console.log(token);
                // cookiegenerate
                console.log("Generating Cookie");
                res.cookie("usercookie",token,{
                    expires:new Date(Date.now()+9000000),
                    httpOnly:true
                });
                console.log("Cookie Generated Successfully");
                const result = {
                    userValid,
                    token
                }
                console.log("User is valid");
                res.status(201).json({status:201,result})
                console.log("User validated-> Status 201 called");
            }
        }
        

    } catch (error) {
        console.log("Going to 401");
        res.status(401).json(error);
        console.log("catch block");
    }
});



// user valid
router.get("/validuser",authenticate,async(req,res)=>{
    try {
        const ValidUserOne = await userdb.findOne({_id:req.userId});
        console.log("---------1------");
        res.status(201).json({status:201,ValidUserOne});
    } catch (error) {
        console.log("---------2------");
        res.status(401).json({status:401,error});
    }
});


// user logout

router.get("/logout",authenticate,async(req,res)=>{
    try {
        req.rootUser.tokens =  req.rootUser.tokens.filter((curelem)=>{
            return curelem.token !== req.token
        });

        res.clearCookie("usercookie",{path:"/"});

        req.rootUser.save();
        console.log("---------3------");
        res.status(201).json({status:201})

    } catch (error) {
        console.log("---------4------");
        res.status(401).json({status:401,error})
    }
})


module.exports = router;



// 2 way connection
// 12345 ---> e#@$hagsjd
// e#@$hagsjd -->  12345

// hashing compare
// 1 way connection
// 1234 ->> e#@$hagsjd
// 1234->> (e#@$hagsjd,e#@$hagsjd)=> true



