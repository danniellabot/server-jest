import supertest from "supertest";
import { compare } from "bcryptjs";
import jwt from 'jsonwebtoken'
import { dbConnect, dbDisconnect } from "./setupdb";
import createServer from "./server";
import { register, login } from "./express-handlers";
//import * as handler from './generateToken'
import Post from "./models/Post";
import User from "./models/User";

beforeEach(async () => await dbConnect());
afterEach(async () => await dbDisconnect());

const app = createServer();
const mockRequest = (name, email, password) => {
	return {
		body: { name, email, password },
	};
};
const mockRequestLogin = (email, password) => {
	return {
		body: { email, password },
	};
};
const mockResponse = () => {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	return res;
};

jest.mock('jsonwebtoken')

test("Register the user and also profile is found on DB", async () => {

	const req = mockRequest('Hugo', 'hugo@gmail.com', 'secret');
	const res = mockResponse();
	await register(req, res);
	expect(res.status).toHaveBeenCalledWith(200);
	expect(res.json).toHaveBeenCalledWith({ "message": `Thanks for registering ${req.body.name}` });

	const findUser = await User.findOne({
		email: "hugo@gmail.com",
	});
	expect(findUser.name).toBe("Hugo");
	expect(findUser.email).toBe("hugo@gmail.com");
	expect(compare('secret', findUser.password)).toBeTruthy();

})

test('Return 400 if missing field either name, email or password for Register', async () => {
	const req = mockRequest();
	const res = mockResponse();
	await register(req, res);
	expect(res.status).toHaveBeenCalledWith(400);
	expect(res.json).toHaveBeenCalledWith({ "message": "Missing fields" });
});


test('Login user by returning payload and access token', async () => {

	const reqA = mockRequest('Hugo', 'hugo@gmail.com', 'secret');
	const resA = mockResponse();
	await register(reqA, resA);

	const findUser = await User.findOne({
		email: "hugo@gmail.com",
	});

	const reqB = mockRequestLogin('hugo@gmail.com', 'secret');
	const resB = mockResponse();

	jwt.sign.mockReturnValue('token');

	await login(reqB, resB);
	expect(resB.status).toHaveBeenCalledWith(200);
	expect(resB.json).toHaveBeenCalledWith({
		"accessToken": "token",
		"payload": {
			"email": reqB.body.email,
			"id": findUser._id,
			"name": findUser.name
		}
	});

})

test('Login returns error without a password or an email', async () => {
	const req = mockRequest('Hugo', 'hugo@gmail.com');
	const res = mockResponse();

	await login(req, res);
	expect(res.status).toHaveBeenCalledWith(400);
	expect(res.json).toHaveBeenCalledWith({ "message": "Please enter all fields" })
})

test('Login function returns error cant find a user no registered account', async () => {
	const req = mockRequest('Hugo', 'hugo@gmail.com', 'secret');
	const res = mockResponse();

	await login(req, res);
	expect(res.status).toHaveBeenCalledWith(400);
	expect(res.json).toHaveBeenCalledWith({ "message": "User doesn't exist!" })
})

test('Login function returns error incorrect password when entering wrong password', async () => {
	const req = mockRequest('Hugo', 'hugo@gmail.com', 'secret');
	const res = mockResponse();
	await register(req, res);

	const wrongPassword = mockRequest('Hugo', 'hugo@gmail.com', 'opensecret')
	await login(wrongPassword, res)
	expect(res.status).toHaveBeenCalledWith(400);
	expect(res.json).toHaveBeenCalledWith({ "message": "Incorrect password!" })
})

//router.get("/posts", async (req, res) => {
	//   const posts = await Post.find();
	//   res.send(posts);
	// });
	
	// router.post("/posts", async (req, res) => {
	//   const post = new Post({
	//     title: req.body.title,
	//     content: req.body.content,
	//   });
	//   await post.save();
	//   res.send(post);
	// });
	
	// router.get("/posts/:id", async (req, res) => {
	//     const post = await Post.findOne({ _id: req.params.id });
	//     if (!post) throw new Error(404, `Post doesn't exist`);
	//     res.send(post);
	// });
	
	// router.patch("/posts/:id", async (req, res) => {
	//   try {
	//     const post = await Post.findOne({ _id: req.params.id });
	
	//     if (req.body.title) {
	//       post.title = req.body.title;
	//     }
	
	//     if (req.body.content) {
	//       post.content = req.body.content;
	//     }
	
	//     await post.save();
	//     res.send(post);
	//   } catch {
	//     res.status(404);
	//     res.send({ error: "Post doesn't exist!" });
	//   }
	// });
	
	// router.delete("/posts/:id", async (req, res) => {
	//   try {
	//     await Post.deleteOne({ _id: req.params.id });
	
	//     res.status(204).send({ message: "Post deleted" });
	//   } catch (error) {
	//     res.status(404);
	//     res.send({ error: "Post doesn't exist!" });
	//   }
	// });
// test("GET /posts", async () => {
// 	const post = await Post.create({
// 		title: "Post 1",
// 		content: "Lorem ipsum",
// 	});

// 	await supertest(app)
// 		.get("/api/posts")
// 		.expect(200)
// 		.then((response) => {
// 			// Check the response type and length
// 			expect(Array.isArray(response.body)).toBeTruthy();
// 			expect(response.body.length).toEqual(1);

// 			// Check the response data
// 			expect(response.body[0]._id).toBe(post.id);
// 			expect(response.body[0].title).toBe(post.title);
// 			expect(response.body[0].content).toBe(post.content);
// 		});
// });

// test("GET /api/posts/:id", async () => {
// 	const post = await Post.create({
// 		title: "Post 1",
// 		content: "Lorem ipsum",
// 	});

// 	await supertest(app)
// 		.get("/api/posts/" + post.id)
// 		.expect(200)
// 		.then((response) => {
// 			expect(response.body._id).toBe(post.id);
// 			expect(response.body.title).toBe(post.title);
// 			expect(response.body.content).toBe(post.content);
// 		});
// });

// test("POST /api/posts", async () => {
// 	const data = {
// 		title: "Post 1",
// 		content: "Lorem ipsum",
// 	};

// 	await supertest(app)
// 		.post("/api/posts")
// 		.send(data)
// 		.expect(200)
// 		.then(async (response) => {
// 			// Check the response
// 			expect(response.body._id).toBeTruthy();
// 			expect(response.body.title).toBe(data.title);
// 			expect(response.body.content).toBe(data.content);

// 			// Check the data in the database
// 			const post = await Post.findOne({ _id: response.body._id });
// 			expect(post).toBeTruthy();
// 			expect(post.title).toBe(data.title);
// 			expect(post.content).toBe(data.content);
// 		});
// });

// test("PATCH /api/posts/:id", async () => {
// 	const post = await Post.create({
// 		title: "Post 1",
// 		content: "Lorem ipsum",
// 	});

// 	const data = {
// 		title: "New title",
// 		content: "dolor sit amet",
// 	};

// 	await supertest(app)
// 		.patch("/api/posts/" + post.id)
// 		.send(data)
// 		.expect(200)
// 		.then(async (response) => {
// 			// Check the response
// 			expect(response.body._id).toBe(post.id);
// 			expect(response.body.title).toBe(data.title);
// 			expect(response.body.content).toBe(data.content);

// 			// Check the data in the database
// 			const newPost = await Post.findOne({ _id: response.body._id });
// 			expect(newPost).toBeTruthy();
// 			expect(newPost.title).toBe(data.title);
// 			expect(newPost.content).toBe(data.content);
// 		});
// });

// test("ERROR PATCH /api/posts/:id", async () => {
// 	const post = await Post.create({
// 		title: "Post 1",
// 		content: "Lorem ipsum",
// 	});

// 	const data = {
// 		title: "New title",
// 		content: "dolor sit amet",
// 	};

// 	await supertest(app)
// 		.patch("/api/posts/" + "random1234567890")
// 		.send(data)
// 		.expect(404)
// 		.then(async (response) => {
// 			// Check the response
// 			expect(response.body.error).toBe("Post doesn't exist!");
// 		});
// });

// test("DELETE /api/posts/:id", async () => {
// 	const post = await Post.create({
// 		title: "Post 1",
// 		content: "Lorem ipsum",
// 	});

// 	await supertest(app)
// 		.delete("/api/posts/" + post.id)
// 		.expect(204)
// 		.then(async () => {
// 			expect(await Post.findOne({ _id: post.id })).toBeFalsy();
// 		});
// });
