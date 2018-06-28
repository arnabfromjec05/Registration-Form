var express=require("express");
var app=express();
var bodyParser=require("body-parser")
var mongoose=require("mongoose");
var request = require('request');  //for api call
var Stud=require("./models/student.js");
var Admin=require("./models/admin.js");
var passport=require("passport");
var LocalStrategy=require("passport-local");

mongoose.connect("mongodb://localhost/stud");

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(require('express-session')({
    secret: 'Hello World!!',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.get("/home",function(req,res){
	res.render("home");
})

app.get("/home/form",function(req,res){
	res.render("form");
})

app.post("/home",function(req,res){
	var sem = Number(req.body.sem);
	var url="https://maps.googleapis.com/maps/api/geocode/json?address="+req.body.addr+"&key=AIzaSyAxj_uCd2-le3gTgwTol15iRF4IqTtw4iI";
	request(url,function(err,response,body){
		if(err)
		{
			console.log("api error");
			console.log(err);
		}
		else
		{
			var data=JSON.parse(body);
			var latitude=data.results[0].geometry.location.lat;
			var longitude=data.results[0].geometry.location.lng;

			if(sem==1)
			{
			Stud.create({
				name: (req.body.firstName+" "+req.body.lastName),
				gender: req.body.gender,
				bday: req.body.bday,
				fatherName: req.body.fatherName,
				addr: {lat:latitude,long:longitude},
				city: req.body.city,
				state: req.body.state,
				email: req.body.email,
				phone: Number(req.body.phone),
				usn: req.body.usn.toLowerCase(),
				branch: req.body.branch,
				sem: Number(req.body.sem),
				cgpa: Number(req.body.cgpa),
				admMode: req.body.admMode
			},function(err,student){
					if(err)
						console.log(err);
					else
					{
						console.log("Record created!!");
						// console.log(student);
						res.redirect("/home");
					}
				})
			}
			else 
			{
			Stud.findOne({usn:(req.body.usn).toLowerCase()},function(err1,student){
				if(err)
				{
					console.log(err1);
				}
				else
					{
						if(student==null)
						{
							console.log("Unknown User");
							return res.redirect("/home/form");
						}
						if(Number(req.body.sem)>(student.sem+1)||Number(req.body.sem)<(student.sem+1))
						{
							console.log("Wrong Credentials")
							return res.redirect("/home/form");
						}
						student.name = (req.body.firstName+" "+req.body.lastName);
						student.gender = req.body.gender;
						student.bday = req.body.bday;
						student.fatherName = req.body.fatherName;
						student.addr.lat = latitude;
						student.addr.long = longitude;
						student.city = req.body.city;
						student.state = req.body.state;
						student.email = req.body.email;
						student.phone = Number(req.body.phone);
						student.usn = req.body.usn.toLowerCase();
						student.branch = req.body.branch;
						student.sem = Number(req.body.sem);
						student.cgpa = Number(req.body.cgpa);
						student.admMode = req.body.admMode;

						student.save(function(err2,student){
							if(err)
							{
								console.log(err2);
							}
							else
							{
								console.log("Record updated!!");
								// console.log(student);
								res.redirect("/home");
							}
						})
					}
				})
			}
		}
	})
	
})

app.post("/student/search",isLoggedIn,function(req,res){
	res.redirect("/student/"+req.body.usnsearch);
})

app.get("/student/:id",isLoggedIn,function(req,res){
	Stud.findOne({usn:req.params.id},function(err,student){
		if(err)
			console.log(err);
		else
		{
			res.render("student",{student:student});
		}
	})
})


//auth routes

app.get("/home/admin",isLoggedIn,function(req,res){
	Stud.find({},function(err,students){
		if(err)
			console.log(err);
		else
		{
			// console.log(students);
			res.render("admin",{students:students});
		}
	})
	
})

app.get("/home/admin/register",isLoggedIn,function(req,res){
	res.render("register");
})

app.post("/home/admin/register",isLoggedIn,function(req,res){
	Admin.register(new Admin({username:req.body.username}),req.body.password,function(err,admin){
		if(err)
		{
			console.log(err);
			return res.render("register");
		}
		else
		{
			passport.authenticate("local")(req,res,function(){
				res.redirect("/home/admin");
			})
		}
	})
})

app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login",passport.authenticate("local",{
	successRedirect:"/home/admin",
	failureRedirect:"/login"
}),function(req,res){

})

app.get("/home/admin/logout",function(req,res){
	req.logout();
	res.redirect("/home");
})

function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
	{
		return next();
	}
	res.redirect("/login");
}


app.listen(8080,function(){
	console.log("Server started!!");
})