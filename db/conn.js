const mongoose = require("mongoose");

const DB = "mongodb+srv://mz:123321@mernapp.d8xae6o.mongodb.net/Authusers?retryWrites=true&w=majority&appName=MERNapp"

mongoose.connect(DB,{
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(()=> console.log("DataBase Connected")).catch((errr)=>{
    console.log(errr);
})


