# Creeperlist-Api

The Creeperlist-Api handles voting, adding servers, keeping track of server ids, determining whether or not a server is sponsored, and, of course, registering and logging in.


A run thorugh of how everything works

```import gql from 'graphql-tag';
import express from 'express';
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';

const port = process.env.PORT || 8080;

// Define APIs using GraphQL SDL
const typeDefs = gql`
   type Query {
       sayHello(name: String!): String!
   }

   type Mutation {
       sayHello(name: String!): String!
   }
`;

// Define resolvers map for API definitions in SDL
const resolvers = {
   Query: {
       sayHello: (obj, args, context, info) => {
           return `Hello ${ args.name }!`;
       }
   },

   Mutation: {
       sayHello: (obj, args, context, info) => {
           return `Hello ${ args.name }!`;
       }
   }
};

// Configure express
const app = express();

// Build GraphQL schema based on SDL definitions and resolvers maps
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Build Apollo server
const apolloServer = new ApolloServer({ schema });
apolloServer.applyMiddleware({ app });

// Run server
app.listen({ port }, () => {
   console.log(`🚀 Api ready at http://localhost:${ port }${ apolloServer.graphqlPath }`);
});
```
After this, we can run our server using the command npm run serve, and if we navigate in a web browser to the URL http://localhost:8080/graphql, GraphQL’s interactive visual shell, called Playground, will open, where we can execute GraphQL queries and mutations and see the result data.

In the GraphQL world, API functions are divided into three sets, called queries, mutations, and subscriptions:
Queries are used by the client to request the data it needs from the server.
Mutations are used by the client to create/update/delete data on the server.
Subscriptions are used by the client to create and maintain real-time connection to the server. This enables the client to get events from the server and act accordingly.
In our article, we will discuss only queries and mutations. Subscriptions are a huge topic—they deserve their own article and are not required in every API implementation.
Advanced Scalar Data Types

Very soon after playing with GraphQL, you will discover that SDL provides only primitive data types, and advanced scalar data types such as Date, Time, and DateTime, which are an important part of every API, are missing. Fortunately, we have a library which helps us to solve this problem, and it’s called graphql-iso-date. After installing it, we will need to define new advanced scalar data types in our schema and connect them to the implementations provided by the library:
```
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';

// Define APIs using GraphQL SDL
const typeDefs = gql`
   scalar Date
   scalar Time
   scalar DateTime
  
   type Query {
       sayHello(name: String!): String!
   }

   type Mutation {
       sayHello(name: String!): String!
   }
`;

// Define resolvers map for API definitions in SDL
const resolvers = {
   Date: GraphQLDate,
   Time: GraphQLTime,
   DateTime: GraphQLDateTime,

   Query: {
       sayHello: (obj, args, context, info) => {
           return `Hello ${ args.name }!`;
       }
   },

   Mutation: {
       sayHello: (obj, args, context, info) => {
           return `Hello ${ args.name }!`;
       }
   }
};
```
Along with date and time, there also exists other interesting scalar data type implementations, which can be useful for you depending on your use case. For example, one of them is graphql-type-json, which gives us the ability to use dynamic typing in our GraphQL schema and pass or return untyped JSON objects using our API. There also exists library graphql-scalar, which gives us the ability to to define custom GraphQL scalars with advanced sanitization/validation/transformation.

If needed, you can also define your custom scalar data type and use it in your schema, as shown above. This isn’t difficult, but discussion of it is outside the scope of this article—if interested, you can find more advanced information in the Apollo documentation.
Splitting Schema

After adding more functionality to your schema, it will start growing and we will understand that it’s impossible to keep the whole set of definitions in one file, and we need to split it up into small pieces to organize the code and make it more scalable for a bigger size. Fortunately schema builder function makeExecutableSchema, provided by Apollo, also accepts schema definitions and resolvers maps in the form of an array. This gives us the ability to split our schema and resolvers map into smaller parts. This is exactly what I have done in my sample project; I have divided the API into the following parts:

    auth.api.graphql – API for user authentication and registration
    root.api.graphql – Root of schema and common definitions (like advanced scalar types)
    user.api.graphql – CRUD API for user management

During the splitting schema, there is the one thing we must consider. One of the parts must be the root schema and the other ones must extend the root schema. This sounds complex, but in reality it’s quite simple. In the root schema, queries and mutations are defined like this:
```
type Query {

    ...
}

type Mutation {
    ...
}

And in the other ones, they are defined like this:

extend type Query {
    ...
}

extend type Mutation {
    ...
}
```
And that’s all.
Authentication and Authorization

In the majority of API implementations, there is a requirement to restrict global access and provide some kind of rule-based access policies. For this we have to introduce in our code: Authentication—to confirm user identity—and Authorization, to enforce rule-based access policies.

In the GraphQL world, like the REST world, generally for authentication we use JSON Web Token. To validate the passed JWT token, we need to intercept all incoming requests and check the authorization header on them. For this, during the creation of Apollo server, we can register a function as a context hook, which will be called with the current request that creates the context shared across all resolvers. This can be done like this:
```
// Configure express
const app = express();

// Build GraphQL schema based on SDL definitions and resolver maps
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Build Apollo server
const apolloServer = new ApolloServer({
    schema,
    
    context: ({ req, res }) => {
            const context = {};

            // Verify jwt token
            const parts = req.headers.authorization ? req.headers.authorization.split(' ') : [''];
            const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : undefined;
            context.authUser = token ? verify(token) : undefined;

            return context;
    }
});
apolloServer.applyMiddleware({ app });

// Run server
app.listen({ port }, () => {
   console.log(`🚀 Api ready at http://localhost:${ port }${ apolloServer.graphqlPath }`);
});
```
Here, if the user will pass a correct JWT token, we verify it and store the user object in context, which will be accessible for all resolvers during the request execution.

We verified user identity, but our API is still globally accessible and nothing prevents our users from calling it without authorization. One way to prevent this is to check the user object in context directly in every resolver, but this is a very error-prone approach because we have to write a lot of boilerplate code and we can forget to add the check when adding a new resolver. If we take a look at REST API frameworks, generally such kinds of problems are solved using HTTP request interceptors, but in the case of GraphQL, it doesn’t make sense because one HTTP request can contain multiple GraphQL queries, and if we still add it, we get access only to the raw string representation of the query and have to parse it manually, which definitely isn’t a good approach. This concept doesn’t translate well from REST to GraphQL.

So we need some kind of way to intercept GraphQL queries, and this way is called prisma-graphql-middleware. This library lets us run arbitrary code before or after a resolver is invoked. It improves our code structure by enabling code reuse and a clear separation of concerns.

The GraphQL community has already created a bunch of awesome middleware based on Prisma middleware library, which solves some specific use cases, and for user authorization, there exists a library called graphql-shield, which helps us to create a permission layer for our API.

After installing graphql-shield, we can introduce a permission layer for our API like this:
```
import { allow } from 'graphql-shield';

const isAuthorized = rule()(
   (obj, args, { authUser }, info) => authUser && true
);

export const permissions = {
    Query: {
        '*': isAuthorized,
          sayHello: allow
    },

    Mutation: {
        '*': isAuthorized,
        sayHello: allow
    }
}
```
And we can apply this layer as middleware to our schema like this:
```
// Configure express
const app = express();

// Build GraphQL schema based on SDL definitions and resolver maps
const schema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithMiddleware = applyMiddleware(schema, shield(permissions, { allowExternalErrors: true }));

// Build Apollo server
const apolloServer = new ApolloServer({ schemaWithMiddleware });
apolloServer.applyMiddleware({ app });

// Run server
app.listen({ port }, () => {
    console.log(`🚀 Api ready at http://localhost:${ port }${ apolloServer.graphqlPath }`);
})
```
Here when creating a shield object, we set allowExternalErrors to true, because by default, the shield’s behavior is to catch and handle errors which occur inside resolvers, and this wasn’t acceptable behavior for my sample application.

In the example above, we only restricted access to our API for authenticated users, but the shield is very flexible and, using it, we can implement a very rich authorization schema for our users. For example, in our sample application, we have two roles: USER and USER_MANAGER, and only users with the role USER_MANAGER can call user administration functionality. This is implemented like this:
```
export const isUserManager = rule()(
    (obj, args, { authUser }, info) => authUser && authUser.role === 'USER_MANAGER'
);

export const permissions = {
    Query: {
        userById: isUserManager,
        users: isUserManager
    },

    Mutation: {
        editUser: isUserManager,
        deleteUser: isUserManager
    }
}
```
One more thing I want to mention is how to organize middleware functions in our project. As with schema definitions and resolvers maps, it’s better to split them per schema and keep in separate files, but unlike Apollo server, which accepts arrays of schema definitions and resolvers maps and stitches them for us, Prisma middleware library doesn’t do this and accepts only one middleware map object, so if we split them we have to stitch them back manually. To see my solution for this problem, please see the ApiExplorer class in the sample project.
Validation

GraphQL SDL provides very limited functionality to validate user input; we can only define which field is required and which is optional. Any further validation requirements, we must implement manually. We can apply validation rules directly in the resolver functions, but this functionality really doesn’t belong here, and this is another great use case to user GraphQL middlewares. For example, let’s use user signup request input data, where we have to validate if username is a correct email address, if the password inputs match, and the password is strong enough. This can be implemented like this:
```
import { UserInputError } from 'apollo-server-express';
import passwordValidator from 'password-validator';
import { isEmail } from 'validator';

const passwordSchema = new passwordValidator()
    .is().min(8)
    .is().max(20)
    .has().letters()
    .has().digits()
    .has().symbols()
    .has().not().spaces();

export const validators = {
    Mutation: {
        signup: (resolve, parent, args, context) => {
            const { email, password, rePassword } = args.signupReq;

            if (!isEmail(email)) {
                throw new UserInputError('Invalid Email address!');
            }

            if (password !== rePassword) {
                throw new UserInputError('Passwords don\'t match!');
            }

            if (!passwordSchema.validate(password)) {
                throw new UserInputError('Password is not strong enough!');
            }

            return resolve(parent, args, context);
        }
    }
}
```
And we can apply the validators layer as middleware to our schema, along with a permissions layer like this:
```
// Configure express
const app = express();

// Build GraphQL schema based on SDL definitions and resolver maps
const schema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithMiddleware = applyMiddleware(schema, validators, shield(permissions, { allowExternalErrors: true }));

// Build Apollo server
const apolloServer = new ApolloServer({ schemaWithMiddleware });
apolloServer.applyMiddleware({ app })
```
N + 1 Queries

Another problem to consider, which happens with GraphQL APIs and is often overlooked, is N + 1 queries. This problem happens when we have a one-to-many relationship between types defined in our schema.

It’s easy to guess—during execution, the resolver was first called for the books query, which returned list of books and then each book object was called creator field resolver, and this behavior caused N + 1 database queries. If we don’t want to explode our database, such kind of behavior isn’t really great.

To solve the N + 1 queries problem, Facebook developers created a very interesting solution called DataLoader, which is described on its README page like this:

“DataLoader is a generic utility to be used as part of your application’s data fetching layer to provide a simplified and consistent API over various remote data sources such as databases or web services via batching and caching”

It’s not very straightforward to understand how DataLoader works, so let’s first see the example which solves the problem demonstrated above and then explain the logic behind it.

In our sample project, DataLoader is defined like this for the creator field:
```
export class UserDataLoader extends DataLoader {
   constructor() {
       const batchLoader = userIds => {
           return userService
               .findByIds(userIds)
               .then(
                   users => userIds.map(
                       userId => users.filter(user => user.id === userId)[0]
                   )
               );
       };

       super(batchLoader);
   }

   static getInstance(context) {
       if (!context.userDataLoader) {
           context.userDataLoader = new UserDataLoader();
       }

       return context.userDataLoader;
   }
}

Once we have defined UserDataLoader, we can change the resolver of the creator field like this:

export const resolvers = {
   Query: {
      ...
   },

   Mutation: {
      ...
   },

   Book: {
      creator: ({ creatorId }, args, context, info) => {
         const userDataLoader = UserDataLoader.getInstance(context);

         return userDataLoader.load(creatorId);
      },
      ...
   }
}
```
Here, we can see that N + 1 database queries were reduced to two queries, where first one selects the list of books and the second one selects the list of users presented as creators in the list of books. Now let’s explain how DataLoader achieves this result.

The primary feature of DataLoader is batching. During single execution phase, DataLoader will collect all distinct ids of all individual load function calls and then call the batch function with all requested ids. One important thing to remember is that DataLoaders’ instances cannot be reused, once batch function is called, returned values will be cached in instance forever. Due to this behavior, we must create new instance of DataLoader per each execution phase. To achieve this we have created a static getInstance function, which checks if the instance of DataLoader is presented in a context object and, if not found, creates one. Remember that a new context object is created for each execution phase and is shared across all resolvers.

A batch loading function of DataLoader accepts an array of distinct requested IDs and returns a promise which resolves to an array of corresponding objects. When writing a batch loading function, we must remember two important things:

    The array of results must be the same length as the array of requested IDs. For example, if we requested the IDs [1, 2, 3], the returned array of results must contain exactly three objects: ```[{ "id": 1, “fullName”: “user1” }, { “id”: 2, “fullName”: “user2” }, { “id”: 3, “fullName”: “user3” }]```
    Each index in the array of results must correspond to the same index in the array of requested IDs. For example, if the array of requested IDs has the following order: ```[3, 1, 2]```, then the returned array of results must contain objects exactly in the same order: ```[{ "id": 3, “fullName”: “user3” }, { “id”: 1, “fullName”: “user1” }, { “id”: 2, “fullName”: “user2” }]```

In our example, we ensure that order of results matches the order of requested IDs with the following code:
```
then(
   users => userIds.map(
       userId => users.filter(user => user.id === userId)[0]
   )
)
```
Security

And last but not least, I want to mention security. With GraphQL, we can create very flexible APIs and give the user rich capabilities for how to query the data. This grants quite a lot of power to the client’s side of the application and, as Uncle Ben said, “With great power comes great responsibility.” Without proper security, a malicious user can submit an expensive query and cause a DoS (Denial of Service) attack on our server.

The first thing we can do to protect our API is to disable the introspection of GraphQL schema. By default, a GraphQL API server exposes the capability to introspect its entire schema, which is generally used by interactive visual shells like GraphiQL and Apollo Playground, but it also can be very useful for a malicious user to construct a complex query based on our API. We can disable this by setting the introspection parameter to false when creating the Apollo Server:
```
// Configure express
const app = express();

// Build GraphQL schema based on SDL definitions and resolver maps
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Build Apollo server
const apolloServer = new ApolloServer({ schema, introspection: false });
apolloServer.applyMiddleware({ app });

// Run server
app.listen({ port }, () => {
   console.log(`🚀 Api ready at http://localhost:${ port }${ apolloServer.graphqlPath }`);
})
```
The next thing we can do to protect our API is to limit the depth of the query. This is especially important if we have a cyclic relationship between our data types.


It’s clear that with enough nesting, such a query can easily explode our server. To limit the depth of queries, we can use a library called graphql-depth-limit. Once we have installed, it we can apply a depth restriction when creating Apollo Server, like this:

```
// Configure express
const app = express();

// Build GraphQL schema based on SDL definitions and resolver maps
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Build Apollo server
const apolloServer = new ApolloServer({ schema, introspection: false, validationRules: [ depthLimit(5) ] });
apolloServer.applyMiddleware({ app });

// Run server
app.listen({ port }, () => {
   console.log(`🚀 Api ready at http://localhost:${ port }${ apolloServer.graphqlPath }`);
})
```
Here, we limited the maximum depth of queries to five.

## Note

It's possible that the Readme is out of current or that it's too advanced for the actual source code. 