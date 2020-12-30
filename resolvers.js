// Package needed for using subscriptions, PubSub stand for publish / subscribe
const { PubSub } = require('graphql-subscriptions');
const db = require('./db');

const MESSAGE_ADDED = 'MESSAGE_ADDED';

// creates a PubSub instance
const pubSub = new PubSub();

function requireAuth(userId) {
  if (!userId) {
    throw new Error('Unauthorized');
  }
}

const Query = {
  messages: (_root, _args, { userId }) => {
    requireAuth(userId);
    return db.messages.list();
  },
};

const Mutation = {
  addMessage: (_root, { input }, { userId }) => {
    requireAuth(userId);
    const messageId = db.messages.create({ from: userId, text: input.text });
    const message = db.messages.get(messageId);
    pubSub.publish(MESSAGE_ADDED, { messageAdded: message });
    return message;
  },
};

// Subscriptions are quite different from regular resolvers because they dont return a single value
// We use the subscribe method in which we pass an iterator that can iterate multiple values
// and notify all the subscribers
const Subscription = {
  messageAdded: {
    subscribe: () => pubSub.asyncIterator(MESSAGE_ADDED),
  },
};

module.exports = { Query, Mutation, Subscription };
