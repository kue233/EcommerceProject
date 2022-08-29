const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const { User, Item } = require("../model/index");

router.get("/", async (req, resp) => {
    resp.redirect("/homePage.html")
})

// register
router.post("/register", async (req, resp, next) => {
    const { username, email, password } = req.body;
    const validEmail = (email) => {
        return String(email)
            .toLocaleLowerCase()
            .match(
                /\S+@\S+\.\S+/)
    }
    if (!validEmail(email)) {
        console.log("email format is not legit")
        resp.send("ef");
    } else {
        next();
    }
}, async (req, resp) => {
    try {
        const { username, email, password } = req.body;


        const user = await User.findOne({ email });

        if (!user) {
            await User.create({
                username: username,
                email: email,
                password: await bcrypt.hash(password, 10),
                cartItems: []
            })
            resp.send(true);
        } else {
            console.log("user exist");
            resp.send(false);
        }
    }
    catch (e) {
        console.log(e);
    }
})

// login
router.post("/login", async (req, resp) => {
    try {
        const { username, email, password } = req.body;

        const user = await User.findOne({ email });
        if (! await bcrypt.compare(password, user.password)) {
            console.log("email or password is wrong!");
            throw new Error("Email or password is wrong!");
        }
        const signed_jwt = jwt.sign(req.body, process.env.JWT_KEY);

        resp.setHeader("JWT", signed_jwt);
        resp.setHeader("currUser", user._id);

        let ifAdmin = username === "admin" && email === "admin@gmail.com" ? true : false;

        resp.status(200).send([ifAdmin, signed_jwt, user._id]);

    } catch (e) {
        console.log(e);
        resp.status(401).send({ errorMsg: e.message, redirect: "/login.html" });

    }
})


// product pages
router.post("/product", (req, resp) => {

    // console.log(req.body.product);
    resp.status(200).json(req.body.product);
    // resp.redirect("/productPage.html");

})
router.get("/product/:id", async (req, resp) => {
    let id = req.params;
    // console.log(id)
    // resp.redirect("/produc tPage.html");
    resp.render("product");
})


router.get("/homePage", async (req, resp) => {
    resp.redirect("/homePage.html");
})

router.get("/getData", async (req, resp) => {
    const data = await Item.find();
    var dataSet = new Set();
    data.forEach(async element => {
        dataSet.add(element["brand"])
    });
    const brands = Array.from(dataSet);
    var resArr = [];
    await brands.forEach(brand => {
        let arr = [];
        data.forEach(datum => {
            if (datum["brand"] === brand) {
                arr.push(datum);
            }
        });
        resArr.push(arr);
    });
    resp.json(resArr)
    // resp.render('homePage', { dataArr: resArr })
})

// get data with _id
router.get("/getData/:id", async (req, resp) => {

    const id = req.params.id;
    // console.log(id)
    const data = await Item.find({ _id: id });
    // console.log(data)
    resp.json(data)
    // resp.render('homePage', { dataArr: resArr })
})
router.get("/error", async (req, resp) => {
    resp.render('error', {
        title: 'error',
        condition: false,
        anyArray: [{
            id: 1,
            lala: "lala"
        }]
    })

})

// update cart
router.post("/updateCart", async (req, resp) => {
    const { prodId, currUser } = await req.body;
    // console.log(prodId);
    const data = await Item.find({ _id: prodId });
    const user = await User.find({ _id: currUser });
    // console.log(user[0]["cartItems"][0]["ammount"]); // find the current user
    var userCartItems = user[0]["cartItems"];

    if (userCartItems.filter(i => i["id"] === prodId).length > 0) { // if user's cart contains this item
        console.log("caintaing!------------------------")
        for (let i = 0; i < userCartItems.length; i++) {
            if (user[0]["cartItems"][i]["id"] === prodId) {
                console.log("find item!------------------------")
                const tempNum = Number(user[0]["cartItems"][i]["ammount"]) + 1;
                const temp = { id: prodId, ammount: tempNum };
                // userCartItems.push(temp);
                userCartItems[i]["ammount"] = tempNum;
                console.log(userCartItems[i]["ammount"])
                break;
            }

        }
        // const amt = 
    } else { // if not, create this item with 1 ammount in user's cart
        console.log("not caintaing!------------------------")
        const temp = { id: prodId, ammount: 1 };
        userCartItems.push(temp);

    }
    try {
        await User.updateOne(
            { _id: user[0]["_id"] },
            {
                $set: {
                    cartItems: userCartItems
                }
            }
        )

        // console.log(result)
    } catch (error) {
        console.log(error)
    }
    // const filter = { username: "kue3" };
    // const update = { cartItems: [prodId, 1] };



    resp.status(200);
})

// user's cart
router.post("/cart", async (req, resp) => {
    const { currUser } = await req.body;
    const user = await User.find({ _id: currUser });
    // console.log(user[0]["cartItems"])
    var itemIdArr = [];
    user[0]["cartItems"].forEach(item => {
        itemIdArr.push(new mongoose.Types.ObjectId(item["id"]));
    });
    // console.log(itemIdArr);
    const items = await Item.find({
        '_id': {
            $in: [
                new mongoose.Types.ObjectId("6308ed32d0990bf32140d712"),
                new mongoose.Types.ObjectId("6308ed32d0990bf32140d714")
            ]
        }
    });
    // console.log(items);
    var resArr = [];
    for (let index = 0; index < itemIdArr.length; index++) {
        resArr.push([items[index], user[0]["cartItems"][index]["ammount"]]);

    }
    // console.log(resArr)
    resp.json(resArr);
})


// add comment to a product
router.post("/addComment", async (req, resp) => {
    const { prodId, comment, rate } = req.body;
    const item = await Item.find({ _id: prodId });
    var itemComment = item[0]["comment"];
    var itemRate = item[0]["rating"];
    console.log(itemRate)
    console.log(rate)
    const newRate = (Number(itemRate) + Number(rate)) / 2;
    itemComment.push(comment);

    try {
        await Item.updateOne(
            { _id: prodId },
            {
                $set: {
                    comment: itemComment,
                    rating: newRate.toFixed(2)
                }
            }
        )

        // console.log(result)
    } catch (error) {
        console.log(error)
    }
    resp.status(200).send("")

})



// check out 
router.post("/checkout", async (req, resp) => {
    const { currUser } = await req.body;
    const user = await User.find({ _id: currUser });
    const cartItems = user[0]["cartItems"];
    var userOrders = user[0]["orders"];
    const newOrder = { products: cartItems, status: "Pending" };
    userOrders.push(newOrder);
    console.log(cartItems)
    if (cartItems.length != 0) {
        try {
            await User.updateOne(
                { _id: currUser },
                {
                    $set: {
                        cartItems: [],
                        orders: userOrders
                    }
                }
            )

            // console.log(result)
        } catch (error) {
            console.log(error)
        }
    }

    resp.status(200);
})


// user's order
router.post("/order", async (req, resp, next) => {
    const { currUser } = await req.body;
    const user = await User.find({ _id: currUser });
    const userOrders = user[0]["orders"];
    let productsArr = [];
    // console.log(userOrders);
    // console.log(userOrders[0]["products"]);

    for (let i = 0; i < userOrders.length; i++) {
        var order = [];
        for (let j = 0; j < userOrders[i]["products"].length; j++) {
            let id = userOrders[i]["products"][j]["id"];
            let item = await Item.find({ _id: id });
            // console.log(id)
            item = item[0];
            order.push({ item: item, ammount: userOrders[i]["products"][j]["ammount"] });
        }

        var statusAndOrder = {
            status: userOrders[i]["status"],
            products: order
        };
        productsArr.push(statusAndOrder);
    }


    // console.log(userOrders);
    // productsArr.push(userOrders[0]["status"])
    // userOrders.forEach(userOrder => {
    //     let tempArr = [];
    //     userOrder["products"].forEach(async element => {
    //         let id = element["id"];
    //         const item = await Item.find({ _id: id });
    //         const itemAndAmmount = { item: item[0], ammount: element["ammount"] };

    //         productsArr.push(itemAndAmmount);

    //     });
    // });


    setTimeout(() => {
        // console.log("productsArr---------------------")
        // console.log(productsArr)
        resp.status(200).json(productsArr);
    }, 300);

})


// admin page
router.get("/adminPage", async (req, resp) => {
    resp.status(200).redirect("/admin.html")
})

router.get("/admin", async (req, resp) => {
    const users = await User.find();
    var orders = [];
    users.forEach(user => {
        if (user["orders"].length != 0)
            orders.push({ name: user["username"], order: user["orders"] })
    });

    console.log(orders);
    resp.status(200).json(orders);
})

// cart add buttons
router.post("/cartAdd", async (req, resp) => {
    const { productId, currUser } = req.body;
    // console.log(productId)
    let userCart = await User.findOne({ _id: currUser });
    userCart = userCart["cartItems"];
    // console.log(userCart)

    userCart.forEach(prod => {
        if (prod["id"] == productId) {
            prod["ammount"] = Number(prod["ammount"]) + 1;
        }
    });

    console.log(userCart)
    try {
        await User.updateOne(
            { _id: currUser },
            {
                $set: {
                    cartItems: userCart,
                }
            }
        )

        // console.log(result)
    } catch (error) {
        console.log(error)
    }


    resp.status(200)
})


// cart delete buttons
router.post("/cartDelt", async (req, resp) => {
    const { productId, currUser } = req.body;
    // console.log(productId)
    let userCart = await User.findOne({ _id: currUser });
    userCart = userCart["cartItems"];
    // console.log(userCart)

    userCart.forEach(prod => {
        if (prod["id"] == productId) {
            prod["ammount"] = Number(prod["ammount"]) - 1;
        }
    });

    console.log(userCart)
    try {
        await User.updateOne(
            { _id: currUser },
            {
                $set: {
                    cartItems: userCart,
                }
            }
        )

        // console.log(result)
    } catch (error) {
        console.log(error)
    }


    resp.status(200)
})


// admin approve
router.post("/adminApprove", async (req, resp) => {
    const { username, transId } = req.body;
    console.log(transId, username);
    const user = await User.find({ username: username });
    let userOrders = user[0]["orders"];
    console.log(userOrders);
    let resOrders = [];
    // console.log(userOrders);
    userOrders.forEach(order => {
        if (order["id"] == new mongoose.Types.ObjectId(transId)) {
            order["status"] = "Approved";
        }
        resOrders.push(order);

    });
    console.log(resOrders);

    try {
        await User.updateOne(
            { username: username },
            {
                $set: {
                    orders: resOrders,
                }
            }
        )

        // console.log(result)
    } catch (error) {
        console.log(error)
    }


    resp.status(200).send(true);
})


// admin reject
router.post("/adminReject", async (req, resp) => {
    const { username, transId } = req.body;
    console.log(transId, username);
    const user = await User.find({ username: username });
    let userOrders = user[0]["orders"];
    console.log(userOrders);
    let resOrders = [];
    // console.log(userOrders);
    userOrders.forEach(order => {
        if (order["id"] == new mongoose.Types.ObjectId(transId)) {
            order["status"] = "Rejected";
        }
        resOrders.push(order);

    });
    console.log(resOrders);

    try {
        await User.updateOne(
            { username: username },
            {
                $set: {
                    orders: resOrders,
                }
            }
        )

        // console.log(result)
    } catch (error) {
        console.log(error)
    }


    resp.status(200).send(true);
})



module.exports = router;