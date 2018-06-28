var mongoose=require("mongoose");

var studSchema = new mongoose.Schema({
	name : String,
	gender: String,
	bday: String,
	fatherName:String,
	addr:{lat:Number,long:Number},
	city:String,
	state:String,
	email:String,
	phone:Number,
	usn:String,
	branch:String,
	sem:Number,
	cgpa:Number,
	admMode:String
})

module.exports=mongoose.model("Student",studSchema);