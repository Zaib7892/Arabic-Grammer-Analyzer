const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
const Graph = require("../models/graphSchema");
const GraphFeedback = require("../models/feedbackSchema");
const Test = require("../models/testSchema");
const semGraph = require("../models/semGraph");
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
});

// Store graph
router.post("/storegraph", async (req, res) => {
    const { userId,name, graphData } = req.body;

    if (!name || !graphData) {
        res.status(422).json({ error: "Graph name and data are required" });
        return;
    }

    try {
        const newGraph = new Graph({
            userId, // Associate with the logged-in user
            name,
            graphData
        });

        const savedGraph = await newGraph.save();

        res.status(201).json({ status: 201, savedGraph });
    } catch (error) {
        res.status(422).json({ error: "Failed to store graph" });
        console.log("Catch block error in storing graph");
    }
});

// Retrieve all graphs
router.get("/graphs", async (req, res) => {
    try {
        // Find graphs for the authenticated user
        const graphs = await Graph.find({});

        if (!graphs) {
            return res.status(404).json({ error: "No graphs found" });
        }

        res.status(200).json({ status: 200, graphs });
    } catch (error) {
        console.error("Error retrieving graphs:", error);
        res.status(500).json({ error: "Failed to retrieve graphs" });
    }
});
//storing feedbacks
router.post("/storefeedback", async (req, res) => {
    const { userId, graphId, graphName, feedback, graphData } = req.body;

    if (!graphName || !feedback || !graphData) {
        return res.status(422).json({ error: "Graph Name, feedback, and graphData are required" });
    }

    try {
        // Check if feedback already exists for this graph and user
        const existingFeedback = await GraphFeedback.findOne({ userId, graphId });

        if (existingFeedback) {
            return res.status(409).json({ error: "Feedback for this graph is already stored." });
        }

        // If not, create a new feedback record
        const newFeedback = new GraphFeedback({
            userId,
            graphId,
            graphName,
            feedback,
            graphData,
        });

        const savedFeedback = await newFeedback.save();

        res.status(201).json({ status: 201, savedFeedback });
    } catch (error) {
        console.error("Error storing feedback:", error);
        res.status(500).json({ error: "Failed to store feedback" });
    }
});


//storing tests
router.post("/storetest",async (req,res) => {
    const {userId,graphId,name,graph}=req.body;
    if(!userId || !graphId){
        res.status(422).json({error:"Graph Id and User Id required"});
        return;
    }

    try {
        const newTest = Test({
            userId,
            graphId,
            name,
            graph,
        })
    const saveTest = await newTest.save();
    res.status(201).json({status:201,saveTest});
    
    } catch (error) {
        res.status(422).json({error:"Error storing test"});
        console.log("ERROR: ",error)
    }

});
//retreiving feedbacks
router.get('/feedbacks', async(req,res) =>{
    try {
        const feedbacks = await GraphFeedback.find({});
        // Check if no feedbacks are found
        if (feedbacks.length === 0) {
            return res.status(404).json({ error: "No feedback found" });
        }
        
        return res.status(200).json({status:200,feedbacks});
    } catch (error) {
        console.error("Error retrieving graphs:", error);
        res.status(500).json({ error: "Failed to retrieve feedbacks" });
    }
}) 

// delete feedback

router.delete('/delfeedback/:_id', async (req, res) => {
    const { _id } = req.params;
    try {
        const deletedFeedback = await GraphFeedback.findByIdAndDelete(_id);
        if (!deletedFeedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//updategraph

router.put('/updateSenGraph/:graphId', async (req, res) => {
    const { graphId } = req.params;
    const { graphData } = req.body;
    try {
        // Find the graph by its ID
        const sen_grapg = await Graph.findById(graphId);
        if (!sen_grapg) {
            return res.status(404).json({ message: 'Graph not found' });
        }

        // Update the edges
        sen_grapg.graphData = graphData;

        // Save the updated graph
        const updatedGraph = await sen_grapg.save();

        res.status(200).json(updatedGraph);
    } catch (error) {
        console.error('Error updating graph:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


//retreiving tests
router.get('/tests', async (req, res) => {
    try {
        const tests = await Test.find();
        if(tests.length==0){
            return res.status(404).json({ error: "No Test found" });
        }
        res.status(200).json({ tests });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving tests', details: error.message });
        console.error("ERROR:", error);
    }
});
 // storing semantic analysis
 router.post('/savesemGraph', async (req, res) => {
    const { userId, arabicText, nodes, edges } = req.body;
    try {
      const newGraph = new semGraph({
        userId,
        arabicText,
        nodes,
        edges,
      });
  
      await newGraph.save();
      res.status(201).json({ message: 'Graph saved successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save graph' });
    }
  });
// fetching semantic graphs for loggedIn user
router.get('/getUserGraphs', async (req, res) => {
    try {

      const userId = req.query.userId;
      // Validate that userId is provided
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Find graphs associated with the given userId
      const userGraphs = await semGraph.find({ userId });
  
      // Check if graphs exist for the user
      if (userGraphs.length === 0) {
        return res.status(404).json({ message: 'No graphs found for this user' });
      }
      
      // Send the graphs back to the client
      res.status(200).json(userGraphs);
    } catch (error) {
      console.error('Error fetching graphs:', error);
      res.status(500).json({ message: 'Server error while fetching graphs' });
    }
  });

  router.put('/updateSemGraph/:graphId', async (req, res) => {
    const { graphId } = req.params;
    const { edges } = req.body;

    try {
        // Find the graph by its ID
        const semg_raph = await semGraph.findById(graphId);

        if (!semg_raph) {
            return res.status(404).json({ message: 'Graph not found' });
        }

        // Update the edges
        semg_raph.edges = edges;

        // Save the updated graph
        const updatedGraph = await semg_raph.save();

        res.status(200).json(updatedGraph);
    } catch (error) {
        console.error('Error updating graph:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;





// 2 way connection
// 12345 ---> e#@$hagsjd
// e#@$hagsjd -->  12345

// hashing compare
// 1 way connection
// 1234 ->> e#@$hagsjd
// 1234->> (e#@$hagsjd,e#@$hagsjd)=> true