const mongoose = require("mongoose");
const { number } = require("yargs");
const Schema = mongoose.Schema;
const products = require("./data");

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    cartItems: [{ id: String, ammount: Number }],
    orders: [{
        products: Array,
        status: {
            type: String,
            enum: ['Pending', 'Approved','Rejected'],
            default: 'Pending'
        }
    }],
});

const itemSchema = new Schema({
    title: { type: String },
    description: { type: String },
    price: { type: Number },
    brand: String,
    category: String,
    thumbnail: { type: String },
    comment: Array,
    rating: Number
})

const User = mongoose.model("users", userSchema);
const Item = mongoose.model("items", itemSchema);


// products.forEach(product => {
//     const { title, description, price, brand, category, thumbnail, rating } = product;
//     setTimeout(() => {

//     }, 1000);

// // });
// const { title, description, price, brand, category, thumbnail, rating } = products[0];
// new Item({
//     title: title,
//     description: description,
//     price: price,
//     brand: brand,
//     category: category,
//     thumbnail: thumbnail,
//     comment: [],
//     rating: rating
// }).save();

module.exports = { User, Item };