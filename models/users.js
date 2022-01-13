const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    
    image: { type: String, required: true },

    password: { type: String, required: true, minlength: 13 },
    
    places: [{ type: mongoose.Types.ObjectId, required: true, ref:"Places" }] //this is an array because 1 user can have many places
    
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Users", userSchema);