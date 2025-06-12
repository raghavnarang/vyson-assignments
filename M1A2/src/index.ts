import 'dotenv/config';
import { db } from './db';
import { users, todos, todoStatus } from './db/schema';

const USERS_COUNT = 1_000_000;
const TODOS_COUNT = 10_000_000;
const BATCH_SIZE = 1000; // Process in smaller chunks to avoid memory issues

function randomName() {
  return `User_${Math.random().toString(36).substring(2, 10)}`;
}

function randomEmail(i: number) {
  return `user${i}@example.com`;
}

function randomTitle() {
  return `Todo_${Math.random().toString(36).substring(2, 12)}`;
}

function randomStatus() {
  return todoStatus[Math.floor(Math.random() * todoStatus.length)];
}

// Generator function to create users in chunks
function* generateUsers() {
  for (let i = 0; i < USERS_COUNT; i++) {
    yield {
      name: randomName(),
      email: randomEmail(i),
    };
  }
}

// Generator function to create todos in chunks
function* generateTodos(userIds: number[]) {
  for (let i = 0; i < TODOS_COUNT; i++) {
    yield {
      title: randomTitle(),
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      status: randomStatus(),
    };
  }
}

async function bulkInsertUsers() {
  console.log(`Inserting ${USERS_COUNT} users...`);
  const userIds: number[] = [];
  const userGenerator = generateUsers();
  let processed = 0;

  while (processed < USERS_COUNT) {
    const batch: typeof users.$inferInsert[] = [];
    for (let i = 0; i < BATCH_SIZE && processed < USERS_COUNT; i++) {
      const user = userGenerator.next().value;
      if (user) batch.push(user);
      processed++;
    }
    
    if (batch.length > 0) {
      const inserted = await db.insert(users).values(batch).returning({ id: users.id });
      userIds.push(...inserted.map(u => u.id));
      console.log(`Inserted ${processed}/${USERS_COUNT} users`);
    }
  }
  
  console.log(`Completed inserting ${userIds.length} users`);
  return userIds;
}

async function bulkInsertTodos(userIds: number[]) {
  console.log(`Inserting ${TODOS_COUNT} todos...`);
  const todoGenerator = generateTodos(userIds);
  let processed = 0;

  while (processed < TODOS_COUNT) {
    const batch: typeof todos.$inferInsert[] = [];
    for (let i = 0; i < BATCH_SIZE && processed < TODOS_COUNT; i++) {
      const todo = todoGenerator.next().value;
      if (todo) batch.push(todo);
      processed++;
    }
    
    if (batch.length > 0) {
      await db.insert(todos).values(batch);
      console.log(`Inserted ${processed}/${TODOS_COUNT} todos`);
    }
  }
  
  console.log(`Completed inserting ${processed} todos`);
}

async function main() {
  const start = Date.now();
  console.log(`Start time: ${new Date(start).toISOString()}`);
  try {
    console.log('Bulk inserting users...');
    const userIds = await bulkInsertUsers();
    console.log('Bulk inserting todos...');
    await bulkInsertTodos(userIds);
    const end = Date.now();
    console.log(`End time: ${new Date(end).toISOString()}`);
    console.log(`Bulk insert completed in ${(end - start) / 1000} seconds.`);
  } catch (error) {
    const end = Date.now();
    console.error('Error during bulk insert:', error);
    console.log(`End time: ${new Date(end).toISOString()}`);
    console.log(`Bulk insert failed after ${(end - start) / 1000} seconds.`);
  }
}

main(); 