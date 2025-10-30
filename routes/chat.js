import express from "express" 
const router = express.Router();

router.get("/" , (req,res) => {
    res.json({message : "all chats appear here !!!"});
});

router.post("/" ,(req,res) =>{
    res.json({message:"new chats start"}) ;
});

export default router