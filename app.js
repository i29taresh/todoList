//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect('mongodb+srv://i29taresh:CA63hw51@cluster0.ohbceb0.mongodb.net/todoListDB', {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({ name: 'buy coffee' });
const item2 = new Item({ name: 'brew coffee' });
const item3 = new Item({ name: 'drink coffee' });

const defaultItems= [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemSchema]
});

const List = mongoose.model('List', listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully added Default items");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name : itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const deleteItemId = req.body.checkbox;
  const listName= req.body.listName;
  console.log(req.body);

  if(listName === "Today"){
    console.log("yes");
    Item.findByIdAndRemove(deleteItemId, function(err){
      if(!err){
        console.log("successfully deleted checked item");
        res.redirect("/");
      }
      else{
        console.log(err);
      }
    });
  }
  else{
    console.log("yes");
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItemId}}}, function(err){
      if(!err){
        res.redirect("/" + listName);
      }else{
        console.log(err);
      }
    })
  }
})

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        console.log("list found");
        res.render("list", {listTitle : foundList.name, newListItems: foundList.items});
      }
    }
  });
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

