//Docs
//1. itemName is name of item when click on + sign to add Item to todo List 
//2. TodoItemToAdd is used to add into mongoose mondel collection with reference to itemName
//3. checkedItemId is happened when someone checked on checkBox, used in pots = delete route
//4. listSchema is used for any custome page and will use name as String and also will take itemSchema array inside to set 3 default list on the custome page.
//5. ListForListSchema is object model for listSchema mentioned on point 4(above)
//6. listName is just name of button when triggered from list.ejs file
//7. hiddenListName is basically hidden input type to delete in items in particular list

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//0. Connection estable
mongoose.connect('mongodb+srv://admin-suraj:Qwerty123@@cluster0.osj3h.mongodb.net/todoDB', {useNewUrlParser: true, useUnifiedTopology: true});

//1. Define a Schema
const itemSchema = {
  name: String
};

//2. Then Mongoose model(TodoIten is a mongoose model with item collections which follows itemSchema)
const TodoItem = mongoose.model("item", itemSchema);

//3. Then new documents using TodoItem mongoose model
const TodoItem1 = new TodoItem({
  name: "Go to Market"
});
const TodoItem2 = new TodoItem({
  name: "Mee Gf"
});
const TodoItem3 = new TodoItem({
  name: "Have coffee"
});

//4. Putting all document TodoItem model into array
const defaultItems = [TodoItem1, TodoItem2, TodoItem3];

const listSchema = {
  name: String,
  arrItems: [itemSchema]
};

//Model for custom list schema
const CustomList = mongoose.model("customList", listSchema);





app.get("/", function(req, res) {

  TodoItem.find({}, function(err, succ){
    // console.log(succ);
    if(succ.length === 0){
      TodoItem.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully added to DB");
        }
        res.redirect("/");
      }); 
    }else{
      res.render("list",  {listTitle: "Today", newListItems: succ})
    }

  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const TodoItemToAdd = new TodoItem({
    name: itemName
  });
  if(listName === "Today"){
    TodoItemToAdd.save();
    res.redirect("/");
  }else{
    CustomList.findOne({name: listName}, function(err, succ){
      succ.arrItems.push(TodoItemToAdd);
      succ.save();
      res.redirect(`/${listName}`);
    });
  }

});


app.get("/:customePage", function(req, res){
  const page = _.capitalize(req.params.customePage);

  CustomList.findOne({name: page}, function(err, succ){
    if(err){
      console.log(err);
    }else{
      if(!succ){
        //Create a new list 
        const CustomList1 = new CustomList({
          name: page,
          arrItems: defaultItems
        }) 
        CustomList1.save();  
        res.redirect(`/${page}`)
      }else{
        //Show existing list
        res.render("list", {listTitle: succ.name, newListItems: succ.arrItems}); 
      }
    }
  })


});


app.post("/delete", function(req, res){
  const hiddenListName = req.body.listName;
  const checkedItemId  = req.body.checkBox;

  if(hiddenListName === "Today"){
    TodoItem.findByIdAndRemove(checkedItemId, function(err, succ){
      if(err){
        console.log(err);
      }else{
        // console.log(`This item:  ${succ} is deleted`);
        res.redirect("/");
      }
    });
  }else{
    CustomList.findOneAndUpdate({name: hiddenListName}, {$pull: {arrItems:{_id: checkedItemId}}}, function(err, succ){
      if(!err){
        res.redirect(`/${hiddenListName}`);
      }
    });
  }

});


let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
